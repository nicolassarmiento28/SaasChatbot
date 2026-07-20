# 06 - Dashboard

## 1. Objetivo
Dar al dueño de negocio visibilidad en tiempo real de las conversaciones que
su(s) bot(s) sostienen con visitantes finales, métricas de uso, alertas
proactivas de cuota e insights semanales para mejorar la base de conocimiento.

## 2. Flujo del usuario paso a paso
1. El usuario inicia sesión y llega a /dashboard (requiere 02-auth).
2. Ve un resumen general: conversaciones activas hoy, mensajes usados este
   mes vs límite del plan con BotHealthBadge, e InsightsCard semanal.
3. Si el uso supera el 80% del límite del plan, ve un banner de AlertaCuota
   con porcentaje usado, mensajes restantes y botón "Ver planes".
4. En /dashboard/conversaciones, ve lista de conversations ordenadas por
   started_at desc, con búsqueda por contenido de mensajes y filtros por
   bot_id, source (widget | demo), rango de fechas y "Necesita revisión".
5. Nuevas conversaciones/mensajes aparecen sin recargar vía Supabase Realtime.
6. Al seleccionar una conversación, ve el hilo completo de messages en orden
   cronológico. Los mensajes donde el bot no supo responder están marcados
   con ícono de advertencia y botón "Agregar a base de conocimiento".
7. En /dashboard/uso, ve gráfico de usage_metrics.messages_count por período
   y su límite según plan.
8. En /dashboard/plan, ve tabla comparativa de planes con upgrade destacado.
9. Puede navegar a /dashboard/bots para ajustar configuración.

## 3. Componentes a crear
- DashboardHome (summary cards + InsightsCard + AlertaCuota).
- ConversationList (tabla con búsqueda, filtros y badge "Necesita revisión").
- ConversationDetail (hilo de mensajes con marcadores de baja confianza
  y botón "Agregar a base de conocimiento").
- UsageChart (gráfico de usage_metrics con Ant Design Progress/Statistic).
- PlanComparison (tabla comparativa Free vs Pro vs Enterprise).
- BotHealthBadge (badge verde/amarillo/rojo con tooltip de detalle).
- InsightsCard (resumen semanal generado por Groq, con estado de carga).
- AlertaCuota (banner proactivo al 80% de uso, dismissable).
- useRealtimeConversations hook — encapsula suscripción Realtime y cleanup.
- useInsights hook — obtiene o genera el insight semanal del negocio.

## 4. Indicador de salud del bot (BotHealthBadge)
- Badge visible en DashboardHome y en BotList:
  - Verde: tasa de respuestas exitosas > 90% Y cuota < 80%.
  - Amarillo: tasa entre 70%-90% O cuota entre 80%-99%.
  - Rojo: tasa < 70% O cuota al 100%.
- Tasa de éxito: mensajes del bot sin frases de baja confianza /
  total mensajes del bot en los últimos 7 días.
- Al hacer hover muestra tooltip con: tasa exacta, cantidad de mensajes
  sin respuesta clara, cuota consumida del mes.

## 5. Modo sugerencia de mejora
- Frases que indican baja confianza del bot (detección por substring):
  "no tengo información", "no puedo responder", "no sé",
  "no tengo datos sobre", "consulta directamente", "no estoy seguro".
- Los mensajes con estas frases muestran ícono de advertencia naranja
  en ConversationDetail.
- Filtro "Necesita revisión" en ConversationList muestra solo conversaciones
  que contienen al menos un mensaje de baja confianza.
- Botón "Agregar a base de conocimiento" en ConversationDetail pre-carga
  la pregunta del usuario (mensaje anterior al de baja confianza) en
  KnowledgeSourceForm con type = faq.

## 6. Alertas proactivas de cuota
- Banner AlertaCuota visible en DashboardHome cuando:
  usage_metrics.messages_count >= 80% del límite del plan.
- Contenido: "Llevas X% de tu cuota mensual (Y de Z mensajes).
  Considera hacer upgrade para no interrumpir tu servicio."
  + botón "Ver planes" que navega a /dashboard/plan.
- El banner es dismissable (X para cerrar) pero vuelve a aparecer
  al recargar mientras siga en 80%+.
- Colores light mode: fondo #FAEEDA, borde #FAC775, texto #412402.
- Colores dark mode: fondo #412402, borde #633806, texto #FAC775.

## 7. Insights semanales
- InsightsCard en DashboardHome muestra el resumen de la semana actual.
- Se genera cada lunes con una llamada a la Edge Function /functions/v1/insights
  que analiza los messages de los últimos 7 días del negocio usando Groq.
- Contenido generado: top 5 preguntas más frecuentes, temas sin respuesta
  clara, 1-2 sugerencias concretas de mejora para knowledge_sources.
- El resultado se cachea en tabla insights para no regenerar en cada visita.
- Si no hay suficientes mensajes (menos de 5 en la semana), muestra:
  "Aún no hay suficientes conversaciones para generar insights esta semana."
- Requiere nueva tabla insights y Edge Function insights (ver sección 10).

## 8. Estados vacíos bien diseñados
- /dashboard/conversaciones sin datos: ilustración + "Aún no hay
  conversaciones. Comparte tu widget para empezar." + botón "Obtener snippet".
