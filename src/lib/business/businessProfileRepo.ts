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

const STORE_KEY = 'business-profile:v1';

export const businessProfileRepo = {
  async get(): Promise<StudentBusinessProfile> {
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

  /** Solo para tests / reset demo. */
  resetDemo(): void {
    demoStorage.remove(STORE_KEY);
  },
};
