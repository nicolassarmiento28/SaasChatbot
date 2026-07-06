# 02 - Autenticación

## 1. Objetivo
Permitir que un dueño de negocio se registre e inicie sesión usando Supabase
Auth, y garantizar que cada usuario tenga automáticamente una fila en
`businesses` asociada, base de toda la autorización (RLS) del resto del
producto.

## 2. Flujo del usuario paso a paso
1. El usuario visita `/registro` y completa email + contraseña (o solicita un
   magic link).
2. Supabase Auth crea el usuario en `auth.users`.
3. Un trigger de Postgres (`on_auth_user_created`) inserta automáticamente
   una fila en `businesses` con `owner_id = auth.users.id`, `name` por
   defecto (ej. "Mi negocio") y `plan = 'free'`.
4. El usuario es redirigido a `/onboarding` (feature `03-onboarding`) si es su
   primer login, o a `/dashboard` si ya completó el onboarding.
5. En logins posteriores, `/login` valida credenciales contra Supabase Auth y
   redirige a `/dashboard`.
6. El usuario puede cerrar sesión desde cualquier vista del dashboard.
7. Recuperación de contraseña: `/recuperar-password` envía email vía
   Supabase Auth con link de reset.

## 3. Componentes a crear
- `LoginForm`, `SignupForm`, `ForgotPasswordForm` (Ant Design `Form`).
- `AuthLayout` (layout compartido para páginas de auth).
- `useSession` hook (contexto de sesión, envuelve `supabase.auth.onAuthStateChange`).
- `ProtectedRoute` (redirige a `/login` si no hay sesión activa).
- `AuthCallback` (maneja el redirect de magic link / confirmación de email).

## 4. Modelo de datos involucrado
- `auth.users` (gestionada por Supabase, no se modifica el esquema).
- `businesses` (ver `00-arquitectura`), poblada por el trigger
  `on_auth_user_created`:
  ```sql
  create function public.handle_new_user()
  returns trigger as $$
  begin
    insert into public.businesses (owner_id, name, plan)
    values (new.id, 'Mi negocio', 'free');
    return new;
  end;
  $$ language plpgsql security definer;

  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
  ```

## 5. Criterios de aceptación
- Registrar un usuario nuevo crea exactamente una fila en `businesses` con el
  `owner_id` correcto (verificable con un test que inserta un usuario de
  prueba y consulta `businesses`).
- Un usuario no puede iniciar sesión con credenciales inválidas (mensaje de
  error claro, sin filtrar si el email existe o no).
- La sesión persiste tras refrescar la página (Supabase maneja el refresh
  token en `localStorage`).
- Rutas del dashboard son inaccesibles sin sesión activa (`ProtectedRoute`
  redirige a `/login`).
- El flujo de magic link y de recuperación de contraseña completan y
  redirigen correctamente.

## 6. Consideraciones de seguridad
- Nunca usar la `service_role key` en el cliente; solo la `anon key`.
- El trigger `handle_new_user` corre con `security definer` para poder
  insertar en `businesses` aunque el usuario recién creado aún no tenga
  policies de escritura propias; se limita estrictamente a esa inserción.
- Contraseñas gestionadas enteramente por Supabase Auth (nunca se
  almacenan ni procesan manualmente en el código de la app).
- Rate limiting de intentos de login (configuración nativa de Supabase Auth)
  para mitigar fuerza bruta.
- Validar y sanear inputs de formularios (email format, longitud mínima de
  password) tanto en cliente como confiando en las validaciones server-side
  de Supabase Auth como fuente de verdad.

## UI de autenticación
- Layout split: mitad izquierda visual, mitad derecha formulario
- Lado izquierdo light mode: fondo #2C2C2A con logo, tagline y mockup del chatbot
- Lado izquierdo dark mode: gradiente linear-gradient(135deg, #2C2C2A, #04342C) con logo, tagline y mockup
- Lado derecho light mode: fondo #F2FAF7 con formulario limpio
- Lado derecho dark mode: fondo #0e0e0d con card semitransparente
- Sin botón de Google OAuth por ahora
- Inputs con borde #9FE1CB en light, #444441 en dark
- Botón primario: #2C2C2A con texto #5DCAA5 en light, #1D9E75 con texto #fff en dark
- Link de cambio entre login y registro al pie del formulario
- Responsive: en mobile el lado izquierda se oculta y solo se muestra el formulario

### Botón de regreso a landing
- Ubicado en la esquina superior izquierda del formulario
- Texto: "← Volver"
- Light mode: color #0F6E56, fondo transparente
- Dark mode: color #9FE1CB, fondo transparente
- Al hacer hover: color #1D9E75 con transición suave de 200ms
- Al hacer click navega a / (landing page)
- Font size 12px, sin borde, sin fondo
