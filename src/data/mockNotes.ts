import type { Note } from '@/types/notes';
import { MOCK_COURSE_ID } from './mockClassroomData';
import { MOCK_USER_ID } from './mockBusinessProfile';

export const mockNotes: Note[] = [
  {
    id: 'note_seed_1',
    user_id: MOCK_USER_ID,
    course_id: MOCK_COURSE_ID,
    lesson_id: 'lesson_1',
    title: 'La IA es palanca, no reemplazo',
    content:
      'Idea clave: si mi criterio de negocio es débil, la IA solo amplifica el ruido. Antes de generar contenido, tengo que aclarar oferta y cliente.',
    tags: ['idea', 'fundamento'],
    is_pinned: true,
    source: 'manual',
    created_at: '2026-04-26T18:00:00.000Z',
    updated_at: '2026-04-26T18:05:00.000Z',
  },
  {
    id: 'note_seed_2',
    user_id: MOCK_USER_ID,
    course_id: MOCK_COURSE_ID,
    lesson_id: 'lesson_1',
    title: 'Selección · "Marco de 4 pasos"',
    content:
      '1. Claridad — define oferta, cliente y promesa.\n2. Mensaje — usa IA para generar variantes.\n3. Distribución — adapta a cada canal.\n4. Aprendizaje — mide y vuelve al paso 1.',
    tags: ['marco', 'selección'],
    is_pinned: false,
    source: 'selection',
    selection_meta: {
      sourceType: 'text',
      fileName: 'Lección 1',
    },
    created_at: '2026-04-27T09:30:00.000Z',
    updated_at: '2026-04-27T09:30:00.000Z',
  },
  {
    id: 'note_seed_3',
    user_id: MOCK_USER_ID,
    course_id: MOCK_COURSE_ID,
    lesson_id: 'lesson_1',
    title: 'Plan de IA: aplicar a Inmoclick',
    content:
      'Aplicado a mi agencia inmobiliaria: empezar por entrevistar a 3 compradores recientes (familias jóvenes 28–42), sintetizar con IA en un buyer persona y generar 5 variantes de mensaje principal. Probar en redes y email durante una semana antes de escalar.',
    tags: ['ia', 'plan', 'inmoclick'],
    is_pinned: false,
    source: 'ai',
    created_at: '2026-04-28T11:15:00.000Z',
    updated_at: '2026-04-28T11:15:00.000Z',
  },
];
