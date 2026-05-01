import type { MentorMode } from '@/types/ai';

/**
 * Canned mentor responses by mode. Used by `mentorClient` while OpenAI is
 * disconnected. Two variants per mode are randomized so the demo doesn't feel
 * robotic. Replace this file with a real backend call in a later phase.
 */

const variants: Record<MentorMode, string[]> = {
  class: [
    `Vamos a verlo paso a paso, como en clase.

**Idea central**
La IA es una palanca, no un reemplazo. Te ayuda a producir más rápido, pero solo si tu criterio de negocio ya está claro.

**Cómo funciona en la práctica**
1. Entras con un objetivo concreto (no "haz marketing").
2. Le das contexto del cliente.
3. Le pides 3 variantes y eliges 1.
4. Mides en el mundo real antes de escalar.

**Lo que casi todos hacen mal**
Empiezan por la herramienta, no por el problema. La pregunta correcta no es "¿qué prompt uso?", es "¿qué decisión tengo que tomar esta semana?".`,
    `Te lo cuento como si estuvieras en mi clase.

**Punto 1**
La diferencia entre PyMEs que ganan con IA y las que se frustran está en una cosa: las primeras escriben briefs claros. Las segundas piden milagros.

**Punto 2**
Un brief bueno tiene 4 elementos: objetivo, cliente ideal, restricciones, ejemplo de "buena respuesta". Sin esos 4, la IA dispara al aire.

**Punto 3**
Tu trabajo no es escribir prompts. Tu trabajo es elegir qué pedir. La IA es la pluma, tú eres el editor.`,
  ],
  qna: [
    `Buena pregunta. Resumen directo:

- Sí, la IA puede ayudar con eso.
- Pero antes necesitas claridad sobre 2 cosas: a quién le estás hablando y qué decisión quieres que tome.
- Sin esas 2 cosas, cualquier herramienta —IA o no— solo te da volumen.

Si me das esos 2 datos, puedo darte un plan más específico.`,
    `Te respondo en corto y luego te doy detalle.

**Corto:** depende del contexto, pero el patrón general funciona.

**Detalle:**
La mayoría de PyMEs sobreestima la dificultad técnica y subestima la dificultad estratégica. Lo difícil no es usar IA, lo difícil es saber qué pregunta hacerle.

Si tienes una decisión específica que tomar esta semana, cuéntame y la trabajamos juntos.`,
  ],
  business_application: [
    `Aplicado a tu negocio así se ve:

**1. Claridad**
Define tu cliente ideal con 5 datos concretos: edad, ingreso, momento de vida, miedo principal, deseo principal. Si tu equipo no se pone de acuerdo en estos 5, ahí está el primer problema.

**2. Mensaje**
Pide a la IA 5 variantes del mismo mensaje con ángulos distintos (alivio, miedo, aspiración, simplicidad, comunidad). Prueba con 5 personas reales que coincidan con el cliente ideal y mide cuál genera más conversación.

**3. Distribución**
Empieza con 1 canal donde ya tienes audiencia. No abras 4 canales nuevos. Adapta el mensaje a ese canal y publica durante 2 semanas.

**4. Aprendizaje**
Mide 2 métricas, no 10. Si subieron, escala. Si no, vuelve al paso 1.

¿Quieres que armemos los 5 datos del cliente ideal ahora?`,
    `Para tu caso, esto es lo que yo haría esta semana:

- **Lunes y martes:** entrevista a 3 clientes actuales (15 minutos cada uno). Captura sus palabras textuales.
- **Miércoles:** pega las transcripciones a la IA y pídele que sintetice un buyer persona accionable.
- **Jueves:** genera 5 variantes del mensaje principal con la IA usando ese persona.
- **Viernes:** prueba las 5 variantes con 5 personas reales en tu red. Elige la ganadora.

Resultado al final de la semana: un mensaje validado con 5 personas reales, no con tu opinión. Eso es lo que mueve la aguja.`,
  ],
  summary: [
    `Lo importante de esta lección en 5 puntos:

1. La IA amplifica el criterio que ya tienes. Si tu criterio es débil, la IA solo amplifica el ruido.
2. Tres errores típicos: pedir sin contexto, usarla solo para producir contenido, saltarse las pruebas.
3. Marco de 4 pasos: claridad → mensaje → distribución → aprendizaje.
4. La pregunta correcta no es "¿qué prompt uso?", es "¿qué decisión tengo que tomar esta semana?".
5. Empieza con un solo canal, mide 2 métricas, itera con datos.`,
    `Resumen ejecutivo:

- **Tesis:** la IA es palanca, no reemplazo.
- **Marco:** Claridad · Mensaje · Distribución · Aprendizaje.
- **Errores a evitar:** falta de contexto, contenido sin estrategia, no medir.
- **Acción más importante:** definir cliente ideal con 5 datos antes de tocar la IA.`,
  ],
  action_plan: [
    `Plan de acción de 7 días:

**Día 1.** Define tu cliente ideal con 5 datos (edad, ingreso, momento, miedo, deseo). 60 min.
**Día 2.** Entrevista a 2 clientes actuales por video llamada. Graba y transcribe. 90 min.
**Día 3.** Pasa transcripciones a la IA y pídele un buyer persona en 1 página. 45 min.
**Día 4.** Genera 5 variantes de mensaje con la IA usando el persona. 45 min.
**Día 5.** Prueba las 5 variantes con 5 personas reales (5 min cada una). 30 min.
**Día 6.** Elige la ganadora y prepara 1 publicación + 1 email. 90 min.
**Día 7.** Lanza. Mide solo clics al landing y respuestas en DM.

Si avanzas en este plan, en 7 días tienes un mensaje validado.`,
    `Te doy un plan corto y ejecutable:

1. **Hoy:** escribe tu oferta en una frase.
2. **Mañana:** muéstrasela a 5 clientes actuales y pídeles que te la repitan con sus palabras.
3. **Día 3:** ajusta la frase con base en lo que escuchaste.
4. **Día 4–5:** genera 3 variantes con IA y prueba.
5. **Día 6:** elige la ganadora.
6. **Día 7:** lanza una campaña pequeña (USD 20–50) y mide clics.

Si en 7 días no tienes mensaje + 1 prueba real, el problema no es la IA. Es que estás procrastinando.`,
  ],
  exercise: [
    `Ejercicio práctico (15 minutos):

1. Toma una hoja en blanco.
2. Escribe el nombre de tu cliente ideal arriba (un nombre real de cliente actual).
3. Llena 5 datos: edad, ingreso, momento de vida, miedo principal, deseo principal.
4. Por cada dato, escribe en qué te basas: ¿conversación real, dato del CRM, intuición?
5. Marca con rojo todos los que sean intuición. Esos son tu próxima tarea de investigación.

Compárteme cuántos datos te quedaron en rojo y armamos un plan para validarlos.`,
    `Ejercicio rápido para anclar lo aprendido:

- Abre un documento.
- Escribe tu mensaje principal de marketing actual (lo que dirías en 10 segundos a alguien en un café).
- Pásalo a la IA con el prompt: "Reescribe este mensaje con 3 ángulos: alivio, aspiración y comunidad. Mantén la longitud de 10 segundos hablados".
- Lee las 3 variantes en voz alta.
- ¿Cuál suena más a ti? ¿Cuál sonaría más a tu cliente?

Esa diferencia es exactamente donde tienes que trabajar.`,
  ],
  evaluation: [
    `Para evaluar si entendiste, respóndeme estas 4 preguntas:

1. ¿Por qué decimos que la IA es palanca y no reemplazo?
2. ¿Cuáles son los 3 errores típicos al usar IA en marketing?
3. ¿Qué 4 pasos componen el marco que vimos?
4. ¿Cuál es la primera tarea concreta que harías mañana?

Cuando me respondas, te digo dónde estás sólido y dónde conviene reforzar.`,
    `Evaluación corta (3 preguntas):

1. Si tu criterio de negocio es débil y usas IA, ¿qué pasa?
2. ¿Cuál es la pregunta correcta antes de escribir un prompt?
3. ¿Cuántas métricas conviene medir la primera semana de una campaña nueva?

Respóndeme con tus palabras y te doy feedback.`,
  ],
};

