import { describe, it, expect } from 'vitest';
import { sanitizeCtaButtons } from '../../src/features/bots/ctaButtons';

describe('sanitizeCtaButtons', () => {
  it('keeps valid label/url pairs', () => {
    const result = sanitizeCtaButtons([{ label: 'Ver menú', url: 'https://example.com/menu' }]);
    expect(result).toEqual([{ label: 'Ver menú', url: 'https://example.com/menu' }]);
  });

  it('drops buttons with unsafe URL schemes (e.g. javascript:)', () => {
    const result = sanitizeCtaButtons([{ label: 'Click me', url: 'javascript:alert(1)' }]);
    expect(result).toEqual([]);
  });

  it('drops buttons with an empty label', () => {
    const result = sanitizeCtaButtons([{ label: '   ', url: 'https://example.com' }]);
    expect(result).toEqual([]);
  });

  it('drops buttons with an invalid URL', () => {
    const result = sanitizeCtaButtons([{ label: 'Ir', url: 'not-a-url' }]);
    expect(result).toEqual([]);
  });

  it('trims and caps label length', () => {
    const longLabel = 'a'.repeat(100);
    const result = sanitizeCtaButtons([{ label: `  ${longLabel}  `, url: 'https://example.com' }]);
    expect(result[0].label).toHaveLength(40);
  });

  it('caps the list at 3 buttons', () => {
    const buttons = Array.from({ length: 5 }, (_, i) => ({ label: `Btn ${i}`, url: 'https://example.com' }));
    const result = sanitizeCtaButtons(buttons);
    expect(result).toHaveLength(3);
  });
});
