import type { SupabaseClient } from '@supabase/supabase-js';
import type { StudentBusinessProfile } from '@/types/business';
import type { BusinessProfileFormInput } from '@/lib/business/businessProfileSchema';
import { nowIso } from '@/lib/utils/time';
import { getSessionUserId, requireSessionUserId } from '@/lib/supabase/sessionUser';

function asRecord(row: unknown): Record<string, unknown> {
  return row && typeof row === 'object' ? (row as Record<string, unknown>) : {};
}

function emptyProfile(userId: string, ts: string): StudentBusinessProfile {
  return {
    id: userId,
    user_id: userId,
    business_name: '',
    industry: '',
    business_model: '',
    target_customer: '',
    main_goal: '',
    main_challenge: '',
    current_stage: '',
    country: '',
    notes: '',
    created_at: ts,
    updated_at: ts,
  };
}

function mapRow(row: Record<string, unknown>): StudentBusinessProfile {
  const uid = String(row.user_id ?? '');
  const notesVal = row.notes;
  return {
    id: uid,
    user_id: uid,
    business_name: String(row.business_name ?? ''),
    industry: String(row.industry ?? ''),
    business_model: String(row.business_model ?? ''),
    target_customer: String(row.target_customer ?? ''),
    main_goal: String(row.main_goal ?? ''),
    main_challenge: String(row.main_challenge ?? ''),
    current_stage: String(row.current_stage ?? ''),
    country: String(row.country ?? ''),
    notes:
      notesVal != null && notesVal !== ''
        ? String(notesVal)
        : undefined,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

export async function sbBusinessProfileGet(
  sb: SupabaseClient,
): Promise<StudentBusinessProfile> {
  const userId = await getSessionUserId(sb);
  if (!userId) {
    const ts = nowIso();
    return emptyProfile('', ts);
  }

  const { data, error } = await sb
    .from('student_business_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    const ts = nowIso();
    return emptyProfile(userId, ts);
  }

  return mapRow(asRecord(data));
}

export async function sbBusinessProfileUpsert(
  sb: SupabaseClient,
  input: BusinessProfileFormInput,
): Promise<StudentBusinessProfile> {
  const userId = requireSessionUserId(await getSessionUserId(sb));

  const row = {
    user_id: userId,
    business_name: input.business_name,
    industry: input.industry,
    business_model: input.business_model,
    target_customer: input.target_customer,
    main_goal: input.main_goal,
    main_challenge: input.main_challenge,
    current_stage: input.current_stage,
    country: input.country,
    notes: input.notes.trim() === '' ? null : input.notes,
  };

  const { data, error } = await sb
    .from('student_business_profiles')
    .upsert(row, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) throw error;
  return mapRow(asRecord(data));
}
