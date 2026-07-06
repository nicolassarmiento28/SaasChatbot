export type BotTone = 'formal' | 'casual' | 'amigable';

const TONE_INSTRUCTIONS: Record<BotTone, string> = {
  formal: 'Responde de manera formal y profesional, cuidando la cortesía.',
  casual: 'Responde de manera relajada y cercana, como en una charla informal.',
  amigable: 'Responde de manera cálida, amigable y empática.',
};

export function buildSystemPrompt(botName: string, tone: BotTone): string {
  return `Eres ${botName}, el asistente virtual de atención al cliente de este negocio. ${TONE_INSTRUCTIONS[tone]} Usa únicamente la base de conocimiento provista para responder.`;
}
