
Frontend Spec — Aula de Curso con Visor, Notas y Mentor IA
1. Objetivo del Aula
El Aula debe permitir que el alumno:
1. Vea el contenido de la lección.
2. Navegue entre capítulos, secciones y lecciones.
3. Abra archivos PDF, PowerPoint, documentos, recursos y videos.
4. Copie y pegue información fácilmente.
5. Tome notas personales.
6. Pregunte a una IA entrenada con el curso.
7. Reciba explicaciones aplicadas a su negocio.
8. Guarde respuestas de IA como notas.
9. Complete la lección y avance.
El objetivo visual es que el alumno siempre sepa:
Dónde estoy.
Qué estoy viendo.
Qué tengo que hacer.
Qué puedo preguntarle a la IA.
Dónde guardo mis ideas.
Cuál es la siguiente lección.

2. Nombre del módulo
Puedes llamarlo:
Aula
Course Classroom
Learning Room
Aula Inteligente
Smart Classroom
Para tu proyecto, yo usaría:
Aula Inteligente
Porque comunica que no es solo un reproductor, sino un espacio de aprendizaje con IA.

3. Ruta principal
/aprender/:courseSlug/:lessonId
Ejemplo:
/aprender/marketing-con-ia/leccion-1
También puede existir:
/aprender/:courseSlug
Para abrir el curso y redirigir automáticamente a la última lección vista o a la primera lección.

4. Layout principal del Aula
Desktop
En desktop usaría un layout de 3 zonas:
┌────────────────────────────────────────────────────────────────────┐
│ Topbar: Curso / Lección / Progreso / Acciones                      │
├───────────────┬─────────────────────────────────────┬──────────────┤
│ Temario       │ Visor principal                     │ Panel lateral│
│ Capítulos     │ PDF / PPT / Video / Texto           │ Notas / IA   │
│ Secciones     │                                     │              │
│ Lecciones     │                                     │              │
└───────────────┴─────────────────────────────────────┴──────────────┘
Zonas
Zona izquierda:
Temario del curso.
Zona central:
Visor de contenido.
Zona derecha:
Notas y chat IA.

5. Layout mobile
En móvil no debe intentar meter tres columnas. Debe usar tabs.
Topbar compacto
↓
Tabs:
Contenido | Temario | Notas | Mentor IA
Mobile:
┌────────────────────────────┐
│ Curso / Lección / Progreso │
├────────────────────────────┤
│ Contenido | Temario | IA   │
├────────────────────────────┤
│ Visor o panel activo       │
└────────────────────────────┘
Esto es clave para que no se sienta saturado.

6. Estructura visual recomendada
6.1 Topbar del Aula
Debe estar fija arriba.
Contenido:
Logo pequeño o botón regresar.
Nombre del curso.
Nombre de la lección.
Barra de progreso.
Botón: Anterior.
Botón: Siguiente.
Botón: Completar lección.
Menú de usuario.
Ejemplo:
Marketing con IA  /  Lección 3: Cómo crear una oferta
Progreso: 35%
[Anterior] [Marcar como completada] [Siguiente]

6.2 Sidebar de temario
Debe mostrar:
Capítulos.
Secciones.
Lecciones.
Estado de cada lección.
Lección actual.
Lecciones completadas.
Lecciones bloqueadas si aplica.
Duración.
Icono de tipo de contenido: video, PDF, PPT, texto.
Ejemplo:
Capítulo 1: Fundamentos
  ✓ Lección 1: Introducción
  ✓ Lección 2: Conceptos base
  → Lección 3: Oferta de valor
  ○ Lección 4: Ejercicio práctico
Capítulo 2: Aplicación al negocio
  ○ Lección 5: Caso real
Estados visuales:
✓ Completada
→ Actual
○ Pendiente
🔒 Bloqueada

7. Visor principal de contenido
Este es el centro del Aula.
Debe soportar estos tipos:
Video.
PDF.
PowerPoint.
Texto.
Archivos descargables.
Contenido mixto.

