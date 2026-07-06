# 01 - Landing Page

## 1. Objetivo
Página pública de marketing que explica el producto y permite a un visitante
probar una demo en vivo del chatbot antes de registrarse, con un CTA claro
hacia el registro.

## 2. Flujo del usuario paso a paso
1. El visitante llega a `/` (landing pública, sin autenticación).
2. Ve secciones de valor: hero, features, pricing, testimonios (contenido
   estático, sin llamadas a Supabase).
3. En la sección de demo, ve un widget de chat embebido directamente en la
   página (no vía `<script>`, sino el mismo componente React de la demo).
4. Escribe un mensaje. El componente de demo:
   - genera/recupera un `visitor_id` anónimo de `localStorage`.
   - llama a la Edge Function `POST /functions/v1/chat` con
     `bot_id` = bot de demo del producto (fijo, configurado por env var),
     `source = 'demo'`.
5. Recibe la respuesta de Groq (llama-3.1-8b-instant) y la renderiza en el hilo de chat.
6. Tras 1–2 intercambios, se muestra un banner/CTA "Crea tu propio chatbot" que
   lleva a `/registro` (feature `02-auth`).
7. El visitante puede seguir chateando sin límite artificial de mensajes,
   pero sujeto al rate limiting general de la Edge Function (ver `07-seguridad`).

## 3. Componentes a crear
- `LandingPage` (página raíz, compone las secciones).
- `HeroSection`, `FeaturesSection`, `PricingSection` (estáticos, Ant Design
  `Row`/`Col`/`Card`).
- `DemoChatWidget` — reutiliza la lógica de cliente del widget (`src/widget`
  expone un módulo de cliente `chatClient.ts` compartido) pero renderizado
  como componente React embebido en la landing, no como `<script>` externo.
- `SignupCta` — banner/botón que enlaza a `/registro`.

## 4. Modelo de datos involucrado
No introduce tablas nuevas. Reutiliza:
- `bots` (fila fija de "bot demo del producto", `id` conocido vía env var
  `VITE_DEMO_BOT_ID`).
- `conversations` / `messages` con `source = 'demo'`.
- `usage_metrics` (el bot demo también cuenta uso, para detectar abuso).

## 5. Criterios de aceptación
- La landing carga y renderiza sin sesión de Supabase Auth activa.
- El chat de demo funciona end-to-end contra la Edge Function `chat` real.
- El `visitor_id` persiste en `localStorage` entre recargas de página.
- El CTA de registro es visible después de la primera respuesta del bot.
- Ninguna llamada de red desde la landing incluye la API key de Groq ni
  el service role key de Supabase.
- Lighthouse/Core Web Vitals básicos aceptables (la landing no debe cargar el
  bundle completo del dashboard).

## 6. Consideraciones de seguridad
- La demo usa exclusivamente el endpoint público `chat` con `anon key`;
  nunca se conecta directo a las tablas `conversations`/`messages`.
- Rate limiting por `visitor_id` + IP en la Edge Function para evitar abuso
  del bot de demo (mismo mecanismo que el widget, ver `07-seguridad`).
- El `bot_id` de demo es de solo lectura pública (policy RLS específica que
  permite `select` de esa fila de `bots` sin auth), pero el `system_prompt`
  completo nunca se envía al navegador: se ensambla server-side en la Edge
  Function.
- Sanitizar el contenido del mensaje del bot antes de renderizar (evitar XSS
  si el modelo devuelve HTML/markdown sin escapar).

## 7. Responsividad y modo claro/oscuro
- La landing debe verse correctamente en mobile, tablet y desktop (breakpoints
  estándar de Ant Design: `xs`/`sm`/`md`/`lg`/`xl`), usando `Row`/`Col`
  responsivos en vez de layouts fijos en píxeles.
- `DemoChatWidget` debe ser usable en pantallas pequeñas (panel a pantalla
  completa o modal en mobile, panel flotante en desktop).
