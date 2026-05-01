/**
 * Fuente única de seeds del catálogo de cursos (demo / admin).
 * La persistencia en localStorage vive en courseCatalogMockStore.ts — este módulo solo define datos iniciales.
 */
import type {
  Course,
  CourseModule,
  CourseSection,
  CourseStructure,
} from '@/types/course';
import type { Lesson } from '@/types/lesson';

export const MOCK_COURSE_ID = 'course_marketing_ia';
export const MOCK_COURSE_SLUG = 'marketing-con-ia';

const lessonOneText = `## Por qué este curso es distinto

La mayoría de los cursos de marketing te enseñan tácticas genéricas: "publica todos los días", "haz reels", "usa anuncios". El problema es que **esas tácticas asumen que tu negocio ya tiene claridad de oferta, cliente y mensaje**. La realidad es que la mayoría de PyMEs no la tienen.

En este curso vamos a usar IA como **acelerador de claridad**. No como un truco para producir más contenido. La IA bien usada te ayuda a:

1. **Definir tu oferta de valor** en una frase que tu cliente entienda en 3 segundos.
2. **Identificar a tu cliente ideal** con un nivel de detalle que tu equipo pueda usar.
3. **Crear mensajes** que se sientan hechos para esa persona y no para "todos".
4. **Automatizar** las partes repetitivas para que tu equipo trabaje en lo que mueve la aguja.

## Qué vas a aprender en esta lección

- Por qué la IA es una herramienta de **palanca**, no de reemplazo.
- Los tres errores más comunes al usar IA en marketing.
- Un marco de 4 pasos para integrar IA a tu marketing actual.

## Tres errores típicos

**Error 1 — Pedirle a la IA que "haga marketing" sin contexto.**
La IA es buena cuando le das un brief claro. Sin contexto, te da contenido genérico que tu cliente ignora.

**Error 2 — Usar IA solo para producir contenido.**
El contenido sin estrategia es ruido. Antes de generar 50 posts, define tu oferta y tu cliente.

**Error 3 — Saltarse la fase de prueba.**
La IA puede generar 20 variantes de un anuncio en minutos. No las uses todas. **Prueba 3 y mide.**

## Marco de 4 pasos

1. **Claridad** — define oferta, cliente y promesa.
2. **Mensaje** — usa IA para generar variantes del mensaje principal.
3. **Distribución** — adapta el mensaje a cada canal con ayuda de IA.
4. **Aprendizaje** — analiza qué funciona y vuelve a empezar el ciclo.

> Idea clave: la IA no reemplaza tu criterio de negocio. Lo amplifica. Si tu criterio es débil, la IA solo amplifica el ruido.

En la siguiente lección vamos a ver el primer paso —Claridad— con una guía PDF que puedes descargar.`;

const lessonFourText = `## Plan de acción de 30 días

Vamos a aterrizar todo lo aprendido en un plan de 30 días dividido en 4 semanas. Este plan está pensado para que **lo ejecutes con un equipo pequeño** (1–3 personas).

### Semana 1 — Claridad

- Día 1–2: define tu oferta de valor en una frase usando el marco de la Lección 1.
- Día 3–4: entrevista a 3 clientes actuales y captura sus palabras textuales.
- Día 5–7: usa la IA para sintetizar las entrevistas en 1 buyer persona accionable.

### Semana 2 — Mensaje

- Día 8–10: genera 5 variantes de tu mensaje principal con IA.
- Día 11–12: pruébalas con 5 personas que coincidan con tu cliente ideal.
- Día 13–14: elige la ganadora y úsala como mensaje base de toda la marca.

### Semana 3 — Distribución

- Día 15–17: adapta el mensaje a 3 canales (redes, email, sitio).
- Día 18–21: lanza la primera campaña con el mensaje ganador.

### Semana 4 — Aprendizaje

- Día 22–25: mide resultados con métricas simples (clics, leads, conversaciones).
- Día 26–28: itera basado en datos, no en gusto.
- Día 29–30: documenta aprendizajes y repite el ciclo.

## Material de apoyo

Adjunto a esta lección encontrarás un PDF con plantillas listas para llenar. Úsalas con tu equipo en una reunión de 90 minutos para arrancar el plan.`;

const PDF_SAMPLE_URL =
  'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

const marketingCourse: Course = {
  id: MOCK_COURSE_ID,
  title: 'Marketing con IA para PyMEs',
  slug: MOCK_COURSE_SLUG,
  description:
    'Aprende a usar inteligencia artificial para captar más clientes, automatizar tu marketing y crecer tu negocio sin aumentar tu equipo.',
  short_description:
    'IA aplicada al marketing de tu negocio: ofertas, contenido, leads y automatización.',
  cover_image_url:
    'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80',
  category: 'Marketing',
  level: 'beginner',
  structure_type: 'modular',
  status: 'published',
  is_featured: true,
  is_free: false,
  price: 79,
  ai_context:
    'Curso práctico para dueños y equipos de PyMEs sobre cómo aplicar IA al marketing digital. Cubre ofertas de valor, generación de leads, contenido, automatización y seguimiento. Tono directo y accionable. El alumno típico tiene poca experiencia técnica.',
  created_by: 'admin_demo',
  created_at: '2026-03-01T10:00:00.000Z',
  updated_at: '2026-04-28T16:00:00.000Z',
  published_at: '2026-03-15T12:00:00.000Z',
};

