import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Test de integracion: confirma que los buckets `avatars` y `knowledge-docs`
// rechazan a nivel de Storage (migracion 0010) archivos con Content-Type
// fuera de la whitelist, sin depender de validacion de cliente. Requiere un
// proyecto Supabase real con la migracion 0010 aplicada, por eso no corre
// por defecto.
//
// Correr con:
//   RUN_RLS_INTEGRATION_TESTS=true VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... \
//   SUPABASE_SERVICE_ROLE_KEY=... npm test -- storageMimeLimits

const enabled = process.env.RUN_RLS_INTEGRATION_TESTS === 'true';
const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const shouldRun = enabled && url && serviceRoleKey;

describe.skipIf(!shouldRun)('storage bucket MIME/size limits', () => {
  const admin = shouldRun ? createClient(url!, serviceRoleKey!) : null!;
  const email = `storage-mime-test-${crypto.randomUUID()}@saaschatbotia.test`;
  let userId: string;
  let businessId: string;
  const uploadedPaths: { bucket: string; path: string }[] = [];

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
    for (const { bucket, path } of uploadedPaths) {
      await admin.storage.from(bucket).remove([path]);
    }
    if (businessId) await admin.from('businesses').delete().eq('id', businessId);
    if (userId) await admin.auth.admin.deleteUser(userId);
  });

  it('rechaza un Content-Type fuera de whitelist en avatars', async () => {
    const path = `${businessId}/malicious.svg`;
    const { error } = await admin.storage
      .from('avatars')
      .upload(path, new Blob(['<svg onload="alert(1)"></svg>']), { contentType: 'image/svg+xml' });
    expect(error).not.toBeNull();
  });

  it('permite un Content-Type en whitelist en avatars', async () => {
    const path = `${businessId}/foto.png`;
    const { error } = await admin.storage
      .from('avatars')
      .upload(path, new Blob(['fake-png-bytes']), { contentType: 'image/png' });
    expect(error).toBeNull();
    if (!error) uploadedPaths.push({ bucket: 'avatars', path });
  });

  it('rechaza un Content-Type fuera de whitelist en knowledge-docs', async () => {
    const path = `${businessId}/script.html`;
    const { error } = await admin.storage
      .from('knowledge-docs')
      .upload(path, new Blob(['<script>alert(1)</script>']), { contentType: 'text/html' });
    expect(error).not.toBeNull();
  });

  it('permite un Content-Type en whitelist en knowledge-docs', async () => {
    const path = `${businessId}/manual.pdf`;
    const { error } = await admin.storage
      .from('knowledge-docs')
      .upload(path, new Blob(['%PDF-1.4 fake']), { contentType: 'application/pdf' });
    expect(error).toBeNull();
    if (!error) uploadedPaths.push({ bucket: 'knowledge-docs', path });
  });
});
