# 00 - Arquitectura

## 1. Visión general del proyecto

SaasChatbotIA es un SaaS que permite a dueños de negocios pequeños crear su propio
chatbot de atención al cliente sin necesidad de conocimientos técnicos. El producto
tiene tres superficies:

1. **Landing page** — presenta el producto y ofrece una demo en vivo del chatbot
   para que un visitante pueda probarlo antes de registrarse.
2. **Dashboard de administración** — donde el dueño del negocio configura su bot
   (nombre, tono, base de conocimiento, apariencia) y consulta conversaciones.
3. **Widget embebible** — script vanilla JS que el cliente pega en su propio sitio
   web para exponer el chatbot a sus usuarios finales.

El backend es serverless sobre Supabase (Postgres + Auth + Storage + Realtime) y la
inteligencia conversacional se delega en la API de Groq (llama-3.1-8b-instant).

## 2. Diagrama de arquitectura (texto)

```
                            ┌───────────────────────────┐
                            │         Groq API          │
                            │   (llama-3.1-8b-instant)  │
                            └─────────────▲─────────────┘
                                        │ prompts / respuestas
                                        │
        ┌───────────────────────────────────────────────────────┐
        │                    Supabase (Backend)                   │
        │  ┌───────────┐  ┌───────────┐  ┌────────────────────┐  │
        │  │   Auth    │  │  Postgres │  │  Edge Functions      │  │
        │  │ (usuarios)│  │  (datos)  │  │  (proxy a Groq,    │  │
        │  └───────────┘  └───────────┘  │   lógica servidor)   │  │
        │  ┌───────────┐                 └────────────────────┘  │
        │  │  Storage  │  (logos, archivos de base de             │
        │  │           │   conocimiento)                          │
        │  └───────────┘                                          │
        └───────────────────────────────────────────────────────┘
                 ▲                     ▲                     ▲
                 │ REST/Realtime       │ REST/Realtime       │ REST
                 │                     │                     │
     ┌───────────────────┐  ┌───────────────────┐  ┌──────────────────────┐
     │   Landing page      │  │  Dashboard admin    │  │  Widget embebible      │
     │ (React + Vite +     │  │ (React + Vite +     │  │ (Vanilla JS, <script>  │
     │  Ant Design)         │  │  Ant Design)         │  │  en sitios de clientes)│
     │  - Demo en vivo      │  │  - Config del bot    │  │  - Chat en vivo con    │
     │                      │  │  - Conversaciones    │  │    visitantes finales  │
     └───────────────────┘  └───────────────────┘  └──────────────────────┘
```

Notas:
- El widget y la landing **nunca** llaman directamente a la API de Groq desde
  el navegador: siempre pasan por una Edge Function de Supabase que agrega la
  API key de forma segura y aplica límites de uso por negocio.
- Realtime de Supabase se usa para reflejar conversaciones nuevas en el dashboard
  sin necesidad de polling.

## 3. Modelo de datos de Supabase

Todas las tablas usan `id uuid primary key default gen_random_uuid()` y
`created_at timestamptz default now()` salvo que se indique lo contrario. RLS
(Row Level Security) habilitado en todas las tablas que contienen datos de negocio.

### `businesses`
Representa la cuenta/negocio de un usuario dueño.

| columna         | tipo          | notas                                   |
|-----------------|---------------|------------------------------------------|
| id              | uuid          | PK                                        |
| owner_id        | uuid          | FK → `auth.users.id`                      |
| name            | text          | nombre del negocio                        |
| slug            | text unique   | usado en URL pública de demo              |
| plan            | text          | `free` \| `pro` \| `enterprise`           |
| created_at      | timestamptz   |                                            |

### `bots`
Configuración del chatbot de un negocio. Un negocio puede tener uno o más bots
(por ejemplo, en planes superiores).

