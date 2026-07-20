import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Test de integracion: confirma que la RPC `check_and_record_rate_limit`
// (migracion 0011) es atomica bajo concurrencia real. El patron anterior
// (select en la Edge Function, luego insert) dejaba pasar mas requests que
// RATE_LIMIT_MAX_REQUESTS cuando llegaban en paralelo, porque todos leian
// el mismo conteo antes de que cualquiera insertara su evento. Requiere un
// proyecto Supabase real con la migracion 0011 aplicada, por eso no corre
// por defecto.
//
// Correr con:
//   RUN_RLS_INTEGRATION_TESTS=true VITE_SUPABASE_URL=... \
//   SUPABASE_SERVICE_ROLE_KEY=... npm test -- rateLimitConcurrency

const enabled = process.env.RUN_RLS_INTEGRATION_TESTS === 'true';
const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const shouldRun = enabled && url && serviceRoleKey;

describe.skipIf(!shouldRun)('check_and_record_rate_limit RPC concurrency', () => {
  const admin = shouldRun ? createClient(url!, serviceRoleKey!) : null!;
  const email = `rate-limit-concurrency-${crypto.randomUUID()}@saaschatbotia.test`;
  let userId: string;
  let businessId: string;
  let botId: string;

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

    const { data: bot, error: botError } = await admin
      .from('bots')
      .insert({ business_id: businessId, name: 'Bot de prueba', system_prompt: 'hola' })
      .select('id')
      .single();
    if (botError || !bot) throw botError ?? new Error('no se pudo crear el bot');
    botId = bot.id;
  });

  afterAll(async () => {
    if (botId) {
      await admin.from('rate_limit_events').delete().eq('bot_id', botId);
      await admin.from('bots').delete().eq('id', botId);
    }
    if (businessId) await admin.from('businesses').delete().eq('id', businessId);
    if (userId) await admin.auth.admin.deleteUser(userId);
  });

  it('no deja pasar mas requests que el maximo bajo una rafaga concurrente', async () => {
    const visitorId = `visitor-${crypto.randomUUID()}`;
    const maxRequests = 5;
    const burstSize = 20;

    const results = await Promise.all(
      Array.from({ length: burstSize }, () =>
        admin.rpc('check_and_record_rate_limit', {
          p_bot_id: botId,
          p_visitor_id: visitorId,
          p_ip: '1.2.3.4',
          p_window_ms: 60_000,
          p_max_requests: maxRequests,
        }),
      ),
    );

    const allowed = results.filter((r) => r.data === false).length;
    expect(allowed).toBe(maxRequests);

    const { count } = await admin
      .from('rate_limit_events')
      .select('id', { count: 'exact', head: true })
      .eq('bot_id', botId)
      .eq('visitor_id', visitorId);
    expect(count).toBe(maxRequests);
  });
});
