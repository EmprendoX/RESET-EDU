import type {
  CreateNoteInput,
  Note,
  UpdateNoteInput,
} from '@/types/notes';
import { mockNotes } from '@/data/mockNotes';
import { MOCK_USER_ID } from '@/data/mockBusinessProfile';
import { demoStorage } from '@/lib/utils/storage';
import { nowIso, randomDelay, uid } from '@/lib/utils/time';

const STORE_KEY = 'notes:v1';

function loadAll(): Note[] {
  return demoStorage.get<Note[]>(STORE_KEY, mockNotes);
}

function saveAll(notes: Note[]): void {
  demoStorage.set(STORE_KEY, notes);
}

export const notesRepo = {
  async list(args: { courseId: string; lessonId?: string }): Promise<Note[]> {
    await randomDelay();
    const notes = loadAll().filter((n) => n.course_id === args.courseId);
    const filtered = args.lessonId
      ? notes.filter((n) => n.lesson_id === args.lessonId)
      : notes;
    return [...filtered].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return b.updated_at.localeCompare(a.updated_at);
    });
  },

  async listAllForCourse(courseId: string): Promise<Note[]> {
    await randomDelay();
    return loadAll()
      .filter((n) => n.course_id === courseId)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  },

  async listRecent(limit: number): Promise<Note[]> {
    await randomDelay();
    return [...loadAll()]
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, Math.max(0, limit));
  },

  async create(input: CreateNoteInput): Promise<Note> {
    await randomDelay(150, 350);
    const all = loadAll();
    const created: Note = {
      id: uid('note'),
      user_id: MOCK_USER_ID,
      course_id: input.course_id,
      lesson_id: input.lesson_id,
      title: input.title.trim() || 'Sin título',
      content: input.content,
      tags: input.tags ?? [],
      is_pinned: false,
      source: input.source,
      selection_meta: input.selection_meta,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    saveAll([created, ...all]);
    return created;
  },

  async update(input: UpdateNoteInput): Promise<Note> {
    await randomDelay(120, 300);
    const all = loadAll();
    const idx = all.findIndex((n) => n.id === input.id);
    if (idx === -1) throw new Error(`Note ${input.id} not found`);
    const next: Note = {
      ...all[idx],
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
      ...(input.is_pinned !== undefined ? { is_pinned: input.is_pinned } : {}),
      updated_at: nowIso(),
    };
    const copy = [...all];
    copy[idx] = next;
    saveAll(copy);
    return next;
  },

  async remove(id: string): Promise<void> {
    await randomDelay(120, 250);
    const all = loadAll();
    saveAll(all.filter((n) => n.id !== id));
  },

  async togglePin(id: string): Promise<Note> {
    const all = loadAll();
    const target = all.find((n) => n.id === id);
    if (!target) throw new Error(`Note ${id} not found`);
    return notesRepo.update({ id, is_pinned: !target.is_pinned });
  },

  /**
   * Test helper to wipe local state in the demo. Not used in production.
   */
  resetDemo(): void {
    demoStorage.remove(STORE_KEY);
  },
};
