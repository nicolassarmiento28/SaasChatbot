import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Test de integracion: confirma que el constraint `cta_buttons_url_scheme`
// (migracion 0009) rechaza a nivel de base de datos URLs con esquemas
// peligrosos, incluso si se escriben directo via API saltandose la
// sanitizacion de cliente (src/features/bots/ctaButtons.ts). Requiere un
// proyecto Supabase real con la migracion 0009 aplicada, por eso no corre
// por defecto.
//
// Correr con:
//   RUN_RLS_INTEGRATION_TESTS=true VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... \
//   SUPABASE_SERVICE_ROLE_KEY=... npm test -- ctaButtonsConstraint

const enabled = process.env.RUN_RLS_INTEGRATION_TESTS === 'true';
const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const shouldRun = enabled && url && serviceRoleKey;

describe.skipIf(!shouldRun)('cta_buttons_url_scheme DB constraint', () => {
  const admin = shouldRun ? createClient(url!, serviceRoleKey!) : null!;
  const email = `cta-constraint-test-${crypto.randomUUID()}@saaschatbotia.test`;
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
    if (botId) await admin.from('bots').delete().eq('id', botId);
    if (businessId) await admin.from('businesses').delete().eq('id', businessId);
    if (userId) await admin.auth.admin.deleteUser(userId);
  });

  it('rechaza cta_buttons con esquema javascript:', async () => {
    const { error } = await admin
      .from('bots')
      .update({ cta_buttons: [{ label: 'Click', url: 'javascript:alert(1)' }] })
      .eq('id', botId);
    expect(error).not.toBeNull();
  });

  it('rechaza cta_buttons con esquema data:', async () => {
    const { error } = await admin
      .from('bots')
      .update({ cta_buttons: [{ label: 'Click', url: 'data:text/html,<script>alert(1)</script>' }] })
      .eq('id', botId);
    expect(error).not.toBeNull();
  });

  it('rechaza cta_buttons con esquema vbscript:', async () => {
    const { error } = await admin
      .from('bots')
      .update({ cta_buttons: [{ label: 'Click', url: 'vbscript:msgbox(1)' }] })
      .eq('id', botId);
    expect(error).not.toBeNull();
  });

  it('permite cta_buttons con URL https', async () => {
    const { error } = await admin
      .from('bots')
      .update({ cta_buttons: [{ label: 'Ver menú', url: 'https://example.com/menu' }] })
      .eq('id', botId);
    expect(error).toBeNull();
  });
});