7.1 Header del visor
Arriba del visor debe haber una barra con:
Nombre del archivo o lección.
Tipo de contenido.
Botón pantalla completa.
Botón descargar si está permitido.
Botón copiar selección si aplica.
Botón preguntar a IA sobre este contenido.
Botón guardar selección como nota.
Ejemplo:
[PDF] Guia-de-Marketing.pdf
Página 3 de 24
[- Zoom] [100%] [+ Zoom] [Pantalla completa] [Preguntar a IA]

7.2 Visor PDF
Para PDF, la opción técnica base debe usar un visor web tipo PDF.js. PDF.js es una plataforma web para parsear y renderizar PDFs en navegador, mantenida por Mozilla. (Mozilla GitHub Pages)
Funciones del visor PDF:
Ver PDF dentro del aula.
Navegar páginas.
Zoom in/out.
Pantalla completa.
Buscar texto.
Seleccionar texto.
Copiar texto.
Guardar texto seleccionado como nota.
Enviar texto seleccionado al mentor IA.
Mostrar número de página.
Acciones importantes sobre selección de texto:
Seleccionar texto → Copiar.
Seleccionar texto → Guardar como nota.
Seleccionar texto → Preguntar a IA.
Seleccionar texto → Resumir.
Seleccionar texto → Aplicar a mi negocio.
Esto hace que el PDF no sea pasivo. Se vuelve interactivo.

7.3 Visor PowerPoint
Aquí hay que ser muy estratégico.
PowerPoint/PPTX no es tan directo como PDF en una app web. Para MVP, recomiendo una de estas dos rutas:
Opción MVP recomendada: convertir PowerPoint a PDF
Flujo:
Admin sube PPT/PPTX.
Sistema lo convierte a PDF o el admin sube versión PDF.
Alumno lo ve en el visor PDF.
Alumno puede copiar texto, guardar notas y preguntar a IA.
Ventajas:
Más estable.
Más fácil de ver.
Más fácil de copiar.
Más fácil de usar con IA.
Más fácil de hacer responsive.
Opción alternativa: embed de PowerPoint online
Microsoft permite embeber presentaciones de PowerPoint en páginas web/blogs mediante PowerPoint para la web, pero normalmente depende de que el archivo esté disponible en el entorno adecuado, como OneDrive/PowerPoint web, y de un código de embed. (Microsoft Support)
Ventajas:
Puede mostrar presentación con fidelidad visual.
Puede conservar formato, animaciones o transiciones dependiendo del caso.
Desventajas:
Depende del proveedor externo.
Puede requerir permisos públicos o links especiales.
Menos control sobre copiar texto.
Menos control para IA.
Menos control de seguridad.
Recomendación para este proyecto
Para el MVP:
PowerPoint se acepta, pero se muestra preferentemente como PDF convertido.
Para V1:
Agregar conversión automática de PPT/PPTX a PDF o imágenes de slides desde backend.

7.4 Visor de video
El video debe sentirse limpio, como una clase real.
Debe incluir:
Player embebido.
Título de la lección.
Descripción corta.
Botón reproducir.
Controles normales.
Botón pantalla completa.
Botón tomar nota en minuto actual.
Botón preguntar a IA sobre el video.
Botón ver resumen de la lección.
Para MVP, el video puede venir de:
YouTube no listado.
Vimeo.
Bunny.
Cloudflare Stream.
URL embebida.
La subida directa de video pesado no la metería todavía en el MVP porque implica almacenamiento, procesamiento, compresión y costos.

7.5 Texto de la lección
Además de PDF/video, cada lección debe poder tener texto propio.
Debe mostrarse como:
Título.
Objetivo de la lección.
Contenido.
Puntos clave.
Ejercicio.
Acción recomendada.
Esto también ayuda a la IA porque le da contexto limpio.

8. Panel derecho: Notas y Chat IA
El panel derecho debe tener tabs:
Notas | Mentor IA | Recursos
O en versión más completa:
Notas | IA | Resumen | Recursos
Para MVP recomiendo:
Notas | Mentor IA