const marketingModules: CourseModule[] = [
  {
    id: 'mod_1',
    course_id: MOCK_COURSE_ID,
    title: 'Capítulo 1 · Fundamentos',
    description:
      'Por qué la IA cambia el marketing y cómo encaja en una PyME real.',
    order_index: 1,
  },
  {
    id: 'mod_2',
    course_id: MOCK_COURSE_ID,
    title: 'Capítulo 2 · Aplicación al negocio',
    description: 'Pasamos de teoría a un plan accionable para tu negocio.',
    order_index: 2,
  },
];

const marketingSections: CourseSection[] = [
  {
    id: 'sec_1_1',
    course_id: MOCK_COURSE_ID,
    module_id: 'mod_1',
    title: 'Bases del marketing con IA',
    description: '',
    order_index: 1,
  },
  {
    id: 'sec_2_1',
    course_id: MOCK_COURSE_ID,
    module_id: 'mod_2',
    title: 'De la teoría al plan',
    description: '',
    order_index: 1,
  },
];

const marketingLessons: Lesson[] = [
  {
    id: 'lesson_1',
    course_id: MOCK_COURSE_ID,
    module_id: 'mod_1',
    section_id: 'sec_1_1',
    title: 'Por qué IA cambia las reglas del marketing',
    description:
      'Introducción al curso, errores comunes y el marco de 4 pasos que usaremos.',
    content_text: lessonOneText,
    ai_context:
      'Lección de introducción. La IA debe enfocarse en explicar por qué la IA es una palanca y no un reemplazo, los tres errores típicos y el marco de 4 pasos: claridad, mensaje, distribución, aprendizaje.',
    file_type: 'text',
    duration_minutes: 12,
    order_index: 1,
    is_preview: true,
    status: 'published',
  },
  {
    id: 'lesson_2',
    course_id: MOCK_COURSE_ID,
    module_id: 'mod_1',
    section_id: 'sec_1_1',
    title: 'Guía de claridad: oferta, cliente y promesa',
    description:
      'Descarga la guía PDF y sigue los ejercicios paso a paso.',
    content_text:
      'Lee la guía completa antes de la siguiente lección. Marca las preguntas que no sepas responder; ahí es donde vamos a trabajar con la IA.',
    ai_context:
      'Lección basada en la guía PDF "Marco de claridad". Cubre: definición de oferta de valor en una frase, identificación del cliente ideal con 5 datos clave, construcción de la promesa diferenciada. Ejercicios al final.',
    pdf_url: PDF_SAMPLE_URL,
    file_url: PDF_SAMPLE_URL,
    file_type: 'pdf',
    duration_minutes: 25,
    order_index: 2,
    is_preview: false,
    status: 'published',
  },
  {
    id: 'lesson_3',
    course_id: MOCK_COURSE_ID,
    module_id: 'mod_2',
    section_id: 'sec_2_1',
    title: 'Caso real: cómo usamos IA para generar leads',
    description:
      'Video de caso real (8 minutos) explicando cómo una agencia duplicó sus leads con IA.',
    content_text:
      'Mira el video y toma notas de los 3 momentos clave: (1) cómo definieron el cliente ideal, (2) qué prompts usaron, (3) qué métrica midieron primero.',
    ai_context:
      'Lección en video. La IA debe ayudar a aterrizar el caso real al negocio del alumno: cómo replicar los 3 pasos del video con su contexto.',
    video_url: 'https://www.youtube-nocookie.com/embed/aircAruvnKk',
    file_type: 'video',
    duration_minutes: 8,
    order_index: 3,
    is_preview: false,
    status: 'published',
  },
  {
    id: 'lesson_4',
    course_id: MOCK_COURSE_ID,
    module_id: 'mod_2',
    section_id: 'sec_2_1',
    title: 'Tu plan de 30 días con IA',
    description:
      'Lección mixta con texto + plantilla PDF. Al final de esta lección sales con un plan ejecutable.',
    content_text: lessonFourText,
    ai_context:
      'Plan de 30 días dividido en 4 semanas: claridad, mensaje, distribución, aprendizaje. La IA debe ayudar al alumno a adaptar cada semana al contexto de su negocio (industria, tamaño de equipo, recursos).',
    pdf_url: PDF_SAMPLE_URL,
    file_url: PDF_SAMPLE_URL,
    file_type: 'mixed',
    duration_minutes: 30,
    order_index: 4,
    is_preview: false,
    status: 'published',
  },
];

/** Curso demo del Aula — mismo objeto que exporta mockClassroomData. */
export const marketingCourseStructure: CourseStructure = {
  course: marketingCourse,
  modules: marketingModules,
  sections: marketingSections,
  lessons: marketingLessons,
};

