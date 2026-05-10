/**
 * Read-only checks after 004+006.
 *
 *   npm run db:verify-004-006
 * (uses `SUPABASE_DB_URL` from env or `.env.local`)
 */
import postgres from 'postgres';
import { loadEnvFromRepo } from './load-env-from-files.mjs';

loadEnvFromRepo();

const url = process.env.SUPABASE_DB_URL;
if (!url || !url.startsWith('postgres')) {
  console.error('Missing SUPABASE_DB_URL.');
  process.exit(1);
}

const sql = postgres(url, { max: 1, ssl: 'require' });

try {
  const [row] = await sql`
    select
      (to_regclass('public.activity_logs') is not null) as has_activity_logs,
      exists(
        select 1 from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and p.proname = 'is_course_staff'
      ) as has_is_course_staff,
      exists(select 1 from storage.buckets where id = 'lesson-files') as has_lesson_files_bucket,
      (select file_size_limit from storage.buckets where id = 'lesson-files') as bucket_size_limit,
      (select public from storage.buckets where id = 'lesson-files') as bucket_public
  `;
  console.log(JSON.stringify(row, null, 2));
  const ok =
    row.has_activity_logs &&
    row.has_is_course_staff &&
    row.has_lesson_files_bucket &&
    Number(row.bucket_size_limit) === 52428800 &&
    row.bucket_public === true;
  if (!ok) {
    console.error(
      'VERIFY_FAIL: expected activity_logs, is_course_staff(), lesson-files bucket (50MB, public).',
    );
    process.exit(1);
  }
  console.error('VERIFY_OK');
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await sql.end({ timeout: 5 });
}