9. Módulo de notas
Este módulo debe ser muy fácil de usar.
9.1 Objetivo
Que el alumno pueda guardar ideas mientras estudia sin perder el flujo.
Debe permitir:
Crear nota rápida.
Copiar y pegar desde PDF, PPT, video o texto.
Guardar selección como nota.
Editar nota.
Eliminar nota.
Fijar nota.
Agregar tags.
Guardar nota por lección.
Guardar nota por curso.
Ver notas recientes.

9.2 UI de notas dentro del Aula
Panel derecho:
┌────────────────────────┐
│ Notas                  │
│ + Nueva nota           │
├────────────────────────┤
│ Buscar notas           │
├────────────────────────┤
│ Nota fijada            │
│ Nota reciente          │
│ Nota de IA             │
├────────────────────────┤
│ Editor de nota         │
└────────────────────────┘

9.3 Editor de nota
Campos:
Título.
Contenido.
Tags.
Curso asociado.
Lección asociada.
Fuente: manual / archivo / IA.
Botón guardar.
Estado de autosave.
Funciones útiles:
Autosave.
Copiar nota.
Expandir editor.
Convertir en tarea.
Guardar como plan de acción.

9.4 Acciones rápidas de notas
Cuando el usuario selecciona texto del archivo, debe aparecer un mini menú:
Copiar
Guardar como nota
Preguntar a IA
Resumir
Aplicar a mi negocio
Ejemplo:
Usuario selecciona un párrafo del PDF
↓
Clic en “Guardar como nota”
↓
Se crea nota con:
- texto seleccionado
- curso actual
- lección actual
- página o slide si aplica

10. Mentor IA del Aula
Este es el corazón premium del producto.
10.1 Objetivo del mentor
El mentor IA debe:
Dar la clase.
Explicar conceptos.
Responder dudas.
Analizar el archivo actual.
Aplicar la lección al negocio del alumno.
Crear ejercicios.
Crear planes de acción.
Guardar respuestas como notas.
No debe sentirse como ChatGPT genérico. Debe sentirse como:
El profesor oficial del curso.

10.2 UI del chat IA
Panel derecho:
┌──────────────────────────────┐
│ Mentor IA                    │
│ Contexto: Lección actual     │
├──────────────────────────────┤
│ Botones rápidos:             │
│ [Explícame] [Aplicar]        │
│ [Resumen] [Ejercicio]        │
│ [Plan de acción]             │
├──────────────────────────────┤
│ Conversación                 │
│ Usuario                      │
│ IA                           │
├──────────────────────────────┤
│ Input                        │
│ Escribe tu pregunta...       │
│ [Enviar]                     │
└──────────────────────────────┘

10.3 Botones rápidos del Mentor IA
Estos botones ayudan a que el usuario no tenga que pensar tanto.
Explícame esta lección.
Resume lo importante.
Aplícalo a mi negocio.
Dame un ejemplo práctico.
Crea un plan de acción.
Hazme preguntas para evaluar si entendí.
Convierte esto en una nota.
Dame una tarea para implementar.

10.4 Contexto visible
El chat debe mostrar chips de contexto:
Curso: Marketing con IA
Lección: Crear oferta de valor
Archivo: Guia-Marketing.pdf
Página: 4
Negocio: Agencia inmobiliaria
Esto da confianza al usuario porque sabe que la IA entiende dónde está.

10.5 Preguntar sobre selección
Una función muy poderosa:
Usuario selecciona texto del PDF/PPT
↓
Clic en “Preguntar a IA”
↓
El chat se abre con ese texto como contexto
↓
La IA responde:
“Este fragmento significa... En tu caso, aplicado a tu negocio, sería...”

10.6 Respuesta de IA
Cada respuesta de IA debe tener acciones:
Copiar respuesta.
Guardar como nota.
Crear plan de acción.
Hacer pregunta de seguimiento.
Regenerar.

