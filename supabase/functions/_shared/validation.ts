export const MAX_MESSAGE_LENGTH = 4000;

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export function sanitizeMessage(raw: string): string {
  return raw.replace(CONTROL_CHARS, '').trim().slice(0, MAX_MESSAGE_LENGTH);
}

// Frases típicas de intentos de manipular el system prompt. No se usa para
// bloquear el mensaje (un usuario legítimo puede escribirlas sin intención
// maliciosa) sino para marcarlo y loguearlo para monitoreo.
const PROMPT_INJECTION_PATTERNS = [
  /ignora(?:r)?\s+(tus|las|todas)\s+instrucciones/i,
  /system\s*prompt/i,
  /revela\s+tu\s+(prompt|configuraci[oó]n)/i,
  /eres\s+ahora\s+un\s+asistente\s+sin\s+restricciones/i,
  /olvida\s+(tus|las)\s+instrucciones/i,
];

export function flagsPromptInjection(raw: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(raw));
}
