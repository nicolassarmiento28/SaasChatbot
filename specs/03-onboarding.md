# 03 - Onboarding

## 1. Objetivo
Guiar al dueño de negocio recién registrado, en pasos cortos, desde una
cuenta vacía hasta tener un bot activo con conocimiento básico cargado y
listo para embeber, orquestando features ya existentes (02-auth, 04-bot-config).

## 2. Flujo del usuario paso a paso
1. Tras el primer registro, el usuario es redirigido a /onboarding (se
   determina "primera vez" si el negocio no tiene ningún bots asociado).
2. Paso 1 — Selección de plantilla por rubro: el usuario elige entre
   restaurante, clínica, tienda online o inmobiliaria. Cada plantilla
   pre-carga tone, 3-5 FAQs típicas del rubro y system_prompt base.
   Puede omitir y partir desde cero.
3. Paso 2 — Datos del negocio y bot: confirma/edita name del negocio
   y define name, tone y primary_color del primer bot. Preview en tiempo
   real del widget mientras edita — ve cómo se verá antes de guardar.
4. Paso 3 — Conocimiento inicial: el usuario agrega 1 a 3
   knowledge_sources de tipo text o faq. Las FAQs de la plantilla
   elegida aparecen pre-cargadas y editables. Puede omitir este paso.
5. Paso 4 — Prueba y confirmación: se muestra un mini-chat de prueba
   contra el bot recién creado (mismo componente DemoChatWidget de
   01-landing, apuntando al bot_id real).
6. Paso 5 — Instalación: se muestra el snippet script para embeber
   el widget con opción de copiar al portapapeles.
7. Al completar (o saltar) el último paso, se marca el onboarding como
   completo y se redirige a /dashboard.

## 3. Componentes a crear
- OnboardingWizard (contenedor con Ant Design Steps).
- StepTemplateSelector — grid de 4 plantillas por rubro con preview.
- StepBusinessInfo con preview en tiempo real del widget.
- StepCreateBot, StepKnowledgeBase, StepTestBot, StepInstallWidget.
- useOnboardingStatus hook — determina si el negocio ya tiene bots
  para decidir si redirigir a onboarding o al dashboard tras login.

## 4. Plantillas por rubro
Cada plantilla incluye tone sugerido, system_prompt base y FAQs pre-cargadas.

### Restaurante
- tone: amigable
- FAQs: horario de atención, ¿hacen delivery?, opciones vegetarianas,
  cómo hacer una reserva, dirección y estacionamiento

### Clínica
- tone: formal
- FAQs: horarios de atención, especialidades disponibles, cómo agendar
  una cita, seguros y convenios aceptados, qué hacer en caso de urgencia

### Tienda online
- tone: amigable
- FAQs: métodos de pago aceptados, tiempos de envío, política de
  devoluciones, cómo verificar stock, descuentos y promociones vigentes

### Inmobiliaria
- tone: formal
- FAQs: tipos de propiedad disponibles, zonas o comunas donde operan,
  cómo contactar a un agente, cómo agendar una visita, opciones de
  financiamiento disponibles

## 5. Estados vacíos bien diseñados
- Cada paso vacío muestra ilustración + mensaje orientador claro.
- Paso de conocimiento sin FAQs: "Agrega información de tu negocio
  para que el bot responda mejor" con botón de agregar.
- El wizard nunca muestra una pantalla en blanco sin guía visual.
- Si el usuario omite pasos, el estado final del dashboard muestra
  un checklist de pasos pendientes para completar la configuración.

## 6. Modelo de datos involucrado
- businesses (actualiza name/slug).
- bots (inserta la primera fila).
- knowledge_sources (inserta 0-3 filas iniciales con FAQs de plantilla).
- No requiere columnas nuevas: el estado "onboarding completo" se deriva
  de la existencia de al menos un bot, sin necesidad de un flag adicional.

## 7. Criterios de aceptación
- Un usuario nuevo sin bots es redirigido a /onboarding; uno con al menos
  un bot va directo a /dashboard.
- Las plantillas pre-cargan correctamente tone, FAQs y system_prompt base.
- El preview en tiempo real del widget se actualiza al editar tone y color.
- Es posible completar el wizard de principio a fin y terminar con un bot
  is_active = true, visible en el dashboard.
- Los pasos de conocimiento e instalación pueden omitirse sin bloquear el flujo.
- El mini-chat de prueba responde usando el system_prompt y knowledge_sources reales.
- Refrescar la página en medio del wizard no pierde el bot ya creado.

## 8. Consideraciones de seguridad
- Todas las escrituras (businesses, bots, knowledge_sources) pasan por
  RLS estándar (business_id/owner_id = auth.uid()), sin excepciones.
- El mini-chat de prueba usa el mismo endpoint chat autenticado por
  bot_id público de solo lectura, igual que la demo.
- Validar longitud y tipo de contenido de knowledge_sources en el paso 3
  para evitar que texto excesivamente largo se envíe como contexto al modelo.

## 9. Tests requeridos
- Test: usuario nuevo sin bots es redirigido a /onboarding.
- Test: usuario con bots va directo a /dashboard.
- Test: aplicar plantilla restaurante pre-llena tone = "amigable" y 5 FAQs.
- Test: el preview del widget se actualiza al cambiar primary_color.
- Test: omitir paso 3 no bloquea el flujo ni rompe el bot creado.
- Test: refrescar en paso 3 no pierde el bot creado en paso 2.