11. Comportamiento inteligente de la IA
11.1 Datos que debe usar
La IA debe recibir:
Curso actual.
Lección actual.
Archivo actual.
Página o slide actual si aplica.
Texto seleccionado si existe.
Contenido textual de la lección.
Contexto del curso.
Perfil de negocio del alumno.
Historial reciente del chat.

11.2 Perfil de negocio del cliente
Para que la IA aplique bien la clase, el usuario debe tener un perfil como:
Nombre del negocio.
Industria.
Producto o servicio.
Cliente ideal.
Etapa del negocio.
Objetivo principal.
Reto principal.
País o mercado.
Notas adicionales.
Entonces la IA puede responder así:
“En tu caso, como tienes una agencia de marketing para inmobiliarias, esta estrategia se puede aplicar de esta forma...”

11.3 Modos de IA
El Aula debe tener estos modos:
Modo clase:
La IA explica como profesor.
Modo dudas:
La IA responde preguntas.
Modo aplicación:
La IA adapta la lección al negocio.
Modo resumen:
La IA resume el contenido.
Modo ejercicio:
La IA crea una actividad práctica.
Modo plan:
La IA genera pasos concretos.
Modo evaluación:
La IA hace preguntas para comprobar comprensión.

12. Componentes frontend necesarios
Layout
ClassroomLayout
ClassroomTopbar
CourseSidebar
LessonContentArea
RightLearningPanel
MobileClassroomTabs
Visores
FileViewer
PdfViewer
PowerPointViewer
VideoLessonPlayer
TextLessonViewer
ResourceList
UnsupportedFileViewer
Notas
NotesPanel
NoteEditor
NoteCard
QuickNoteButton
SelectedTextActionMenu
SaveAsNoteButton
NotesSearch
NotesFilter
IA
AIMentorPanel
AIChatWindow
AIMessageBubble
AIQuickActions
AIContextChips
AIInputBox
AISaveAsNoteAction
AITypingIndicator
Progreso
LessonProgressBar
CompleteLessonButton
NextLessonButton
PreviousLessonButton
LessonStatusBadge
Estados
LoadingSkeleton
EmptyState
ErrorState
UnauthorizedState
FileLoadingState
FileErrorState

13. Estructura de carpetas recomendada
src/
  components/
    classroom/
      ClassroomLayout.tsx
      ClassroomTopbar.tsx
      CourseSidebar.tsx
      LessonContentArea.tsx
      RightLearningPanel.tsx
      MobileClassroomTabs.tsx
viewers/
      FileViewer.tsx
      PdfViewer.tsx
      PowerPointViewer.tsx
      VideoLessonPlayer.tsx
      TextLessonViewer.tsx
      ResourceList.tsx
      UnsupportedFileViewer.tsx
notes/
      NotesPanel.tsx
      NoteEditor.tsx
      NoteCard.tsx
      SelectedTextActionMenu.tsx
      SaveAsNoteButton.tsx
ai/
      AIMentorPanel.tsx
      AIChatWindow.tsx
      AIMessageBubble.tsx
      AIQuickActions.tsx
      AIContextChips.tsx
      AIInputBox.tsx
progress/
      LessonProgressBar.tsx
      CompleteLessonButton.tsx
      LessonNavigation.tsx
pages/
    student/
      ClassroomPage.tsx
hooks/
    useLessonData.ts
    useCourseStructure.ts
    useNotes.ts
    useAIMentor.ts
    useSelectedText.ts
    useLessonProgress.ts
lib/
    ai/
      mentorClient.ts
    files/
      fileType.ts
    supabase/
      client.ts
types/
    classroom.ts
    course.ts
    lesson.ts
    notes.ts
    ai.ts

14. Datos que necesita el Aula
lesson
id
course_id
module_id
section_id
title
description
content_text
video_url
pdf_url
file_url
file_type
ai_context
duration_minutes
order_index
status
course
id
title
slug
description
ai_context
structure_type
course structure
modules[]
sections[]
lessons[]
notes
id
user_id
course_id
lesson_id
title
content
tags
source
is_pinned
created_at
updated_at
student_business_profile
business_name
industry
business_model
target_customer
main_goal
main_challenge
current_stage
country
ai messages
id
thread_id
role
content
metadata
created_at

