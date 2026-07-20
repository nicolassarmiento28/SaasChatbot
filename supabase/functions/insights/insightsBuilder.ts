export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const MIN_USER_MESSAGES = 5;

export function mondayOf(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function hasEnoughData(userMessageCount: number): boolean {
  return userMessageCount >= MIN_USER_MESSAGES;
}

export function buildInsightsPrompt(messages: { role: string; content: string }[]): GroqMessage[] {
  const transcript = messages.map((m) => `${m.role}: ${m.content}`).join('\n');

  return [
    {
      role: 'system',
      content:
        'Eres un analista que ayuda a dueños de pequeños negocios a mejorar el chatbot de atención ' +
        'al cliente de su sitio. A partir de la transcripción de conversaciones de la última semana, ' +
        'responde en español con exactamente esta estructura:\n' +
        '1. Top preguntas frecuentes (hasta 5, en una lista).\n' +
        '2. Temas sin respuesta clara (lista breve, o "Ninguno" si no aplica).\n' +
        '3. Sugerencias (1-2 sugerencias concretas para mejorar la base de conocimiento).',
    },
    { role: 'user', content: transcript },
  ];
}