- Debe soportar light mode y dark mode:
  - Detecta preferencia del sistema (`prefers-color-scheme`) por defecto.
  - Permite override manual con un toggle, persistido en `localStorage`.
  - Se implementa con el `ConfigProvider`/algoritmo de tema de Ant Design
    (`theme.darkAlgorithm` / `theme.defaultAlgorithm`), sin duplicar estilos
    a mano por sección.
- Criterio de aceptación: la landing no tiene overflow horizontal en ningún
  breakpoint, y cambiar de tema no deja componentes con colores del tema
  anterior (contraste de texto/fondo correcto en ambos modos).



## 8. Paleta de colores

### Light mode — Menta suave + Carbon
- Página: #F2FAF7
- Hero bg: #E1F5EE
- Sección demo: #D4EDE5 (seafoam)
- Cards: #ffffff
- Texto primario: #0e0e0d
- Texto secundario: #444441
- Botón primario: #2C2C2A con texto #5DCAA5
- Acento teal: #1D9E75
- Acento teal suave: #5DCAA5
- Bordes: #9FE1CB

### Dark mode — Carbon + Teal
- Página: #0e0e0d
- Hero bg: #2C2C2A
- Cards: #1a1a18
- Texto primario: #F1EFE8
- Texto secundario: #B4B2A9
- Botón primario: #1D9E75
- Acento teal: #5DCAA5
- Bordes: #444441
- Sección demo: #1a1a18
- Card de información (DEMO_RESTAURANTE): fondo #2C2C2A, borde #5DCAA540
- Card del chat: gradiente linear-gradient(135deg, #2C2C2A 0%, #04342C 100%), borde #1D9E7530


### Footer
- En light mode: fondo negro (#0e0e0d) con texto blanco — crea contraste dramático con el fondo menta
- En dark mode: fondo teal oscuro (#04342C) con texto (#9FE1CB) — complementa el carbon del resto
- El footer incluye: logo, links de navegación, redes sociales y copyright
- La transición de color del footer también tiene fade suave de 300ms al cambiar de tema

## 09. Detalles de UI

### Icono de login en navbar
- En vez de botón de texto, usar un icono de persona/usuario (UserOutlined de Ant Design)
- Al hacer click abre un dropdown con dos opciones: "Iniciar sesión" y "Crear cuenta"
- El icono tiene un tooltip que dice "Acceder" al hacer hover
- En mobile el icono se mantiene visible siempre en la navbar

### Chatbot animado con partículas
- Cuando el bot está escribiendo (loading state): mostrar 3 puntos animados con efecto de onda
- Cuando llega la respuesta: partículas de color teal (#5DCAA5) explotan suavemente desde el mensaje
- Las partículas son pequeños círculos y destellos que se desvanecen en 800ms
- El avatar del bot tiene un anillo de color teal que pulsa suavemente cuando está activo
- Usar canvas o CSS keyframes para las partículas, sin librerías pesadas externas
- El efecto respeta prefers-reduced-motion

### Toggle de modo claro/oscuro animado
- El botón es un ícono de sol/luna que morfea entre los dos estados
- Al cambiar de modo: el ícono rota 360° mientras transiciona entre sol y luna
- El fondo de toda la página hace un fade suave de 300ms al cambiar de tema
- El botón vive en la navbar junto al ícono de usuario
- En dark mode muestra luna, en light mode muestra sol
- El estado persiste en localStorage
- La animación respeta prefers-reduced-motion

Agrega dentro de la sección ## 10. Detalles de UI en specs/01-landing.md:

### Navegación tipo single page
- La landing es una sola página con scroll suave entre secciones
- La navbar tiene links a cada sección: Inicio, Características, Demo, Precios
- Al hacer click en un link de la navbar hace scroll suave (smooth scroll) hasta esa sección
- Cada sección tiene un id: #inicio, #caracteristicas, #demo, #precios
- La navbar detecta en qué sección estás al hacer scroll y resalta el link activo
- En mobile la navbar colapsa en un menú hamburguesa con los mismos links
- La navbar es sticky — se queda fija arriba al hacer scroll
- Al hacer scroll hacia abajo la navbar agrega una sombra sutil para dar profundidad

Implementar con ConfigProvider de Ant Design usando theme.darkAlgorithm y theme.defaultAlgorithm con estos tokens exactos.

### Nav items — Pill activo
- Los links de navegación tienen estilo pill activo
- El contenedor de links tiene fondo redondeado: light #E1F5EE, dark #1a1a18
- El link activo tiene fondo #2C2C2A con texto #5DCAA5 en light mode
- El link activo tiene fondo #1D9E75 con texto #fff en dark mode
- Al hacer hover en links inactivos: fondo #9FE1CB40 en light, #2C2C2A en dark
- La transición entre estados es de 0.25s ease
- El pill activo se actualiza automáticamente al hacer scroll entre secciones

### Card del chatbot demo
- Light mode: glassmorphism — background rgba(255,255,255,0.6) con backdrop-filter blur(12px), borde #9FE1CB80, sombra #1D9E7520
- Dark mode: gradiente teal — background linear-gradient(135deg, #2C2C2A 0%, #04342C 100%), borde #1D9E7530, sombra #00000080
- Burbujas del bot en light: fondo #E1F5EE, texto #04342C
- Burbujas del bot en dark: fondo semitransparente #1a1a1860, texto #E1F5EE
- Burbujas del usuario en ambos modos: fondo #1D9E75, texto #fff
- Input en light: fondo #E1F5EE80, texto #04342C
- Input en dark: fondo #1a1a1880, texto #9FE1CB
- Botón enviar en light: fondo #2C2C2A, texto #5DCAA5
- Botón enviar en dark: fondo #5DCAA5, texto #04342C
- Botón "Probar demo" en light: fondo #2C2C2A, texto #5DCAA5
- Botón "Probar demo" en dark: fondo #1D9E75, texto #fff
### Card de información del chatbot demo
- El texto DEMO_RESTAURANTE, la descripción y los tags de preguntas frecuentes 
  van dentro de un card superior separado del card del chat
- Los dos cards se ven como una unidad visual conectada verticalmente
- Light mode: mismo glassmorphism que el card del chat — background rgba(255,255,255,0.6) 
  con backdrop-filter blur(12px), borde #9FE1CB80
- Dark mode: mismo gradiente teal — background linear-gradient(135deg, #2C2C2A 0%, #04342C 100%), 
  borde #1D9E7530
- El label DEMO_RESTAURANTE en color #5DCAA5 en ambos modos
- La descripción en #444441 en light y #B4B2A9 en dark
- Los tags de preguntas en light: fondo #E1F5EE, texto #085041
- Los tags de preguntas en dark: fondo #1a1a1880, texto #9FE1CB
- Separación entre los dos cards de 8px

### Menú hamburguesa — overlay pantalla completa
- Se activa en mobile cuando la navbar colapsa
- Overlay con gradiente linear-gradient(135deg, #04342C, #2C2C2A) en ambos modos light y dark
- Botón X para cerrar: fondo #085041, ícono #9FE1CB
- Links grandes (22px, font-weight 600) centrados verticalmente
- Links en #E1F5EE excepto Precios que resalta en #5DCAA5
- Separador entre links: border-bottom 0.5px solid #085041
- Animación de entrada: links aparecen en cascada desde abajo con delay de 50ms entre cada uno
- Al fondo: botón CTA "Crear cuenta gratis →" fondo #5DCAA5, texto #04342C
- Animación de apertura/cierre: fade + scale suave de 200ms
- Respeta prefers-reduced-motion

Luego implementa este menú hamburguesa en la navbar de la landing page.

### Footer — logo con scroll al inicio
- El texto/logo "SaasChatbotIA" en el footer es clickeable
- Al hacer click hace scroll suave hasta #inicio de la página
- Cursor pointer al hacer hover
- Sin subrayado