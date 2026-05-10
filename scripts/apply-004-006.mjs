/**
 * Applies 004 (Storage lesson-files) then 006 (staff/superadmin, activity_logs, RPCs).
 *
 * Set `SUPABASE_DB_URL` to the Postgres URI (Dashboard → Project Settings → Database → URI).
 * Put it in `.env.local` or export in the shell, then: `npm run db:apply-004-006`
 *
 * Or paste `supabase/migrations/004_storage_lesson_files.sql` then `006_admin_superadmin_split.sql`
 * in the Supabase SQL Editor (same order).
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import { loadEnvFromRepo } from './load-env-from-files.mjs';

loadEnvFromRepo();

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const url = process.env.SUPABASE_DB_URL;
if (!url || !url.startsWith('postgres')) {
  console.error(
    'Missing SUPABASE_DB_URL. Set it to your Postgres connection URI (not the anon key).',
  );
  process.exit(1);
}

const files = [
  join(root, 'supabase/migrations/004_storage_lesson_files.sql'),
  join(root, 'supabase/migrations/006_admin_superadmin_split.sql'),
];

const sql = postgres(url, { max: 1, ssl: 'require' });

try {
  for (const f of files) {
    const name = f.split('/').pop();
    console.error(`Applying ${name}…`);
    await sql.file(f);
    console.error(`Done: ${name}`);
  }
  console.error('All migrations applied successfully.');
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await sql.end({ timeout: 5 });
}
