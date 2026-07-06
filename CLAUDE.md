
# SaasChatbotIA

## Descripción
SaaS donde dueños de negocios pequeños crean su propio chatbot de atención al cliente. Incluye landing page con demo en vivo, dashboard de administración, y widget embebible.

## Stack
- Frontend: React + Vite + Ant Design
- Backend: Supabase (Auth, DB, Storage)
- IA: Groq API (llama-3.1-8b-instant)
- Widget: Vanilla JS
- Landing page: React + Vite + Ant Design

## Estructura del proyecto
- /specs → especificaciones SDD (leer siempre antes de codear)
- /src/features → un folder por feature
- /src/shared → componentes y utils compartidos
- /src/widget → widget vanilla JS embebible
- /supabase → migraciones y configuración
- /tests → pruebas unitarias y e2e

## Comandos
- npm run dev → servidor local
- npm run build → build producción
- npm test → tests con Vitest

## Convenciones
- TypeScript estricto, sin any
- Named exports siempre
- Componentes funcionales
- Variables de entorno en .env.local


## Infraestructura requerida en cada spec
- Ejecutar siempre las migraciones en Supabase remoto después de crearlas
- Configurar todas las variables de entorno necesarias en .env.local
- Verificar que las views y tablas existen en Supabase dashboard
- Aplicar seeds de datos de prueba si la spec los requiere
- Confirmar que todo funciona end-to-end antes de marcar la spec como completa

## Skills
- Usa siempre Ponytail para ahorro de tokens en cada tarea del proyecto.
- frontend-design → usar para todo el diseño de la landing page
- ui-ux-pro-max → usar para la experiencia de usuario de la landing page

## MCP
- Usar siempre Context7 MCP para consultar documentación actualizada
  de todas las librerías del proyecto antes de implementar:
  React, Vite, Ant Design, Supabase, TypeScript, Deno y cualquier
  otra dependencia del proyecto.
- Nunca asumir que el conocimiento interno sobre una librería es actual —
  siempre verificar con Context7 primero.

## Reglas para Claude
- Siempre leer la spec correspondiente antes de escribir código
- No instalar dependencias sin mencionarlo
- Crear tests junto con cada feature
- Pedir confirmación antes de cambios grandes
