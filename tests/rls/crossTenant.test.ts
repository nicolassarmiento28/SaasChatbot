import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Test de integracion (07-seguridad.md, criterio de aceptacion #5): confirma
// que la sesion del negocio A no puede leer ni escribir datos del negocio B.
// Requiere un proyecto Supabase real (local o remoto) y crea/borra 2 usuarios
// reales via Admin API. Por eso NO corre por defecto: requiere
// RUN_RLS_INTEGRATION_TESTS=true explicito + la service_role key (solo para
// crear los usuarios de prueba sin pasar por el rate limit de envio de
// emails de signUp normal).
//
// Correr con:
//   RUN_RLS_INTEGRATION_TESTS=true VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... \
//   SUPABASE_SERVICE_ROLE_KEY=... npm test -- crossTenant

const enabled = process.env.RUN_RLS_INTEGRATION_TESTS === 'true';
const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// jsdom expone un unico localStorage global compartido por todos los clientes
// del archivo; sin una storage propia por cliente, el signIn de B pisaria la
// sesion de A bajo la misma key. Cada cliente de prueba necesita su propio
// almacen en memoria, aislado del otro.
function memoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  };
}

const shouldRun = enabled && url && anonKey && serviceRoleKey;

describe.skipIf(!shouldRun)('RLS cross-tenant isolation', () => {
  const admin = shouldRun ? createClient(url!, serviceRoleKey!) : null!;
  const password = crypto.randomUUID();
  const emailA = `rls-test-a-${crypto.randomUUID()}@saaschatbotia.test`;
  const emailB = `rls-test-b-${crypto.randomUUID()}@saaschatbotia.test`;
  let userIdA: string;
  let userIdB: string;

  beforeAll(async () => {
    const { data: createdA, error: errA } = await admin.auth.admin.createUser({
      email: emailA,
      password,
      email_confirm: true,
    });
    const { data: createdB, error: errB } = await admin.auth.admin.createUser({
      email: emailB,
      password,
      email_confirm: true,
    });
    if (errA || !createdA.user) throw errA ?? new Error('no se pudo crear el usuario A');
    if (errB || !createdB.user) throw errB ?? new Error('no se pudo crear el usuario B');
    userIdA = createdA.user.id;
    userIdB = createdB.user.id;
  });

  afterAll(async () => {
    if (userIdA) await admin.auth.admin.deleteUser(userIdA);
    if (userIdB) await admin.auth.admin.deleteUser(userIdB);
  });

  it('el negocio A no puede ver ni modificar datos del negocio B', async () => {
    const clientA = createClient(url!, anonKey!, { auth: { storage: memoryStorage() } });
    const clientB = createClient(url!, anonKey!, { auth: { storage: memoryStorage() } });

    const { error: signInErrA } = await clientA.auth.signInWithPassword({ email: emailA, password });
    const { error: signInErrB } = await clientB.auth.signInWithPassword({ email: emailB, password });
    expect(signInErrA).toBeNull();
    expect(signInErrB).toBeNull();

    const { data: businessA } = await clientA.from('businesses').select('id').single();
    const { data: businessB } = await clientB.from('businesses').select('id').single();
    expect(businessA?.id).toBeTruthy();
    expect(businessB?.id).toBeTruthy();

    // A no puede leer el negocio de B.
    const { data: crossRead } = await clientA.from('businesses').select('id').eq('id', businessB!.id);
    expect(crossRead ?? []).toHaveLength(0);

    // A no puede crear un bot bajo el business_id de B.
    const { error: crossInsertError } = await clientA.from('bots').insert({
      business_id: businessB!.id,
      name: 'intruso',
      system_prompt: 'hola',
    });
    expect(crossInsertError).not.toBeNull();

    // A no puede actualizar el negocio de B (ej. cambiar de plan).
    const { data: crossUpdate } = await clientA
      .from('businesses')
      .update({ name: 'hackeado' })
      .eq('id', businessB!.id)
      .select();
    expect(crossUpdate ?? []).toHaveLength(0);
  });
});
