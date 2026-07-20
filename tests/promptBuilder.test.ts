import { describe, expect, it } from 'vitest';
import { buildPrompt } from '../supabase/functions/chat/promptBuilder';

describe('buildPrompt', () => {
  it('includes system prompt, knowledge sources, history, and the new message', () => {
    const result = buildPrompt(
      'Eres un asistente amable.',
      [{ title: 'Horario', content: 'Abrimos 9am-6pm' }],
      [{ role: 'user', content: 'Hola' }, { role: 'assistant', content: '¡Hola!' }],
      '¿Cuál es el horario?',
    );

    expect(result[0].role).toBe('system');
    expect(result[0].content).toContain('Eres un asistente amable.');
    expect(result[0].content).toContain('Horario: Abrimos 9am-6pm');
    expect(result[1]).toEqual({ role: 'user', content: 'Hola' });
    expect(result[2]).toEqual({ role: 'assistant', content: '¡Hola!' });
    expect(result[3]).toEqual({ role: 'user', content: '¿Cuál es el horario?' });
  });

  it('truncates history to the last 10 messages', () => {
    const history: { role: 'user' | 'assistant'; content: string }[] = Array.from(
      { length: 15 },
      (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `msg-${i}`,
      }),
    );

    const result = buildPrompt('system', [], history, 'nuevo mensaje');

    const historyInPrompt = result.slice(1, -1);
    expect(historyInPrompt).toHaveLength(10);
    expect(historyInPrompt[0].content).toBe('msg-5');
  });

  it('omits the knowledge block when there are no knowledge sources', () => {
    const result = buildPrompt('system', [], [], 'hola');
    expect(result[0].content).toBe('system');
  });

  it('mentions available CTA buttons in the system prompt', () => {
    const result = buildPrompt('system', [], [], 'hola', [{ label: 'Ver menú', url: 'https://example.com' }]);
    expect(result[0].content).toContain('Ver menú');
  });

  it('omits the CTA block when there are no CTA buttons', () => {
    const result = buildPrompt('system', [], [], 'hola', []);
    expect(result[0].content).toBe('system');
  });
});
