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

const MAX_HISTORY_MESSAGES = 10;

export function buildPrompt(
  systemPrompt: string,
  knowledgeSources: KnowledgeSource[],
  history: HistoryMessage[],
  userMessage: string,
): GroqMessage[] {
  const knowledgeBlock = knowledgeSources.length
    ? '\n\nBase de conocimiento:\n' +
      knowledgeSources.map((k) => `- ${k.title}: ${k.content}`).join('\n')
    : '';

  const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);

  return [
    { role: 'system', content: systemPrompt + knowledgeBlock },
    ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];
}
