import { MOCK_COURSE_ID } from '@/data/mockAdminCourses';
import { MOCK_USER_ID } from '@/data/mockBusinessProfile';

const STORAGE_KEY = 'reset-edu:student:enrollments';

/**
 * Mock enrollments: which course IDs a user may enter (aula).
 * Separate from admin catalog localStorage — replace with Supabase `enrollments` later.
 *
 * Access rule in coursesRepo: `course_admin`/`superadmin` → all published; else
 * `enrollment` OR `course.is_free` (cursos gratis sin fila de enrollment).
 */
export interface EnrollmentsSnapshot {
  enrollmentsByUserId: Record<string, string[]>;
}

function seedSnapshot(): EnrollmentsSnapshot {
  return {
    enrollmentsByUserId: {
      /** Demo: inscrito solo a marketing; lineal es `is_free` → también entra; modular bloqueado. */
      [MOCK_USER_ID]: [MOCK_COURSE_ID],
    },
  };
}

function parseStored(raw: string): EnrollmentsSnapshot | null {
  try {
    const data = JSON.parse(raw) as EnrollmentsSnapshot;
    if (
      data &&
      typeof data === 'object' &&
      data.enrollmentsByUserId &&
      typeof data.enrollmentsByUserId === 'object'
    ) {
      return data;
    }
  } catch {
    /* ignore */
  }
  return null;
}

let memorySnapshot: EnrollmentsSnapshot = seedSnapshot();

function loadFromStorage(): EnrollmentsSnapshot {
  if (typeof localStorage === 'undefined') {
    memorySnapshot = seedSnapshot();
    return memorySnapshot;
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    memorySnapshot = seedSnapshot();
    return memorySnapshot;
  }
  const parsed = parseStored(raw);
  if (!parsed) {
    memorySnapshot = seedSnapshot();
    return memorySnapshot;
  }
  const seed = seedSnapshot();
  const ids = parsed.enrollmentsByUserId[MOCK_USER_ID];
  memorySnapshot = {
    enrollmentsByUserId: {
      ...parsed.enrollmentsByUserId,
      ...(ids && ids.length > 0
        ? {}
        : { [MOCK_USER_ID]: [...seed.enrollmentsByUserId[MOCK_USER_ID]] }),
    },
  };
  return memorySnapshot;
}

if (typeof localStorage !== 'undefined') {
  loadFromStorage();
}

export function getEnrollmentsSnapshot(): EnrollmentsSnapshot {
  return {
    enrollmentsByUserId: Object.fromEntries(
      Object.entries(memorySnapshot.enrollmentsByUserId).map(([uid, ids]) => [
        uid,
        [...ids],
      ]),
    ),
  };
}

/** Course IDs this user is explicitly enrolled in (mock). */
export function listEnrolledCourseIdsForUser(userId: string): string[] {
  const ids = memorySnapshot.enrollmentsByUserId[userId];
  return ids ? [...ids] : [];
}