| columna         | tipo          | notas                                   |
|-----------------|---------------|--------------------------------------------|
| id              | uuid          | PK                                        |
| business_id     | uuid          | FK → `businesses.id`                      |
| name            | text          | nombre visible del bot                    |
| tone            | text          | `formal` \| `casual` \| `amigable`, etc.  |
| system_prompt   | text          | prompt base generado a partir de config   |
| avatar_url      | text          | referencia a Storage                      |
| primary_color   | text          | color del widget                          |
| is_active       | boolean       | default true                              |
| created_at      | timestamptz   |                                            |

### `knowledge_sources`
Fragmentos de conocimiento (FAQ, documentos, texto libre) que alimentan al bot.

| columna         | tipo          | notas                                   |
|-----------------|---------------|--------------------------------------------|
| id              | uuid          | PK                                        |
| bot_id          | uuid          | FK → `bots.id`                            |
| type            | text          | `faq` \| `document` \| `text`             |
| title           | text          |                                            |
| content         | text          | texto plano usado como contexto           |
| file_url        | text nullable | referencia a Storage si `type = document` |
| created_at      | timestamptz   |                                            |

### `conversations`
Una conversación entre un visitante final y el bot (vía widget o demo).

| columna         | tipo          | notas                                   |
|-----------------|---------------|--------------------------------------------|
| id              | uuid          | PK                                        |
| bot_id          | uuid          | FK → `bots.id`                            |
| source          | text          | `widget` \| `demo`                        |
| visitor_id      | text          | identificador anónimo (cookie/local id)   |
| started_at      | timestamptz   |                                            |
| ended_at        | timestamptz nullable |                                     |

### `messages`
Mensajes individuales dentro de una conversación.

| columna         | tipo          | notas                                   |
|-----------------|---------------|--------------------------------------------|
| id              | uuid          | PK                                        |
| conversation_id | uuid          | FK → `conversations.id`                   |
| role            | text          | `user` \| `assistant`                     |
| content         | text          |                                            |
| created_at      | timestamptz   |                                            |

### `usage_metrics`
Contadores de uso para límites de plan (mensajes/mes por negocio).

| columna         | tipo          | notas                                   |
|-----------------|---------------|--------------------------------------------|
| id              | uuid          | PK                                        |
| business_id     | uuid          | FK → `businesses.id`                      |
| period          | date          | primer día del mes                        |
| messages_count  | integer       | default 0                                 |

### Relaciones
```
auth.users 1───1 businesses 1───N bots 1───N knowledge_sources
                                    │
                                    └──N conversations 1───N messages
businesses 1───N usage_metrics
```

## 4. Flujo de autenticación

1. El dueño del negocio se registra/inicia sesión en el dashboard usando
   **Supabase Auth** (email/password o magic link).
2. Al crear la cuenta por primera vez, un trigger de Postgres (o lógica en el
   onboarding) crea automáticamente una fila en `businesses` con `owner_id`
   apuntando al usuario recién creado.
3. Todas las tablas de negocio (`bots`, `knowledge_sources`, `conversations`,
   `messages`, `usage_metrics`) están protegidas con RLS usando policies del
   estilo:
   ```sql
   using (business_id in (
     select id from businesses where owner_id = auth.uid()
   ))
   ```
4. El widget y la landing (usuarios anónimos/visitantes finales) **no
   autentican con Supabase Auth**: usan un `visitor_id` generado en cliente
   (uuid guardado en localStorage) y acceden solo a través de Edge Functions
   públicas con su propia validación (rate limiting por `bot_id`/IP), nunca
   directo a las tablas con la anon key.

## 5. Flujo del widget

1. El cliente del negocio pega un `<script>` en su sitio con un `data-bot-id`.
2. El script vanilla JS (`/src/widget`) inyecta el botón flotante y el iframe
   o contenedor del chat, usando `primary_color` y `avatar_url` del bot
   (obtenidos con una llamada pública de solo lectura a `bots`).
