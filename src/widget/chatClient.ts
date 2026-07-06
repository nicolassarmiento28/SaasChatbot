export interface BotConfig {
  id: string;
  name: string;
  primary_color: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

export interface ChatReply {
  conversation_id: string;
  reply: string;
}

export interface ChatClientOptions {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export async function fetchBotConfig(
  { supabaseUrl, supabaseAnonKey }: ChatClientOptions,
  botId: string,
): Promise<BotConfig | null> {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/bots_public?id=eq.${encodeURIComponent(botId)}&select=*`,
    { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` } },
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as BotConfig[];
  return rows[0] ?? null;
}

export async function sendMessage(
  { supabaseUrl, supabaseAnonKey }: ChatClientOptions,
  params: { botId: string; visitorId: string; message: string; conversationId?: string },
): Promise<ChatReply> {
  const res = await fetch(`${supabaseUrl}/functions/v1/chat`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bot_id: params.botId,
      visitor_id: params.visitorId,
      message: params.message,
      conversation_id: params.conversationId,
    }),
  });

  if (!res.ok) {
    throw new Error('chat_unavailable');
  }

  return (await res.json()) as ChatReply;
}
