# 05 - Widget Embebible

## 1. Objetivo
Proveer un script vanilla JS embebible que cualquier negocio pueda pegar en
su sitio web para exponer su chatbot a sus usuarios finales, junto con la
Edge Function `chat` que orquesta la conversación con la API de Groq
(llama-3.1-8b-instant).

## 2. Flujo del usuario paso a paso
1. El dueño del negocio copia el snippet desde el dashboard
   (`04-bot-config` / `03-onboarding`):
   ```html
   <script src="https://saaschatbotia.vercel.app/widget.js" data-bot-id="BOT_ID" defer></script>
   ```
   El snippet solo trae `data-bot-id`. La URL y la `anon key` de Supabase
   nunca viajan en el HTML del sitio anfitrión: quedan hardcodeadas dentro
   del bundle `widget.js` en tiempo de build (`vite.widget.config.ts`
   inyecta `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` vía `define`), igual
   que cualquier otro build del frontend.
2. Un visitante final abre el sitio del negocio. El script:
   - genera o recupera un `visitor_id` (uuid) de `localStorage`.
   - hace un `GET` público de solo lectura a `bots` (vía Edge Function o
     policy RLS pública) para obtener `primary_color`, `avatar_url`,
     `name`, `is_active`.
   - si `is_active = false`, no renderiza el widget.
   - inyecta un botón flotante y un contenedor de chat (shadow DOM para
     aislar estilos del sitio anfitrión).
3. El visitante abre el chat y escribe un mensaje.
4. El widget llama `POST /functions/v1/chat` con
   `{ bot_id, visitor_id, message, conversation_id? }`.
5. La Edge Function:
   - valida `bot_id` activo y aplica rate limiting (ver `07-seguridad`).
   - si no hay `conversation_id`, crea fila en `conversations`
     (`source = 'widget'`).
   - guarda el mensaje de usuario en `messages`.
   - arma el prompt: `system_prompt` del bot + `knowledge_sources`
     relevantes + últimos N mensajes de la conversación.
   - llama a la API de Groq (`GROQ_API_KEY`, secreto de servidor de la
     Edge Function, nunca en el frontend).
   - guarda la respuesta en `messages`, incrementa `usage_metrics` del mes.
   - devuelve `{ conversation_id, reply }` al widget.
6. El widget renderiza la respuesta y mantiene el `conversation_id` en
   memoria/sessionStorage para la sesión de navegación actual.
7. Si el negocio alcanza el límite de plan (`usage_metrics.messages_count`),
   la Edge Function responde con un error controlado y el widget muestra un
   mensaje de "servicio no disponible por el momento".

## 3. Componentes a crear
- `src/widget/index.ts` — punto de entrada, lee `data-bot-id` del script
  tag y las credenciales de Supabase de `import.meta.env` (inyectadas en
  build-time, no del HTML), monta el widget.
- `src/widget/ChatWidget` (sin framework: DOM API + shadow root) —
  botón flotante, panel de chat, input, lista de mensajes.
- `src/widget/chatClient.ts` — módulo compartido de llamada al endpoint
  `chat` (reutilizado también por `DemoChatWidget` en landing/onboarding).
- `supabase/functions/chat/index.ts` — Edge Function principal.
- `supabase/functions/chat/promptBuilder.ts` — ensambla `system_prompt` +
  `knowledge_sources` + historial.
- `supabase/functions/chat/rateLimit.ts` — lógica de límites (ver
  `07-seguridad`).

## 4. Modelo de datos involucrado
- `bots` (lectura pública limitada: `id`, `name`, `primary_color`,
  `avatar_url`, `is_active`; nunca `system_prompt` completo).
- `knowledge_sources` (lectura server-side únicamente, dentro de la Edge
  Function).
- `conversations`, `messages` (creadas/actualizadas por la Edge Function,
  nunca directo desde el widget con la `anon key` a las tablas).
- `usage_metrics` (incrementado por la Edge Function tras cada respuesta
  exitosa).

## 5. Criterios de aceptación
- El `<script>` funciona embebido en una página HTML plana sin conflictos
  de CSS/JS con el sitio anfitrión (validado con shadow DOM).
- Una conversación completa (mensaje → respuesta) persiste correctamente en
  `conversations`/`messages` y es visible en tiempo real en el dashboard
  (`06-dashboard`).
- Un bot con `is_active = false` no se renderiza en el sitio del cliente.
- Al superar el límite de plan, el widget informa al visitante sin exponer
  detalles internos (mensaje genérico, no un stack trace ni error 500 crudo).
- El bundle del widget es minimal (sin dependencias de React) y su peso se
  mantiene bajo un presupuesto acordado (ej. < 30kb gzip).

## 6. Consideraciones de seguridad
- El widget nunca contiene la API key de Groq ni la `service_role key`
  de Supabase; solo usa la `anon key` para la llamada pública a la Edge
  Function.
- La Edge Function valida `bot_id` existente y activo antes de procesar
  cualquier mensaje.
- Rate limiting por `visitor_id` + IP + `bot_id` (ver `07-seguridad`) para
  prevenir abuso/DoS económico contra la cuenta de Groq del negocio.
- Sanitizar el `message` del usuario antes de incluirlo en el prompt
  (longitud máxima, remover secuencias de control) y sanitizar la respuesta
  del modelo antes de renderizarla en el DOM del widget (evitar XSS).
- CORS de la Edge Function configurado para aceptar solicitudes desde
  cualquier origen (el widget se embebe en dominios de terceros), pero sin
  exponer endpoints administrativos en el mismo dominio de funciones.
