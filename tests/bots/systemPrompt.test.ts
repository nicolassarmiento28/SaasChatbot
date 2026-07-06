import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from '../../src/features/bots/systemPrompt';

describe('buildSystemPrompt', () => {
  it('includes the bot name and a tone-specific instruction', () => {
    expect(buildSystemPrompt('Ana', 'formal')).toContain('Ana');
    expect(buildSystemPrompt('Ana', 'formal')).toContain('formal');
  });

  it('produces a different prompt per tone', () => {
    const casual = buildSystemPrompt('Bot', 'casual');
    const amigable = buildSystemPrompt('Bot', 'amigable');
    expect(casual).not.toEqual(amigable);
  });
});
