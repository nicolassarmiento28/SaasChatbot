export const MAX_MESSAGE_LENGTH = 4000;

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export function sanitizeMessage(raw: string): string {
  return raw.replace(CONTROL_CHARS, '').trim().slice(0, MAX_MESSAGE_LENGTH);
}
