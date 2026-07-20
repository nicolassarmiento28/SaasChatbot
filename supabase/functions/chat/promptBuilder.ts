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

// specs/04-bot-config.md §6: sin configuración adicional del dueño del
// negocio, el bot responde en el idioma del visitante. Una instrucción
// directa ("responde en inglés") es mucho más confiable para un modelo
// chico como llama-3.1-8b-instant que pedirle que "detecte y adapte" por
// su cuenta — por eso el idioma se detecta antes (languageDetect.ts) y se
// pasa aquí ya resuelto cuando fue posible determinarlo con confianza.
function languageInstructionFor(detectedLanguage: string | null): string {
  return detectedLanguage
    ? `Responde siempre en ${detectedLanguage}, el idioma en que escribió el visitante.`
    : 'Detecta el idioma del visitante y responde siempre en ese mismo idioma.';
}

export function buildPrompt(
  systemPrompt: string,
  knowledgeSources: KnowledgeSource[],
  history: HistoryMessage[],
  userMessage: string,
  ctaButtons: CtaButton[] = [],
  detectedLanguage: string | null = null,
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
    { role: 'system', content: `${systemPrompt} ${languageInstructionFor(detectedLanguage)}${knowledgeBlock}${ctaBlock}` },
    ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];
}
