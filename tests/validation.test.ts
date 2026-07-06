import { describe, expect, it } from 'vitest';
import { MAX_MESSAGE_LENGTH, sanitizeMessage } from '../supabase/functions/_shared/validation';

describe('sanitizeMessage', () => {
  it('trims whitespace', () => {
    expect(sanitizeMessage('  hola  ')).toBe('hola');
  });

  it('removes control characters', () => {
    expect(sanitizeMessage('hola\x00mundo\x1F')).toBe('holamundo');
  });

  it('truncates to the max length', () => {
    const long = 'a'.repeat(MAX_MESSAGE_LENGTH + 100);
    expect(sanitizeMessage(long)).toHaveLength(MAX_MESSAGE_LENGTH);
  });
});
