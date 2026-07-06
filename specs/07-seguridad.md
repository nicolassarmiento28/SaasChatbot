# 07 - Seguridad (Hardening Transversal)

## 1. Objetivo
Consolidar, una vez el flujo completo funciona de punta a punta, las medidas
de seguridad transversales del producto: rate limiting, revisión de RLS,
límites de plan, y validación de inputs en todos los puntos de entrada
públicos.

## 2. Flujo del usuario paso a paso
No es una feature con flujo de UI propio; es una revisión/endurecimiento que
se aplica sobre flujos existentes. El "flujo" es de auditoría:
1. Se listan todos los endpoints públicos (Edge Functions y policies RLS
   accesibles sin auth): `chat`, lectura pública de `bots`.
2. Se revisa cada policy RLS de cada tabla de negocio, confirmando que
   ningún `select`/`insert`/`update`/`delete` es alcanzable sin que
   `business_id` (directo o vía `bot_id`) coincida con
   `businesses.owner_id = auth.uid()`, salvo las excepciones públicas
   explícitas y documentadas (lectura limitada de `bots` para
   landing/widget).
3. Se implementa/ajusta rate limiting en la Edge Function `chat`:
   por `visitor_id`, por IP y por `bot_id`, con ventanas de tiempo
   configurables (ej. N mensajes por minuto).
4. Se implementa el límite de mensajes por plan (`usage_metrics`), de forma
   que la Edge Function rechace peticiones una vez superado el cupo mensual
   del negocio, antes de llamar a la API de Groq (para no incurrir en
   costo innecesario).
5. Se valida y sanea toda entrada de usuario que llega a Edge Functions o a
   formularios del dashboard: longitud máxima, tipos esperados, escape de
   HTML donde se renderiza contenido dinámico.
6. Se documentan los hallazgos y se corrigen antes de considerar el
   producto listo para tráfico real.

## 3. Componentes a crear
- `supabase/functions/chat/rateLimit.ts` — lógica de rate limiting
  (ej. tabla auxiliar `rate_limit_events` o uso de un store en memoria/Redis
  si se agrega en el futuro; para el MVP, tabla Postgres simple con
  `visitor_id`/`ip`/`bot_id`/`created_at` y conteo por ventana).
- `supabase/functions/_shared/validation.ts` — helpers de validación/sanitización
  reutilizados por todas las Edge Functions públicas.
- Script/checklist de auditoría de policies RLS (`supabase/policies_review.sql`
  o documento equivalente), no un componente de UI.

## 4. Modelo de datos involucrado
- Tabla nueva `rate_limit_events` (o extensión de `usage_metrics` con
  granularidad más fina si se prefiere no crear tabla nueva):

  | columna     | tipo        | notas                                |
  |-------------|-------------|----------------------------------------|
  | id          | uuid        | PK                                    |
  | bot_id      | uuid        | FK → `bots.id`                        |
  | visitor_id  | text        |                                        |
  | ip          | text        |                                        |
  | created_at  | timestamptz | usado para calcular ventana deslizante |

- Revisión (no cambio de esquema) de policies en `businesses`, `bots`,
  `knowledge_sources`, `conversations`, `messages`, `usage_metrics`.

## 5. Criterios de aceptación
- Ningún endpoint público permite leer o escribir datos de un negocio que no
  sea el dueño de la sesión (o, para endpoints públicos como `chat`/lectura
  de `bots`, solo los campos explícitamente permitidos).
- Superar el rate limit configurado en `chat` responde con un error
  controlado (ej. HTTP 429) sin llamar a la API de Groq.
- Superar el límite de mensajes del plan responde con un error controlado
  distinto al de rate limit, indicando límite de plan alcanzado.
- Inputs excesivamente largos o con caracteres de control en `message` o en
  formularios del dashboard son rechazados o truncados antes de procesarse.
- Existe al menos un test que intenta acceder a datos de un negocio B usando
  la sesión de un negocio A y confirma que RLS lo bloquea.

## 6. Consideraciones de seguridad
- La API key de Groq y la `service_role key` de Supabase viven
  únicamente como secretos de Edge Functions, nunca en código de cliente ni
  en variables `VITE_*`.
- El rate limiting debe basarse en más de una señal (`visitor_id` es
  spoofeable por el cliente) combinando IP y `bot_id` para mitigar abuso.
- Revisar que las policies RLS usen `auth.uid()` y no confíen en valores
  enviados por el cliente (ej. no aceptar un `business_id` en el payload
  como fuente de verdad).
- Registrar (logging server-side) intentos de abuso/rate-limit excedido para
  poder ajustar umbrales, sin registrar contenido sensible de las
  conversaciones más allá de lo ya almacenado en `messages`.
- Este hardening es continuo: cualquier endpoint público nuevo que se
  agregue después debe pasar por esta misma checklist antes de salir a
  producción.
