import type { AIMessage, AIThread } from '@/types/ai';
import { MOCK_COURSE_ID } from './mockClassroomData';
import { MOCK_USER_ID } from './mockBusinessProfile';

export const mockThread: AIThread = {
  id: 'thread_seed_1',
  user_id: MOCK_USER_ID,
  course_id: MOCK_COURSE_ID,
  lesson_id: 'lesson_1',
  title: 'Aplicar el marco de 4 pasos a Inmoclick',
  mode: 'business_application',
  created_at: '2026-04-28T10:00:00.000Z',
  updated_at: '2026-04-28T10:08:00.000Z',
};

export const mockMessages: AIMessage[] = [
  {
    id: 'msg_seed_1',
    thread_id: mockThread.id,
    role: 'assistant',
    content:
      'Hola, soy tu mentor del curso "Marketing con IA para PyMEs". Estoy listo para acompañarte en esta lección. Puedes preguntarme directamente, o usar uno de los botones rápidos: Explícame, Resumen, Aplicar a mi negocio, Ejercicio o Plan de acción.',
    created_at: '2026-04-28T10:00:05.000Z',
  },
  {
    id: 'msg_seed_2',
    thread_id: mockThread.id,
    role: 'user',
    content:
      '¿Cómo aplico el marco de 4 pasos a mi agencia inmobiliaria? Tenemos pocos leads calificados.',
    created_at: '2026-04-28T10:01:00.000Z',
  },
  {
    id: 'msg_seed_3',
    thread_id: mockThread.id,
    role: 'assistant',
    content:
      'Para Inmoclick, así se ve el marco aplicado:\n\n1. **Claridad** — Tu cliente ideal son familias jóvenes (28–42) buscando primera vivienda. La oferta debe responder en 3 segundos: "te ayudamos a comprar tu primera casa sin perderte en trámites".\n2. **Mensaje** — Genera 5 variantes con IA (alivio, miedo, aspiración, simplicidad, comunidad) y prueba con 5 personas reales.\n3. **Distribución** — Empieza con Facebook/Instagram orgánico + email para los leads que ya tienes en CRM.\n4. **Aprendizaje** — Mide solo 2 cosas la primera semana: clics al landing y respuestas en DM. No mires todo el embudo todavía.\n\n¿Quieres que arme un plan concreto de la primera semana?',
    created_at: '2026-04-28T10:02:30.000Z',
  },
  {
    id: 'msg_seed_4',
    thread_id: mockThread.id,
    role: 'user',
    content: 'Sí, dame el plan de la primera semana en pasos diarios.',
    created_at: '2026-04-28T10:08:00.000Z',
  },
];
