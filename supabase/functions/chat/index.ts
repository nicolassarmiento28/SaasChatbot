import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { flagsPromptInjection, sanitizeMessage } from '../_shared/validation.ts';
import { buildPrompt } from './promptBuilder.ts';
import { isRateLimited } from './rateLimit.ts';
import { detectLanguageName } from './languageDetect.ts';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
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

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { bot_id, visitor_id, message, conversation_id } = await req.json();

  if (!bot_id || !visitor_id || typeof message !== 'string' || !message.trim()) {
    return jsonResponse({ error: 'invalid_request' }, 400);
  }

  const { data: bot, error: botError } = await supabase
    .from('bots')
    .select('id, business_id, system_prompt, is_active, cta_buttons')
    .eq('id', bot_id)
    .single();

  if (botError || !bot || !bot.is_active) {
    return jsonResponse({ error: 'bot_unavailable' }, 404);
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  const { data: recentEvents } = await supabase
    .from('rate_limit_events')
    .select('visitor_id, ip, bot_id, created_at')
    .eq('bot_id', bot_id)
    .gte('created_at', new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString());

  if (
    isRateLimited(recentEvents ?? [], {
      visitorId: visitor_id,
      ip,
      botId: bot_id,
      windowMs: RATE_LIMIT_WINDOW_MS,
      maxRequests: RATE_LIMIT_MAX_REQUESTS,
    })
  ) {
    return jsonResponse({ error: 'rate_limited' }, 429);
  }

  const period = new Date();
  period.setDate(1);
  const periodStr = period.toISOString().slice(0, 10);

  const { data: usage } = await supabase
    .from('usage_metrics')
    .select('messages_count')
    .eq('business_id', bot.business_id)
    .eq('period', periodStr)
    .maybeSingle();

  const PLAN_MESSAGE_LIMIT = 500;
  if ((usage?.messages_count ?? 0) >= PLAN_MESSAGE_LIMIT) {
    return jsonResponse({ error: 'plan_limit_reached' }, 402);
  }

  await supabase.from('rate_limit_events').insert({ bot_id, visitor_id, ip });

  let conversationId: string | undefined;
  if (conversation_id) {
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversation_id)
      .eq('bot_id', bot_id)
      .maybeSingle();
    conversationId = existingConversation?.id;
  }

  if (!conversationId) {
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({ bot_id, visitor_id, source: 'widget' })
      .select('id')
      .single();
    if (convError || !conversation) {
      return jsonResponse({ error: 'server_error' }, 500);
    }
    conversationId = conversation.id;
  }

  const sanitizedMessage = sanitizeMessage(message);

  if (flagsPromptInjection(sanitizedMessage)) {
    console.warn('possible_prompt_injection', { bot_id, visitor_id });
  }

  await supabase.from('messages').insert({
    conversation_id: conversationId,
    role: 'user',
    content: sanitizedMessage,
  });

  const { data: knowledgeSources } = await supabase
    .from('knowledge_sources')
    .select('title, content')
    .eq('bot_id', bot_id);

  const { data: history } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  const detectedLanguage = detectLanguageName(sanitizedMessage);

  const prompt = buildPrompt(
    bot.system_prompt,
    knowledgeSources ?? [],
    (history ?? []).slice(0, -1) as { role: 'user' | 'assistant'; content: string }[],
    sanitizedMessage,
    bot.cta_buttons ?? [],
    detectedLanguage,
  );

  const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: prompt }),
  });

  if (!groqResponse.ok) {
    return jsonResponse({ error: 'server_error' }, 502);
  }

  const groqData = await groqResponse.json();
  const reply: string = groqData.choices?.[0]?.message?.content ?? '';

  await supabase.from('messages').insert({
    conversation_id: conversationId,
    role: 'assistant',
    content: reply,
  });

  await supabase.from('usage_metrics').upsert(
    {
      business_id: bot.business_id,
      period: periodStr,
      messages_count: (usage?.messages_count ?? 0) + 1,
    },
    { onConflict: 'business_id,period' },
  );

  return jsonResponse({ conversation_id: conversationId, reply, cta_buttons: bot.cta_buttons ?? [] });
});
