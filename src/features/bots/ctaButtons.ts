import type { CtaButton } from './types';

export const MAX_CTA_BUTTONS = 3;
const MAX_LABEL_LENGTH = 40;

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// Sanitiza y valida los botones CTA antes de guardarlos (specs/04-bot-config.md §10):
// recorta longitud/espacios, quita caracteres de control y descarta URLs con
// esquemas peligrosos (ej. javascript:) o vacías.
export function sanitizeCtaButtons(buttons: CtaButton[]): CtaButton[] {
  return buttons
    .map((btn) => ({
      label: btn.label.replace(CONTROL_CHARS, '').trim().slice(0, MAX_LABEL_LENGTH),
      url: btn.url.replace(CONTROL_CHARS, '').trim(),
    }))
    .filter((btn) => btn.label.length > 0 && isSafeUrl(btn.url))
    .slice(0, MAX_CTA_BUTTONS);
}