15. Estados que debe manejar el Aula
Estado loading
Cargando curso...
Cargando lección...
Cargando archivo...
Cargando notas...
Preparando mentor IA...
Estado empty
Esta lección todavía no tiene contenido.
No tienes notas en esta lección.
Aún no has conversado con el mentor.
Este curso todavía no tiene lecciones.
Estado error
No pudimos cargar el archivo.
No pudimos guardar la nota.
No pudimos conectar con el mentor IA.
El video no está disponible.
La lección no existe.
Estado unauthorized
No tienes acceso a esta lección.
Inicia sesión para continuar.
Este contenido pertenece a un curso privado.
Estado success
Nota guardada.
Lección completada.
Respuesta guardada como nota.
Perfil de negocio actualizado.

16. Acciones principales del usuario
Dentro del Aula, el usuario debe poder:
Cambiar de lección.
Ver archivo.
Ver video.
Leer texto.
Seleccionar texto.
Copiar texto.
Guardar selección como nota.
Preguntar a IA sobre selección.
Crear nota manual.
Editar nota.
Guardar respuesta IA como nota.
Completar lección.
Ir a siguiente lección.
Ver progreso.
Abrir pantalla completa.

17. UX ideal del Aula
Flujo de estudio ideal
Alumno entra a la lección
↓
Ve el video/PDF/texto
↓
Selecciona una parte importante
↓
La guarda como nota
↓
Pregunta a IA: “¿Cómo aplico esto a mi negocio?”
↓
IA responde con ejemplo personalizado
↓
Alumno guarda respuesta como nota
↓
IA crea plan de acción
↓
Alumno marca lección como completada
↓
Avanza a la siguiente
Este flujo es el que debes cuidar más.

18. Diseño visual recomendado
Estilo
Limpio.
Premium.
Minimalista.
Con mucho espacio.
Enfocado en lectura.
Sin saturar.
Colores sugeridos
No te doy colores exactos todavía porque dependen de tu marca, pero la jerarquía debe ser:
Fondo claro o dark elegante.
Paneles diferenciados.
Botón principal fuerte.
Estados suaves.
IA con identidad visual propia.
Notas con tono cálido o tipo libreta.
Sensación
Debe sentirse como:
Estoy en una clase profesional.
Tengo todo a la mano.
La IA me acompaña.
No me pierdo.
Puedo guardar ideas rápido.

19. MVP del Aula
Para empezar sin inflar demasiado, el MVP del Aula debe incluir:
Layout desktop de 3 zonas.
Layout mobile con tabs.
Sidebar de temario.
Visor PDF básico.
Visor video por URL.
Texto de lección.
Panel de notas.
Crear/editar/eliminar notas.
Seleccionar texto y guardar como nota para PDF/texto.
Chat IA básico.
Botones rápidos de IA.
Guardar respuesta IA como nota.
Progreso de lección.
Botón completar.
Botón anterior/siguiente.

20. No meter todavía en MVP
Para no retrasar el lanzamiento, dejaría fuera por ahora:
Anotaciones dibujadas sobre PDF.
Subida directa de video pesado.
Transcripción automática de video.
Conversión automática avanzada de PowerPoint.
Comentarios colaborativos.
Notas compartidas.
Quizzes complejos.
Certificados.
Modo comunidad.
IA con voz.
PowerPoint sí puede estar contemplado, pero en MVP lo más sano es:
PPT/PPTX → convertir o subir como PDF para verlo bien en el Aula.

21. Tickets para construir el frontend del Aula
Ticket 1 — Crear ClassroomLayout
Objetivo:
Crear la estructura visual principal del Aula.
Debe incluir:
- Topbar.
- Sidebar de temario.
- Área central de contenido.
- Panel derecho de notas/IA.
- Responsive mobile con tabs.
Criterios:
- Desktop usa 3 columnas.
- Mobile usa tabs.
- No hay datos hardcodeados permanentes.
- Tiene loading/error básico.

