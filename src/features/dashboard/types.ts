export interface ConversationRow {
  id: string;
  bot_id: string;
  source: 'widget' | 'demo';
  visitor_id: string;
  started_at: string;
  ended_at: string | null;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface UsageMetricRow {
  id: string;
  business_id: string;
  period: string;
  messages_count: number;
}
