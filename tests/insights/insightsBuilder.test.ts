import { describe, expect, it } from 'vitest';
import { buildInsightsPrompt, hasEnoughData, mondayOf } from '../../supabase/functions/insights/insightsBuilder';

describe('mondayOf', () => {
  it('returns the same date when given a Monday', () => {
    expect(mondayOf(new Date('2026-07-20T10:00:00Z'))).toBe('2026-07-20');
  });

  it('returns the previous Monday when given a mid-week date', () => {
    expect(mondayOf(new Date('2026-07-22T10:00:00Z'))).toBe('2026-07-20');
  });

  it('returns the previous Monday when given a Sunday', () => {
    expect(mondayOf(new Date('2026-07-26T10:00:00Z'))).toBe('2026-07-20');
  });
});

describe('hasEnoughData', () => {
  it('is false with fewer than 5 user messages', () => {
    expect(hasEnoughData(4)).toBe(false);
  });

  it('is true with 5 or more user messages', () => {
    expect(hasEnoughData(5)).toBe(true);
  });
});

describe('buildInsightsPrompt', () => {
  it('includes the week transcript and asks for the expected structure', () => {
    const result = buildInsightsPrompt([
      { role: 'user', content: '¿Cuál es el horario?' },
      { role: 'assistant', content: 'Abrimos 9am-6pm' },
    ]);

    expect(result[0].role).toBe('system');
    expect(result[0].content).toContain('Top preguntas frecuentes');
    expect(result[0].content).toContain('Sugerencias');
    expect(result[1]).toEqual({
      role: 'user',
      content: 'user: ¿Cuál es el horario?\nassistant: Abrimos 9am-6pm',
    });
  });
});
