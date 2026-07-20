import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Test de integracion: confirma que el mecanismo de lock de la Edge Function
// `insights` (migracion 0012, columna `generating` + unique(business_id,
// week_start)) deja que solo un request concurrente reserve la generacion
// para el mismo business_id/week_start. index.ts hace exactamente este
// insert como primer paso antes de llamar a Groq, asi que probar el insert
// concurrente contra la tabla real ejercita el mismo mecanismo que evita la
// doble llamada a Groq, sin depender de la latencia real de Groq. Requiere
// un proyecto Supabase real con la migracion 0012 aplicada, por eso no
// corre por defecto.
//
// Correr con:
//   RUN_RLS_INTEGRATION_TESTS=true VITE_SUPABASE_URL=... \
//   SUPABASE_SERVICE_ROLE_KEY=... npm test -- insightsGenerationLock

const enabled = process.env.RUN_RLS_INTEGRATION_TESTS === 'true';
const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const shouldRun = enabled && url && serviceRoleKey;

describe.skipIf(!shouldRun)('insights generation lock', () => {
  const admin = shouldRun ? createClient(url!, serviceRoleKey!) : null!;
  const email = `insights-lock-test-${crypto.randomUUID()}@saaschatbotia.test`;
  let userId: string;
  let businessId: string;

  beforeAll(async () => {
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password: crypto.randomUUID(),
      email_confirm: true,
    });
    if (error || !created.user) throw error ?? new Error('no se pudo crear el usuario de prueba');
    userId = created.user.id;

    const { data: business, error: businessError } = await admin
      .from('businesses')
      .insert({ owner_id: userId, name: 'Negocio de prueba' })
      .select('id')
      .single();
    if (businessError || !business) throw businessError ?? new Error('no se pudo crear el negocio');
    businessId = business.id;
  });

  afterAll(async () => {
    if (businessId) {
      await admin.from('insights').delete().eq('business_id', businessId);
      await admin.from('businesses').delete().eq('id', businessId);
    }
    if (userId) await admin.auth.admin.deleteUser(userId);
  });

  it('solo un insert de placeholder gana el lock para el mismo business_id/week_start', async () => {
    const weekStart = '2026-01-05';

    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        admin.from('insights').insert({ business_id: businessId, week_start: weekStart, content: '', generating: true }),
      ),
    );

    const wonLock = results.filter((r) => r.error === null).length;
    expect(wonLock).toBe(1);

    const { count } = await admin
      .from('insights')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('week_start', weekStart);
    expect(count).toBe(1);
  });
});