Ticket 2 — Crear CourseSidebar
Objetivo:
Mostrar capítulos, secciones y lecciones.
Debe incluir:
- Estado completado.
- Estado actual.
- Estado pendiente.
- Icono por tipo de contenido.
- Scroll interno.
- Click para cambiar lección.
Criterios:
- El orden respeta order_index.
- Funciona con curso lineal.
- Funciona con curso modular.
- Mobile se muestra en tab Temario.

Ticket 3 — Crear FileViewer
Objetivo:
Crear un componente que decida qué visor usar según tipo de contenido.
Debe soportar:
- PDF.
- PPT/PPTX como PDF o embed.
- Video.
- Texto.
- Archivo no soportado.
Criterios:
- Si file_type = pdf, renderiza PdfViewer.
- Si file_type = video, renderiza VideoLessonPlayer.
- Si file_type = ppt/pptx, renderiza PowerPointViewer o fallback.
- Si no hay archivo, muestra TextLessonViewer.
- Si falla, muestra FileErrorState.

Ticket 4 — Crear PdfViewer
Objetivo:
Mostrar PDFs dentro del Aula.
Debe incluir:
- Navegación por páginas.
- Zoom.
- Pantalla completa.
- Selección de texto si es posible.
- Acciones sobre selección.
Criterios:
- PDF carga correctamente.
- Muestra loading.
- Muestra error si falla.
- Permite guardar selección como nota.
- Permite preguntar a IA sobre selección.

Ticket 5 — Crear VideoLessonPlayer
Objetivo:
Mostrar video de la lección.
Debe incluir:
- Player embebido.
- Título.
- Descripción.
- Botón tomar nota.
- Botón preguntar a IA sobre video/lección.
Criterios:
- Video URL funciona.
- Si no hay URL, no rompe.
- Si falla, muestra mensaje claro.

Ticket 6 — Crear NotesPanel
Objetivo:
Permitir tomar notas dentro del Aula.
Debe incluir:
- Lista de notas.
- Crear nota.
- Editar nota.
- Eliminar nota.
- Buscar notas.
- Fijar nota.
- Autosave o botón guardar.
Criterios:
- Notas se asocian a course_id y lesson_id.
- Usuario solo ve sus notas.
- Loading, empty y error states.
- Funciona en mobile.

Ticket 7 — Crear SelectedTextActionMenu
Objetivo:
Permitir acciones rápidas al seleccionar texto.
Debe incluir:
- Copiar.
- Guardar como nota.
- Preguntar a IA.
- Resumir.
- Aplicar a mi negocio.
Criterios:
- Aparece al seleccionar texto.
- Funciona en texto de lección.
- Funciona en PDF si el visor lo permite.
- No estorba en mobile.

Ticket 8 — Crear AIMentorPanel
Objetivo:
Crear el chat IA dentro del Aula.
Debe incluir:
- Ventana de mensajes.
- Input.
- Botones rápidos.
- Context chips.
- Loading de respuesta.
- Error state.
- Guardar respuesta como nota.
Criterios:
- Envía mensaje al backend.
- Muestra respuesta.
- Guarda conversación.
- Puede recibir selectedText como contexto.
- Funciona en mobile.

Ticket 9 — Crear LessonProgressControls
Objetivo:
Permitir avanzar en el curso.
Debe incluir:
- Marcar como completada.
- Anterior.
- Siguiente.
- Progreso visual.
Criterios:
- Guarda progreso.
- Actualiza sidebar.
- Redirige a siguiente lección.
- No rompe si es última lección.