- /dashboard/bots con bot sin knowledge_sources: warning card "Tu bot
  responderá mejor si agregas información de tu negocio" + botón
  "Agregar conocimiento" que navega a /dashboard/bots/:id/knowledge.
- DashboardHome sin bots: guía visual con pasos para crear el primer bot,
  enlazando a /onboarding.
- Filtro "Necesita revisión" sin resultados: "¡Tu bot está respondiendo bien!
  No hay preguntas sin responder esta semana."

## 9. Diferenciación visual de plan
- En el sidebar, debajo del nombre del plan, barra de progreso de
  mensajes usados vs límite del plan actual.
- /dashboard/plan: tabla comparativa Free vs Pro vs Enterprise con:
  límite de mensajes/mes, número de bots permitidos, acceso a insights,
  soporte, y precio mensual.
- Botón "Upgrade" prominente solo cuando el usuario está en 80%+ de cuota
  o en la página /dashboard/plan.
- El plan actual está visualmente destacado en la tabla comparativa.

## 10. Modelo de datos involucrado
- conversations, messages (solo lectura desde el dashboard).
- usage_metrics (solo lectura).
- bots (para filtro, health badge y navegación a config).
- Nueva tabla insights:
  id uuid PK, business_id uuid FK businesses.id, week_start date,
  content text, created_at timestamptz — protegida con RLS.
- Nueva Edge Function /functions/v1/insights para generar y cachear insights.

## 11. Criterios de aceptación
- Al enviar un mensaje desde el widget, la conversación aparece en
  /dashboard/conversaciones en segundos sin recargar (Realtime).
- Un usuario solo ve conversaciones de sus propios bots (RLS verificado).
- El resumen de uso refleja correctamente messages_count del mes en curso.
- El health badge cambia de color según los umbrales definidos.
- El banner de alerta aparece exactamente al alcanzar el 80% de cuota.
- Los mensajes de baja confianza quedan marcados con el ícono correcto.
- El filtro "Necesita revisión" muestra solo conversaciones relevantes.
- Los insights se generan, cachean y muestran correctamente.
- Los estados vacíos se muestran cuando corresponde en cada sección.
- Cerrar/reabrir el dashboard no genera suscripciones Realtime duplicadas.

## 12. Consideraciones de seguridad
- RLS en todas las tablas incluyendo la nueva tabla insights.
- La Edge Function insights valida que el business_id del insight
  pertenece al usuario autenticado antes de generar o retornar datos.
- El dashboard es de solo lectura sobre conversaciones/mensajes: no
  permite editar ni eliminar mensajes históricos.
- No mostrar API key de Groq ni configuración de Edge Functions.
- Las suscripciones Realtime respetan las mismas policies RLS que las
  consultas normales.

## 13. Tests requeridos
- Test: conversación nueva aparece en lista sin recargar (Realtime).
- Test: usuario solo ve conversaciones de sus propios bots (RLS cruzado).
- Test: health badge es verde cuando tasa > 90% y cuota < 80%.
- Test: health badge es amarillo cuando cuota >= 80%.
- Test: health badge es rojo cuando cuota = 100%.
- Test: AlertaCuota aparece cuando messages_count >= 80% del límite.
- Test: filtro "Necesita revisión" retorna solo conversaciones con frases
  de baja confianza.
- Test: estado vacío de conversaciones muestra botón "Obtener snippet".
- Test: insights se cachean y no se regeneran en cada visita del mismo día.
- Test: no se generan suscripciones Realtime duplicadas al navegar.

## UI del dashboard
- Layout con sidebar de navegación lateral fijo en desktop.
- Sidebar light mode: fondo #E1F5EE, borde derecho #9FE1CB.
- Sidebar dark mode: gradiente linear-gradient(180deg, #04342C, #2C2C2A),
  borde derecho #085041.
- Nav items: icono + texto, borde izquierdo activo #1D9E75 en light
  y #5DCAA5 en dark.
- Item activo light: fondo #C8EDDF, texto #04342C.
- Item activo dark: fondo rgba(255,255,255,0.1), texto #fff.
- Items inactivos light: texto #0F6E56.
- Items inactivos dark: texto #9FE1CB.
- Logo arriba del sidebar con nombre del plan + barra de progreso de
  uso de mensajes debajo.
- Footer del sidebar con email del usuario y botón cerrar sesión.
- Contenido light: fondo #F2FAF7, topbar blanco con borde #9FE1CB.
- Contenido dark: fondo #0e0e0d, topbar con borde #444441.
- Stat cards light: fondo #fff, borde #9FE1CB.
- Stat cards dark: fondo #1a1a18, borde #444441.
- Stat card destacada light: fondo #E1F5EE.
- Stat card destacada dark: fondo #04342C, borde #085041.
- Indicador en vivo: badge verde teal en el topbar.
- Mobile: sidebar oculto, topbar con botón hamburguesa ☰ que abre
  el sidebar como Drawer de Ant Design desde la izquierda.
- Drawer mobile light: fondo #E1F5EE.
- Drawer mobile dark: gradiente linear-gradient(180deg, #04342C, #2C2C2A).