3. Al enviar un mensaje, el widget llama a una Edge Function
   `POST /functions/v1/chat`:
   - recibe `bot_id`, `visitor_id`, `message`, `conversation_id` (opcional).
   - si no existe `conversation_id`, crea una fila en `conversations`.
   - guarda el mensaje del usuario en `messages`.
   - arma el prompt: `system_prompt` del bot + `knowledge_sources` relevantes
     + historial reciente de la conversación.
   - llama a la API de Groq (llama-3.1-8b-instant) con la API key (`GROQ_API_KEY`)
     guardada como secreto de servidor (nunca expuesta al cliente).
   - guarda la respuesta en `messages` y la devuelve al widget.
4. El widget renderiza la respuesta y actualiza `usage_metrics` (vía la misma
   Edge Function) para aplicar límites de plan.

## 6. Flujo de la landing page con demo

1. La landing muestra un bot de demostración preconfigurado (bot propio del
   producto, no de un cliente) para que el visitante pruebe la experiencia sin
   registrarse.
2. Funciona igual que el widget (mismo endpoint `chat`), pero con `source =
   'demo'` y un `bot_id` fijo del bot de demo del producto.
3. Opcionalmente, tras interactuar con la demo, se muestra un CTA de registro
   para convertir al visitante en usuario del dashboard.
4. No requiere autenticación ni persiste datos sensibles del visitante más
   allá del `visitor_id` anónimo.

## 7. Decisiones técnicas y por qué

- **Supabase en vez de backend propio**: reduce tiempo a mercado (Auth, DB y
  Storage integrados), RLS resuelve autorización sin escribir middleware
  propio, y Realtime cubre la necesidad de actualizar el dashboard en vivo.
- **Edge Functions como proxy a Groq**: la API key de Groq nunca
  puede vivir en el cliente (landing, dashboard ni widget). Además permite
  centralizar rate limiting y conteo de `usage_metrics` por plan.
- **Ant Design**: acelera la construcción de dashboard/formularios de
  configuración con componentes ya accesibles y consistentes, evitando
  invertir tiempo en un design system propio en una etapa temprana del SaaS.
- **Widget en vanilla JS (no React)**: el widget se embebe en sitios de
  terceros con stacks desconocidos; un bundle vanilla minimiza peso y evita
  conflictos de versiones de React con la página anfitriona.
- **TypeScript estricto, sin `any`**: dado que el dominio (negocios, bots,
  conversaciones) tiene relaciones bien definidas, tipar estrictamente evita
  errores de integración entre features y con el esquema de Supabase
  (tipos generables con `supabase gen types typescript`).
- **system_prompt derivado de configuración, no editado a mano libre por
  defecto**: mantiene consistencia y evita que un dueño de negocio rompa el
  comportamiento del bot con un prompt mal formado; se puede exponer edición
  avanzada más adelante.

## 8. Orden de desarrollo recomendado

1. **`00-arquitectura` (este documento)** — base de referencia para todo lo
   demás.
2. **`02-auth`** — Supabase Auth + creación automática de `businesses` al
   registrarse. Es prerequisito de todo lo que dependa de RLS.
3. **`04-bot-config`** — modelo de `bots` y `knowledge_sources`, y CRUD básico
   desde el dashboard. Sin esto no hay nada que conversar.
4. **`05-widget`** — Edge Function `chat` + integración con OPENIA +
   widget vanilla JS. Es el corazón funcional del producto.
5. **`01-landing`** — landing pública reutilizando el mismo endpoint `chat`
   para la demo en vivo.
6. **`06-dashboard`** — vista de conversaciones y métricas de uso (Realtime).
7. **`03-onboarding`** — flujo guiado de alta de negocio + primer bot,
   pensado al final porque orquesta features ya existentes (auth, bot-config).
8. **`07-seguridad`** — hardening transversal (rate limiting, revisión de RLS,
   límites de plan, validación de inputs) una vez el flujo completo funciona
   de punta a punta.
