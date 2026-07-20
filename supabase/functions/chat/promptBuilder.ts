export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface KnowledgeSource {
  title: string;
  content: string;
}

export interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CtaButton {
  label: string;
  url: string;
}

const MAX_HISTORY_MESSAGES = 10;

export function buildPrompt(
  systemPrompt: string,
  knowledgeSources: KnowledgeSource[],
  history: HistoryMessage[],
  userMessage: string,
  ctaButtons: CtaButton[] = [],
): GroqMessage[] {
  const knowledgeBlock = knowledgeSources.length
    ? '\n\nBase de conocimiento:\n' +
      knowledgeSources.map((k) => `- ${k.title}: ${k.content}`).join('\n')
    : '';

  const ctaBlock = ctaButtons.length
    ? '\n\nBotones de acción disponibles (se muestran automáticamente bajo tu respuesta, no los repitas como enlaces de texto):\n' +
      ctaButtons.map((c) => `- ${c.label}`).join('\n')
    : '';

  const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);

  return [
    { role: 'system', content: systemPrompt + knowledgeBlock + ctaBlock },
    ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];
}
