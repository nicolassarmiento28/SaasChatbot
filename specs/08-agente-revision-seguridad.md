# 08 - Agente de Revisión de Seguridad (Tooling de Desarrollo)

## 1. Objetivo
Incorporar un subagente de Claude Code (`security-reviewer`) que automatice,
durante el desarrollo, parte de la auditoría de seguridad descrita en la
fase 07: dependencias vulnerables, secretos expuestos, patrones de código
inseguro, y los chequeos específicos de este proyecto (RLS, secretos de Edge
Functions, rate limiting, validación de input). No reemplaza la fase 07 —
la complementa, permitiendo detectar estos problemas de forma continua
mientras se escribe código, en vez de solo al final.

## 2. Flujo del usuario paso a paso
No es una feature con flujo de UI propio; es tooling de desarrollo invocado
desde Claude Code. El "flujo" es de uso por parte del equipo:
1. El desarrollador termina de escribir o modificar código (ej. una Edge
   Function nueva, un cambio en policies RLS, un formulario del dashboard).
2. Invoca al subagente desde su sesión de Claude Code: "usa el
   security-reviewer para revisar mis últimos cambios" — o el subagente se
   activa solo si Claude Code detecta que aplica (antes de un PR, después de
   escribir código sensible).
3. El subagente identifica el alcance (cambios recientes vía `git diff`, o
   el proyecto completo si se le pide explícitamente).
4. Revisa dependencias, secretos, patrones de código inseguro, y los
   chequeos específicos del proyecto (RLS, secretos de Edge Functions, rate
   limiting, validación de input).
5. Devuelve un reporte priorizado por severidad, con archivo/línea y
   sugerencia de corrección, sin modificar código directamente.
6. El desarrollador corrige lo señalado antes de abrir el PR o hacer merge.

## 3. Componentes a crear
- `.claude/agents/security-reviewer.md` — definición del subagente (frontmatter
  con `name`, `description`, `tools: Read, Grep, Glob, Bash`, `model: sonnet`,
  y system prompt con el checklist de auditoría).
- Sin cambios en `supabase/functions/` ni en el dashboard: este subagente
  audita el código existente, no agrega lógica de runtime.

## 4. Modelo de datos involucrado
Ninguno. Este componente no lee ni escribe datos de la aplicación (no toca
`businesses`, `bots`, `usage_metrics`, etc.) — opera solo sobre el código
fuente del repositorio vía herramientas de lectura (Read, Grep, Glob) y
comandos de auditoría (Bash: `npm audit`, `git diff`, etc.).

## 5. Criterios de aceptación
- El subagente existe en `.claude/agents/security-reviewer.md` y es
  invocable por nombre desde cualquier sesión de Claude Code en el proyecto.
- Al ejecutarlo sobre un cambio con una policy RLS mal configurada (ej. sin
  filtro por `owner_id`), lo señala como hallazgo de severidad alta o
  crítica.
- Al ejecutarlo sobre una Edge Function con una API key hardcodeada, lo
  señala como hallazgo crítico.
- Al ejecutarlo sobre código sin findings relevantes, reporta explícitamente
  que cada categoría fue revisada y no encontró problemas, en vez de omitir
  la sección.
- El subagente no tiene acceso de escritura (`tools` no incluye `Write` ni
  `Edit`): solo reporta, no corrige por sí mismo.

## 6. Consideraciones de seguridad
- Este subagente es una capa adicional, no un reemplazo de la revisión
  manual ni de la checklist de la fase 07 — sigue siendo responsabilidad del
  equipo confirmar el hardening antes de salir a producción.
- Al no tener acceso de escritura, no hay riesgo de que modifique código de
  forma no revisada; todo hallazgo pasa por revisión humana antes de
  aplicarse.
- Si se ejecuta con `Bash` sobre el proyecto, puede correr herramientas como
  `npm audit`; no debe usarse para ejecutar comandos que modifiquen el
  estado del repo o de la base de datos.
- Al ser un archivo de texto (`.md`) versionado en el repo, cualquier cambio
  a sus instrucciones queda en el historial de git y es revisable como
  cualquier otro cambio de código.
