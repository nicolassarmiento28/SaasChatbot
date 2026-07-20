// Frases que indican que el bot no supo responder (specs/06-dashboard.md §5).
// Usado por BotHealthBadge (tasa de éxito) y por el modo sugerencia de mejora.
const LOW_CONFIDENCE_PHRASES = [
  'no tengo información',
  'no puedo responder',
  'no sé',
  'no tengo datos sobre',
  'consulta directamente',
  'no estoy seguro',
];

export function isLowConfidenceMessage(content: string): boolean {
  const lower = content.toLowerCase();
  return LOW_CONFIDENCE_PHRASES.some((phrase) => lower.includes(phrase));
}
