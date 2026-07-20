import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { buildInsightsPrompt, hasEnoughData, mondayOf } from './insightsBuilder.ts';

const NOT_ENOUGH_DATA_MESSAGE = 'Aún no hay suficientes conversaciones para generar insights esta semana.';

// insights devuelve datos privados del negocio y solo debe llamarse desde el
// dashboard propio (a diferencia de `chat`, que el widget embebe en
// dominios de terceros desconocidos).
const DASHBOARD_ORIGIN = Deno.env.get('DASHBOARD_ORIGIN') ?? 'https://saaschatbotia.vercel.app';

const corsHeaders = {
  'Access-Control-Allow-Origin': DASHBOARD_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  const authClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: userData, error: userError } = await authClient.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', userData.user.id)
    .single();

  if (!business) {
    return jsonResponse({ error: 'business_not_found' }, 404);
  }

  const weekStart = mondayOf(new Date());

  const { data: cached } = await supabase
    .from('insights')
    .select('content, generating')
    .eq('business_id', business.id)
    .eq('week_start', weekStart)
    .maybeSingle();

  if (cached && !cached.generating) {
    return jsonResponse({ content: cached.content });
  }

  if (cached && cached.generating) {
    // Otro request ya está generando este insight; no dispares una segunda
    // llamada a Groq para el mismo business_id/week_start.
    return jsonResponse({ status: 'generating' }, 202);
  }

  // Intenta reservar el lock insertando el placeholder. Si otro request
  // concurrente ya lo insertó, el unique(business_id, week_start) rechaza
  // este insert y sabemos que perdimos la carrera.
  const { error: lockError } = await supabase
    .from('insights')
    .insert({ business_id: business.id, week_start: weekStart, content: '', generating: true });

  if (lockError) {
    return jsonResponse({ status: 'generating' }, 202);
  }

  const { data: bots } = await supabase.from('bots').select('id').eq('business_id', business.id);
  const botIds = (bots ?? []).map((b: { id: string }) => b.id);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let messages: { role: string; content: string }[] = [];
  if (botIds.length > 0) {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .in('bot_id', botIds)
      .gte('started_at', sevenDaysAgo.toISOString());
    const conversationIds = (conversations ?? []).map((c: { id: string }) => c.id);

    if (conversationIds.length > 0) {
      const { data: messagesData } = await supabase
        .from('messages')
        .select('role, content')
        .in('conversation_id', conversationIds)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });
      messages = messagesData ?? [];
    }
  }

  const userMessageCount = messages.filter((m) => m.role === 'user').length;

  let content: string;
  if (!hasEnoughData(userMessageCount)) {
    content = NOT_ENOUGH_DATA_MESSAGE;
  } else {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: buildInsightsPrompt(messages) }),
    });

    if (!groqResponse.ok) {
      // Libera el lock para que un request posterior pueda reintentar en
      // vez de quedar bloqueado en `generating` para siempre.
      await supabase
        .from('insights')
        .delete()
        .eq('business_id', business.id)
        .eq('week_start', weekStart);
      return jsonResponse({ error: 'server_error' }, 502);
    }

    const groqData = await groqResponse.json();
    content = groqData.choices?.[0]?.message?.content ?? NOT_ENOUGH_DATA_MESSAGE;
  }

  await supabase.from('insights').upsert(
    { business_id: business.id, week_start: weekStart, content, generating: false },
    { onConflict: 'business_id,week_start' },
  );

  return jsonResponse({ content });
});
