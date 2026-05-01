import type { CourseStructure } from '@/types/course';
import { getSeedCourseStructures } from '@/data/mockAdminCourses';

const STORAGE_KEY = 'reset-edu:admin:catalog';

/** In-memory + localStorage catalog. Keys are course IDs. */
interface CatalogSnapshot {
  structuresByCourseId: Record<string, CourseStructure>;
}

function deepCloneStructure(s: CourseStructure): CourseStructure {
  return {
    course: { ...s.course },
    modules: s.modules.map((m) => ({ ...m })),
    sections: s.sections.map((sec) => ({ ...sec })),
    lessons: s.lessons.map((l) => ({ ...l })),
  };
}

function buildSeedStructures(): CourseStructure[] {
  return getSeedCourseStructures().map((s) => deepCloneStructure(s));
}

function seedSnapshot(): CatalogSnapshot {
  const structures = buildSeedStructures();
  return {
    structuresByCourseId: Object.fromEntries(
      structures.map((s) => [s.course.id, s]),
    ),
  };
}

function parseStored(raw: string): CatalogSnapshot | null {
  try {
    const data = JSON.parse(raw) as CatalogSnapshot;
    if (
      data &&
      typeof data === 'object' &&
      data.structuresByCourseId &&
      typeof data.structuresByCourseId === 'object'
    ) {
      return data;
    }
  } catch {
    /* ignore */
  }
  return null;
}

let memorySnapshot: CatalogSnapshot = seedSnapshot();

function loadFromStorage(): CatalogSnapshot {
  if (typeof localStorage === 'undefined') {
    return seedSnapshot();
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
  memorySnapshot = parsed;
  return memorySnapshot;
}

function persist(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memorySnapshot));
  } catch {
    /* quota / private mode */
  }
}

/** Initialize catalog on module load (browser). SSR-safe. */
if (typeof localStorage !== 'undefined') {
  loadFromStorage();
}

export function getCatalogSnapshot(): CatalogSnapshot {
  return {
    structuresByCourseId: Object.fromEntries(
      Object.entries(memorySnapshot.structuresByCourseId).map(([id, s]) => [
        id,
        deepCloneStructure(s),
      ]),
    ),
  };
}

export function listAllStructures(): CourseStructure[] {
  return Object.values(memorySnapshot.structuresByCourseId).map((s) =>
    deepCloneStructure(s),
  );
}

export function getStructureByCourseId(
  courseId: string,
): CourseStructure | null {
  const s = memorySnapshot.structuresByCourseId[courseId];
  return s ? deepCloneStructure(s) : null;
}

export function getStructureBySlug(slug: string): CourseStructure | null {
  const found = Object.values(memorySnapshot.structuresByCourseId).find(
    (s) => s.course.slug === slug,
  );
  return found ? deepCloneStructure(found) : null;
}

export function upsertStructure(structure: CourseStructure): void {
  memorySnapshot.structuresByCourseId[structure.course.id] =
    deepCloneStructure(structure);
  persist();
}

export function deleteStructure(courseId: string): void {
  delete memorySnapshot.structuresByCourseId[courseId];
  persist();
}

export function replaceStructure(
  courseId: string,
  updater: (prev: CourseStructure) => CourseStructure,
): CourseStructure | null {
  const prev = memorySnapshot.structuresByCourseId[courseId];
  if (!prev) return null;
  const next = updater(deepCloneStructure(prev));
  memorySnapshot.structuresByCourseId[courseId] = deepCloneStructure(next);
  persist();
  return deepCloneStructure(next);
}

/** Dev / QA: reset catalog to bundled seeds and clear storage entry. */
export function resetCatalogToSeed(): void {
  memorySnapshot = seedSnapshot();
  persist();
}

export function slugExists(slug: string, exceptCourseId?: string): boolean {
  const norm = slug.trim().toLowerCase();
  return Object.values(memorySnapshot.structuresByCourseId).some(
    (s) =>
      s.course.slug.trim().toLowerCase() === norm &&
      s.course.id !== exceptCourseId,
  );
}
