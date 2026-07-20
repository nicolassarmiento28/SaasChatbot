# 04 - Configuración del Bot

## 1. Objetivo
Permitir al dueño de negocio crear, editar y administrar sus bots (nombre,
tono, apariencia) y su base de conocimiento (knowledge_sources) desde el
dashboard, generando el system_prompt que usará la Edge Function chat.

## 2. Flujo del usuario paso a paso
1. Desde /dashboard/bots, el usuario ve la lista de sus bots con
   indicador de salud (BotHealthBadge).
2. Puede crear un nuevo bot con name, tone, primary_color, avatar_url.
   Un selector de plantilla por rubro pre-llena los campos automáticamente.
3. Al guardar, el sistema genera/actualiza system_prompt combinando
   plantilla base + name + tone del negocio.
4. Panel split en la pantalla de edición: formulario a la izquierda,
   preview en tiempo real del widget a la derecha. El preview se actualiza
   instantáneamente al editar tone, primary_color o avatar_url sin
   necesidad de guardar primero.
5. En /dashboard/bots/:id/knowledge, el usuario administra knowledge_sources:
   - agrega texto libre o FAQ (type = text | faq).
   - sube un documento (type = document, archivo a Storage, file_url guardado).
   - edita o elimina fuentes existentes.
6. El usuario puede configurar hasta 3 botones CTA por bot (label + URL)
   desde la sección de configuración avanzada.
7. El usuario puede activar/desactivar un bot (is_active) sin borrarlo.
8. Puede probar el bot en cualquier momento con BotPreviewChat embebido
   en la misma pantalla de configuración.

## 3. Plantillas de personalidad por rubro
- 4 plantillas: restaurante, clínica, tienda online, inmobiliaria.
- Cada plantilla incluye: tone sugerido, 3-5 FAQs típicas, system_prompt base.
- Botón "Aplicar plantilla" visible en BotForm con selector de rubro.
- Al aplicar, los campos se llenan automáticamente pero siguen siendo editables.
- Las FAQs de la plantilla se crean como knowledge_sources iniciales al guardar.

## 4. Preview instantáneo del widget
- Panel split: formulario a la izquierda (60%), preview a la derecha (40%).
- El BotPreviewChat refleja en tiempo real:
  - primary_color del bot.
  - avatar_url del bot.
  - tone (visible en el estilo de respuesta del mini-chat).
- El preview usa el bot_id real si ya fue guardado, o un bot mock si es nuevo.
- En mobile el panel split colapsa — el preview aparece como modal al tocar
  el botón "Ver preview".

## 5. Respuestas con acciones (botones CTA)
- El dueño configura hasta 3 botones CTA por bot: label + URL de destino.
- Los botones se guardan en bots.cta_buttons (columna jsonb, default '[]]').
- La Edge Function incluye los CTAs disponibles en el contexto del prompt.
- El widget los renderiza como botones clickeables bajo el texto de respuesta.
- Al hacer click en un CTA, se abre la URL en una nueva pestaña.
- Requiere migración: agregar columna cta_buttons jsonb default '[]' a bots.

## 6. Modo multilenguaje automático
- La Edge Function detecta el idioma dominante del mensaje del visitante.
- Responde en ese idioma usando la misma knowledge_source sin configuración
  adicional del dueño del negocio.
- El system_prompt incluye instrucción fija: "Detecta el idioma del visitante
  y responde siempre en ese mismo idioma."
- No requiere cambios en el modelo de datos.
- Idiomas soportados: cualquiera que soporte llama-3.1-8b-instant.

## 7. Componentes a crear
- BotList (tabla/cards de bots con BotHealthBadge).
- BotForm con panel split: formulario + BotPreviewChat en tiempo real.
- TemplateSelector — selector de plantilla por rubro en BotForm.
- CtaButtonsConfig — formulario para configurar hasta 3 botones CTA.
- KnowledgeSourceList y KnowledgeSourceForm (CRUD de knowledge_sources,
  con tabs por type).
- BotPreviewChat (mini-chat de prueba, comparte lógica con DemoChatWidget).
- useBots, useKnowledgeSources (hooks de datos sobre Supabase client).

## 8. Modelo de datos involucrado
- bots (CRUD completo + nueva columna cta_buttons jsonb default '[]').
- knowledge_sources (CRUD completo, bot_id FK).
- Supabase Storage: bucket avatars (para bots.avatar_url) y bucket
  knowledge-docs (para knowledge_sources.file_url).
- businesses.plan determina el límite de bots permitidos.

## 9. Criterios de aceptación
- Crear un bot genera un system_prompt no vacío y coherente con tone.
- El preview del widget se actualiza en tiempo real al editar sin guardar.
- Aplicar una plantilla pre-llena tone, FAQs y system_prompt correctamente.
- Los botones CTA aparecen en el widget bajo el texto de respuesta.
- El bot responde en el idioma del visitante automáticamente.
- Editar tone o name regenera el system_prompt automáticamente.
- Plan free no puede crear un segundo bot (validación client y server-side).
- Agregar/editar/eliminar knowledge_sources se refleja en BotPreviewChat.
- Desactivar un bot hace que el widget público deje de responder.
- Subir avatar o documento respeta límites de tamaño y tipo de archivo.

## 10. Consideraciones de seguridad
- Todo el CRUD pasa por RLS: bots/knowledge_sources solo accesibles si
  business_id pertenece al auth.uid() actual.
- Validar tamaño y tipo MIME de archivos subidos a Storage.
- Sanitizar/limitar longitud de content en knowledge_sources.
- El límite de bots por plan se refuerza server-side.
- El system_prompt nunca se expone a endpoints públicos.
- Los CTAs (label + URL) se sanitizan antes de guardarse para evitar XSS.

## 11. Tests requeridos
- Test: crear bot genera system_prompt no vacío.
- Test: editar tone regenera system_prompt automáticamente.
- Test: aplicar plantilla restaurante pre-llena campos correctamente.
- Test: plan free bloquea creación de segundo bot (client y server).
- Test: desactivar bot hace que widget devuelva bot_unavailable.
- Test: botones CTA se renderizan en el widget al configurarlos.
- Test: bot responde en inglés si el visitante escribe en inglés.
- Test: subir archivo con tipo MIME inválido es rechazado.