function lessonSeed(
  courseId: string,
  lessonId: string,
  order: number,
  title: string,
  fileType: Lesson['file_type'],
): Lesson {
  return {
    id: lessonId,
    course_id: courseId,
    title,
    description: `Lección ${order} del curso lineal demo.`,
    content_text: `## ${title}\n\nContenido de ejemplo para la lección ${order}.`,
    ai_context: `Contexto IA demo para ${title}.`,
    file_type: fileType,
    duration_minutes: 10 + order * 2,
    order_index: order,
    is_preview: order === 1,
    status: 'published',
  };
}

function buildLinearDemoStructure(): CourseStructure {
  const linearId = 'course_linear_intro';
  const linearSlug = 'intro-lineal-demo';
  return {
    course: {
      id: linearId,
      title: 'Intro lineal (borrador)',
      slug: linearSlug,
      description:
        'Curso de demostración con estructura lineal y tres lecciones de texto.',
      short_description: 'Demo lineal · borrador',
      cover_image_url:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      category: 'General',
      level: 'beginner',
      structure_type: 'linear',
      status: 'draft',
      is_featured: false,
      is_free: true,
      ai_context:
        'Curso corto de demostración lineal. Mantén respuestas breves y ejemplos genéricos.',
      created_by: 'admin_demo',
      created_at: '2026-04-01T10:00:00.000Z',
      updated_at: '2026-04-20T14:00:00.000Z',
    },
    modules: [],
    sections: [],
    lessons: [
      lessonSeed(linearId, 'lesson_lin_1', 1, 'Bienvenida', 'text'),
      lessonSeed(linearId, 'lesson_lin_2', 2, 'Conceptos clave', 'text'),
      lessonSeed(linearId, 'lesson_lin_3', 3, 'Próximos pasos', 'text'),
    ],
  };
}

function buildModularDemoStructure(): CourseStructure {
  const modId = 'course_modular_ventas';
  const modSlug = 'ventas-modular-borrador';
  return {
    course: {
      id: modId,
      title: 'Ventas consultivas (borrador modular)',
      slug: modSlug,
      description:
        'Demo con dos capítulos, secciones y una lección cada uno — para probar el temario modular.',
      short_description: 'Demo modular · borrador',
      cover_image_url:
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
      category: 'Ventas',
      level: 'intermediate',
      structure_type: 'modular',
      status: 'draft',
      is_featured: false,
      is_free: false,
      price: 49,
      ai_context:
        'Enfoque en ventas B2B consultivas. Casos de uso de descubrimiento y cierre.',
      created_by: 'admin_demo',
      created_at: '2026-04-05T12:00:00.000Z',
      updated_at: '2026-04-22T09:30:00.000Z',
    },
    modules: [
      {
        id: 'mod_v_1',
        course_id: modId,
        title: 'Capítulo 1 · Descubrimiento',
        description: '',
        order_index: 1,
      },
      {
        id: 'mod_v_2',
        course_id: modId,
        title: 'Capítulo 2 · Propuesta',
        description: '',
        order_index: 2,
      },
    ],
    sections: [
      {
        id: 'sec_v_1',
        course_id: modId,
        module_id: 'mod_v_1',
        title: 'Preparación',
        description: '',
        order_index: 1,
      },
      {
        id: 'sec_v_2',
        course_id: modId,
        module_id: 'mod_v_2',
        title: 'Documentos',
        description: '',
        order_index: 1,
      },
    ],
    lessons: [
      {
        id: 'lesson_v_1',
        course_id: modId,
        module_id: 'mod_v_1',
        section_id: 'sec_v_1',
        title: 'Checklist previo a la reunión',
        description: 'Lista rápida antes de discovery.',
        content_text:
          '## Checklist\n\n- Investigación del cliente\n- Objetivos de la llamada\n- Preguntas abiertas',
        ai_context: 'Ayuda al alumno a preparar discovery calls.',
        file_type: 'text',
        duration_minutes: 15,
        order_index: 1,
        is_preview: true,
        status: 'published',
      },
      {
        id: 'lesson_v_2',
        course_id: modId,
        module_id: 'mod_v_2',
        section_id: 'sec_v_2',
        title: 'Estructura de propuesta de valor',
        description: 'Plantilla breve para alinear propuesta.',
        content_text:
          '## Propuesta\n\n1. Situación\n2. Objetivos\n3. Oferta\n4. Próximos pasos',
        ai_context: 'Plantilla de propuesta consultiva.',
        file_type: 'text',
        duration_minutes: 20,
        order_index: 2,
        is_preview: false,
        status: 'published',
      },
    ],
  };
}

/**
 * Estructuras iniciales del catálogo (marketing + demos admin).
 * El caller debe clonar si va a mutar (p. ej. courseCatalogMockStore).
 */
export function getSeedCourseStructures(): CourseStructure[] {
  return [
    marketingCourseStructure,
    buildLinearDemoStructure(),
    buildModularDemoStructure(),
  ];
}