22. Prompt para Cursor — Diseño frontend del Aula
Copia y pega esto en Cursor:
Actúa como senior frontend engineer y product designer.
Vamos a construir el frontend del Aula Inteligente para una plataforma SaaS de cursos.
Stack:
React + TypeScript + Tailwind.
Objetivo:
Crear una pantalla de aula profesional, funcional y fácil de usar donde el alumno pueda ver contenido de la lección, navegar el curso, ver archivos PDF/PowerPoint/video/texto, tomar notas y chatear con un mentor IA entrenado con el curso y aplicado al negocio del alumno.
Layout desktop:
- Topbar fija con curso, lección, progreso y acciones.
- Sidebar izquierda con capítulos, secciones y lecciones.
- Área central con visor de contenido.
- Panel derecho con tabs: Notas y Mentor IA.
Layout mobile:
- Topbar compacta.
- Tabs: Contenido, Temario, Notas, Mentor IA.
Componentes a crear:
- ClassroomLayout
- ClassroomTopbar
- CourseSidebar
- LessonContentArea
- FileViewer
- PdfViewer
- PowerPointViewer
- VideoLessonPlayer
- TextLessonViewer
- NotesPanel
- NoteEditor
- NoteCard
- SelectedTextActionMenu
- AIMentorPanel
- AIChatWindow
- AIQuickActions
- AIContextChips
- LessonProgressControls
Requisitos:
1. El diseño debe ser mobile-first.
2. Debe verse profesional y limpio.
3. Debe manejar loading, empty, error y unauthorized states.
4. No usar datos hardcodeados permanentes.
5. Usar props y tipos TypeScript.
6. Separar componentes de forma clara.
7. El visor debe decidir qué mostrar según file_type o lesson content.
8. El panel de notas debe permitir crear, editar, eliminar y guardar selección como nota.
9. El chat IA debe mostrar botones rápidos: Explícame, Resumen, Aplicar a mi negocio, Ejercicio, Plan de acción.
10. La IA debe recibir como contexto: courseId, lessonId, selectedText si existe y businessProfile si está disponible.
11. No conectar todavía a OpenAI directamente desde frontend.
12. La llamada de IA debe ir preparada para usar un endpoint backend como /.netlify/functions/mentor-chat.
13. No exponer claves secretas.
14. Al final, indicar archivos creados y cómo probar.
Primero:
- Revisa la estructura actual.
- Propón el plan de implementación.
- No modifiques código hasta que el plan esté claro.

23. Prompt para pedir solo el diseño visual primero
Si quieres que Cursor empiece sin conectar backend todavía:
Crea primero solo el frontend visual del Aula Inteligente usando datos mock temporales bien organizados.
No conectes todavía Supabase ni OpenAI.
Necesito:
- Layout desktop de 3 columnas.
- Layout mobile con tabs.
- Sidebar de temario.
- Visor central con tabs de contenido: PDF, Video, Texto.
- Panel derecho con Notas y Mentor IA.
- Componentes reutilizables.
- Estados loading, empty y error visuales.
- Diseño profesional con Tailwind.
- TypeScript limpio.
Usa mock data en un archivo separado:
src/data/mockClassroomData.ts
Después deja preparado el código para reemplazar mock data por Supabase.

24. Prompt para crear la IA del Aula después
Ahora conecta el AIMentorPanel con un endpoint backend seguro.
Endpoint:
/.netlify/functions/mentor-chat
El frontend debe enviar:
- courseId
- lessonId
- userMessage
- selectedText opcional
- mentorMode
- currentFileContext opcional
- currentPageOrSlide opcional
El frontend debe recibir:
- answer
- messageId
- createdAt
Requisitos:
- Mostrar loading mientras responde.
- Mostrar error si falla.
- Permitir guardar respuesta como nota.
- No llamar OpenAI desde frontend.
- No exponer API keys.

25. Lo más importante del diseño
El Aula no debe sentirse como una pantalla llena de cosas. Debe sentirse como una herramienta clara:
A la izquierda:
Dónde estoy en el curso.
Al centro:
Qué estoy estudiando.
A la derecha:
Qué estoy pensando y qué le pregunto al mentor.
La experiencia ganadora es esta:
Leo o veo una clase
↓
Selecciono algo importante
↓
Lo guardo como nota
↓
Le pregunto a la IA cómo aplicarlo
↓
La IA me da una explicación personalizada
↓
Guardo eso como plan de acción
↓
Completo la lección
Esa es la base del Aula Inteligente.
