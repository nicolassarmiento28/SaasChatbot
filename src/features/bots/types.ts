import type { BotTone } from './systemPrompt';

export interface CtaButton {
  label: string;
  url: string;
}

export interface Bot {
  id: string;
  business_id: string;
  name: string;
  tone: BotTone;
  system_prompt: string;
  avatar_url: string | null;
  primary_color: string;
  is_active: boolean;
  cta_buttons: CtaButton[];
  created_at: string;
}

export type KnowledgeSourceType = 'faq' | 'document' | 'text';

export interface KnowledgeSource {
  id: string;
  bot_id: string;
  type: KnowledgeSourceType;
  title: string;
  content: string;
  file_url: string | null;
  created_at: string;
}
