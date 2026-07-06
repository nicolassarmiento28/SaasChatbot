# 04 - Configuración del Bot

## 1. Objetivo
Permitir al dueño de negocio crear, editar y administrar sus bots (nombre,
tono, apariencia) y su base de conocimiento (`knowledge_sources`) desde el
dashboard, generando el `system_prompt` que usará la Edge Function `chat`.

## 2. Flujo del usuario paso a paso
1. Desde `/dashboard/bots`, el usuario ve la lista de sus bots (normalmente
   uno en el plan `free`).
2. Puede crear un nuevo bot (si su `plan` lo permite) con `name`, `tone`,
   `primary_color`, `avatar_url` (subida a Supabase Storage).
3. Al guardar, el sistema genera/actualiza `system_prompt` combinando una
   plantilla base + `name` + `tone` del negocio (no editable a mano libre por
   defecto, según decisión en `00-arquitectura`).
4. En `/dashboard/bots/:id/knowledge`, el usuario administra
   `knowledge_sources`:
   - agrega texto libre o FAQ (`type = 'text' | 'faq'`).
   - sube un documento (`type = 'document'`, archivo a Storage, `file_url`
     guardado; el procesamiento a texto plano ocurre en una Edge Function
     separada o al momento de la carga).
   - edita o elimina fuentes existentes.
5. El usuario puede activar/desactivar un bot (`is_active`) sin borrarlo.
6. Puede probar el bot en cualquier momento con un mini-chat embebido en la
   misma pantalla de configuración (reutiliza `DemoChatWidget`).

## 3. Componentes a crear
- `BotList` (tabla/cards de bots del negocio).
- `BotForm` (crear/editar `name`, `tone`, `primary_color`, `avatar_url`).
- `KnowledgeSourceList` y `KnowledgeSourceForm` (CRUD de
  `knowledge_sources`, con tabs por `type`).
- `BotPreviewChat` (mini-chat de prueba, comparte lógica con `DemoChatWidget`).
- `useBots`, `useKnowledgeSources` (hooks de datos sobre Supabase client).

## 4. Modelo de datos involucrado
- `bots` (CRUD completo, definido en `00-arquitectura`).
- `knowledge_sources` (CRUD completo, `bot_id` FK).
- Supabase Storage: bucket `avatars` (para `bots.avatar_url`) y bucket
  `knowledge-docs` (para `knowledge_sources.file_url`).
- Indirectamente, `businesses.plan` determina el límite de bots permitidos.

## 5. Criterios de aceptación
- Crear un bot genera un `system_prompt` no vacío y coherente con `tone`.
- Editar `tone` o `name` regenera el `system_prompt` automáticamente.
- Un usuario del plan `free` no puede crear un segundo bot (validación en
  cliente y, de forma autoritativa, en una policy/función de Postgres o en
  la Edge Function correspondiente).
- Agregar/editar/eliminar `knowledge_sources` se refleja de inmediato en las
  respuestas del `BotPreviewChat`.
- Subir un `avatar_url` o `file_url` respeta límites de tamaño y tipo de
  archivo (imágenes para avatar, PDF/TXT para documentos).
- Desactivar un bot (`is_active = false`) hace que el widget público deje de
  responder para ese `bot_id` (ver `05-widget`).

## 6. Consideraciones de seguridad
- Todo el CRUD pasa por RLS: `bots`/`knowledge_sources` solo accesibles si
  `business_id` pertenece al `auth.uid()` actual.
- Validar tamaño y tipo MIME de archivos subidos a Storage antes de aceptar
  la subida (evitar archivos ejecutables o excesivamente grandes).
- Sanitizar/limitar longitud de `content` en `knowledge_sources` (evita
  prompt injection excesivo o costos descontrolados de tokens al armar el
  contexto en `05-widget`).
- El límite de bots por plan debe reforzarse server-side (no confiar
  únicamente en deshabilitar el botón en el UI).
- El `system_prompt` generado nunca se expone directamente a endpoints
  públicos (landing/widget); solo se usa server-side en la Edge Function.