export function getMockMentorAnswer(args: {
  mode: MentorMode;
  userMessage: string;
  selectedText?: string;
  businessName?: string;
}): { answer: string; suggestedNoteTitle: string } {
  const pool = variants[args.mode] ?? variants.qna;
  const base = pool[Math.floor(Math.random() * pool.length)];

  const intro = args.selectedText
    ? `Entiendo que tu duda es sobre este fragmento:\n\n> ${args.selectedText.slice(0, 240)}${args.selectedText.length > 240 ? '…' : ''}\n\n`
    : '';

  const businessTag = args.businessName
    ? `\n\n_Aplicado a ${args.businessName}._`
    : '';

  const answer = `${intro}${base}${businessTag}`;
  const suggestedNoteTitle = buildSuggestedTitle(args.mode, args.userMessage);

  return { answer, suggestedNoteTitle };
}

function buildSuggestedTitle(mode: MentorMode, userMessage: string): string {
  const head = userMessage.trim().split('\n')[0]?.slice(0, 60) ?? '';
  const modeLabel: Record<MentorMode, string> = {
    class: 'Clase',
    qna: 'Pregunta',
    business_application: 'Aplicación al negocio',
    summary: 'Resumen',
    action_plan: 'Plan de acción',
    exercise: 'Ejercicio',
    evaluation: 'Evaluación',
  };
  return head ? `${modeLabel[mode]} · ${head}` : modeLabel[mode];
}
