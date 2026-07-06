# 03 - Onboarding

## 1. Objetivo
Guiar al dueño de negocio recién registrado, en pasos cortos, desde una
cuenta vacía hasta tener un bot activo con conocimiento básico cargado y
listo para embeber, orquestando features ya existentes (`02-auth`,
`04-bot-config`).

## 2. Flujo del usuario paso a paso
1. Tras el primer registro, el usuario es redirigido a `/onboarding` (se
   determina "primera vez" si el negocio no tiene ningún `bots` asociado).
2. **Paso 1 — Datos del negocio**: confirma/edita `name` del negocio
   (ya creado por el trigger en `02-auth`) y opcionalmente el `slug` público.
3. **Paso 2 — Crear el bot**: define `name`, `tone` y `primary_color` del
   primer bot. Se crea la fila en `bots` con un `system_prompt` generado a
   partir de estos datos (reutiliza lógica de `04-bot-config`).
4. **Paso 3 — Conocimiento inicial**: el usuario agrega 1 a 3
   `knowledge_sources` de tipo `text` o `faq` (ej. horarios, dirección,
   preguntas frecuentes). Puede omitir este paso.
5. **Paso 4 — Prueba y confirmación**: se muestra un mini-chat de prueba
   contra el bot recién creado (mismo componente `DemoChatWidget` de
   `01-landing`, apuntando al `bot_id` real).
6. **Paso 5 — Instalación**: se muestra el snippet `<script>` para embeber
   el widget (ver `05-widget`) con opción de copiar al portapapeles.
7. Al completar (o saltar) el último paso, se marca el onboarding como
   completo y se redirige a `/dashboard`.

## 3. Componentes a crear
- `OnboardingWizard` (contenedor con Ant Design `Steps`).
- `StepBusinessInfo`, `StepCreateBot`, `StepKnowledgeBase`, `StepTestBot`,
  `StepInstallWidget`.
- `useOnboardingStatus` hook — determina si el negocio ya tiene bots
  (`select count(*) from bots where business_id = ...`) para decidir si
  redirigir a onboarding o al dashboard tras login.

## 4. Modelo de datos involucrado
- `businesses` (actualiza `name`/`slug`).
- `bots` (inserta la primera fila).
- `knowledge_sources` (inserta 0–3 filas iniciales).
- No requiere columnas nuevas: el estado "onboarding completo" se deriva de
  la existencia de al menos un bot, sin necesidad de un flag adicional.

## 5. Criterios de aceptación
- Un usuario nuevo sin bots es redirigido a `/onboarding`; uno con al menos
  un bot va directo a `/dashboard`.
- Es posible completar el wizard de principio a fin y terminar con un bot
  `is_active = true`, visible en el dashboard.
- Los pasos de conocimiento e instalación pueden omitirse sin bloquear el
  flujo.
- El mini-chat de prueba del paso 4 responde usando el `system_prompt` y las
  `knowledge_sources` reales recién creadas.
- Refrescar la página en medio del wizard no pierde el bot ya creado (el
  wizard puede reanudar detectando qué recursos ya existen).

## 6. Consideraciones de seguridad
- Todas las escrituras (`businesses`, `bots`, `knowledge_sources`) pasan por
  RLS estándar (`business_id`/`owner_id = auth.uid()`), sin excepciones ni
  policies especiales para el onboarding.
- El mini-chat de prueba usa el mismo endpoint `chat` autenticado por
  `bot_id` público de solo lectura, igual que la demo — no expone la API key
  de Groq ni el `system_prompt` crudo al cliente.
- Validar longitud y tipo de contenido de `knowledge_sources` en el paso 3
  para evitar que texto excesivamente largo o malformado se envíe como
  contexto al modelo (ver también `07-seguridad`).
