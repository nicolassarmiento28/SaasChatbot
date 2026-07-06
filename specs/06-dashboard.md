# 06 - Dashboard

## 1. Objetivo
Dar al dueño de negocio visibilidad en tiempo real de las conversaciones que
su(s) bot(s) sostienen con visitantes finales, y de su consumo respecto a los
límites de su plan.

## 2. Flujo del usuario paso a paso
1. El usuario inicia sesión y llega a `/dashboard` (requiere `02-auth`).
2. Ve un resumen general: número de conversaciones activas hoy, mensajes
   usados este mes vs. límite del plan (`usage_metrics`), y estado de
   sus bots (activo/inactivo).
3. En `/dashboard/conversaciones`, ve una lista de `conversations` de sus
   bots, ordenadas por `started_at` desc, con filtro por `bot_id` y por
   `source` (`widget` | `demo`).
4. Nuevas conversaciones/mensajes aparecen en la lista **sin recargar la
   página**, vía Supabase Realtime (suscripción a `conversations`/`messages`
   filtrada por `business_id`).
5. Al seleccionar una conversación, ve el hilo completo de `messages`
   (`role`, `content`, `created_at`) en orden cronológico.
6. En `/dashboard/uso`, ve un gráfico simple de `usage_metrics.messages_count`
   por `period` (mes) y su límite según `plan`.
7. Puede navegar desde el dashboard a `/dashboard/bots` (`04-bot-config`)
   para ajustar configuración si nota comportamiento indeseado del bot.

## 3. Componentes a crear
- `DashboardHome` (resumen/summary cards con Ant Design `Statistic`).
- `ConversationList` (tabla con filtros, Ant Design `Table`).
- `ConversationDetail` (hilo de mensajes, estilo chat de solo lectura).
- `UsageChart` (gráfico de `usage_metrics`, componente de charts ya usado en
  el proyecto o Ant Design `Progress`/`Statistic` si no se justifica una
  librería de gráficos nueva).
- `useRealtimeConversations` hook — encapsula la suscripción Realtime y el
  cleanup de canal al desmontar.

## 4. Modelo de datos involucrado
- `conversations`, `messages` (solo lectura desde el dashboard).
- `usage_metrics` (solo lectura).
- `bots` (para el filtro por bot y mostrar nombre/estado).
- Todo protegido por RLS vía `business_id`/`bot_id` → `businesses.owner_id
  = auth.uid()`.

## 5. Criterios de aceptación
- Al enviar un mensaje desde el widget o la demo, la conversación aparece en
  `/dashboard/conversaciones` en segundos, sin recargar (Realtime).
- Un usuario solo ve conversaciones de bots que pertenecen a su propio
  negocio (verificado con dos negocios de prueba distintos).
- El resumen de uso refleja correctamente `messages_count` acumulado del
  mes en curso.
- Filtrar por `bot_id` o `source` actualiza la lista sin recargar toda la
  página.
- Cerrar/reabrir el dashboard no genera suscripciones Realtime duplicadas
  (un solo canal activo por sesión de dashboard).

## 6. Consideraciones de seguridad
- Las policies RLS de `conversations`/`messages`/`usage_metrics` deben
  filtrar correctamente por `business_id` derivado de `bot_id`, evitando que
  un negocio vea datos de otro (verificar con test de RLS cruzado).
- Las suscripciones Realtime respetan las mismas policies RLS que las
  consultas normales (Supabase Realtime evalúa RLS por definición); no se
  debe abrir un canal "amplio" sin filtro que dependa solo de lógica de
  cliente.
- El dashboard es de solo lectura sobre conversaciones/mensajes: no permite
  editar o eliminar mensajes históricos (evita manipulación de registros que
  podrían usarse como evidencia/soporte).
- No mostrar en el dashboard ningún dato bruto de la API key de Groq ni
  configuración de la Edge Function.

## UI del dashboard
- Layout con sidebar de navegación lateral fijo
- Sidebar light mode: fondo #E1F5EE, borde derecho #9FE1CB
- Sidebar dark mode: gradiente linear-gradient(180deg, #04342C, #2C2C2A), borde derecho #085041
- Nav items: icono + texto, borde izquierdo #1D9E75 en light y #5DCAA5 en dark cuando está activo
- Item activo light: fondo #C8EDDF, texto #04342C
- Item activo dark: fondo rgba(255,255,255,0.1), texto #fff
- Items inactivos light: texto #0F6E56
- Items inactivos dark: texto #9FE1CB
- Logo arriba del sidebar con plan del usuario debajo
- Footer del sidebar con email y botón cerrar sesión
- Contenido light: fondo #F2FAF7, topbar blanco con borde #9FE1CB
- Contenido dark: fondo #0e0e0d, topbar con borde #444441
- Stat cards light: fondo #fff, borde #9FE1CB
- Stat cards dark: fondo #1a1a18, borde #444441
- Stat card destacada light: fondo #E1F5EE
- Stat card destacada dark: fondo #04342C, borde #085041
- Badge activo light: fondo #E1F5EE, texto #1D9E75
- Badge activo dark: fondo #04342C, texto #5DCAA5
- Indicador en vivo: badge verde teal en el topbar
