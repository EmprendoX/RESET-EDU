import type { StudentBusinessProfile } from '@/types/business';
import {
  MOCK_USER_ID,
  mockBusinessProfile,
} from '@/data/mockBusinessProfile';
import { demoStorage } from '@/lib/utils/storage';
import { nowIso, randomDelay, uid } from '@/lib/utils/time';
import {
  businessProfileFormSchema,
  type BusinessProfileFormInput,
} from '@/lib/business/businessProfileSchema';
import { env } from '@/config/env';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  sbBusinessProfileGet,
  sbBusinessProfileUpsert,
} from '@/lib/business/businessProfileSupabase';

const STORE_KEY = 'business-profile:v1';

function isBusinessProfileRemote(): boolean {
  const sb = getSupabase();
  return Boolean(isSupabaseConfigured() && env.useSupabaseData && sb);
}

export const businessProfileRepo = {
  async get(): Promise<StudentBusinessProfile> {
    const sb = getSupabase();
    if (isBusinessProfileRemote() && sb) {
      return sbBusinessProfileGet(sb);
    }

    await randomDelay(80, 160);
    const stored = demoStorage.get<StudentBusinessProfile | null>(
      STORE_KEY,
      null,
    );
    if (stored && typeof stored === 'object' && stored.id) {
      return { ...stored };
    }
    return { ...mockBusinessProfile };
  },

  async upsert(input: BusinessProfileFormInput): Promise<StudentBusinessProfile> {
    const sb = getSupabase();
    if (isBusinessProfileRemote() && sb) {
      const parsed = businessProfileFormSchema.parse(input);
      return sbBusinessProfileUpsert(sb, parsed);
    }

    await randomDelay(120, 280);
    const parsed = businessProfileFormSchema.parse(input);
    const base = await businessProfileRepo.get();
    const merged: StudentBusinessProfile = {
      ...base,
      ...parsed,
      notes: parsed.notes,
      user_id: MOCK_USER_ID,
      updated_at: nowIso(),
      created_at: base.created_at || nowIso(),
      id: base.id || uid('bp'),
    };
    demoStorage.set(STORE_KEY, merged);
    return merged;
  },

  /**
   * Solo para tests / reset demo. Con Supabase activo no borra datos remotos.
   */
  resetDemo(): void {
    if (isBusinessProfileRemote()) return;
    demoStorage.remove(STORE_KEY);
  },
};
