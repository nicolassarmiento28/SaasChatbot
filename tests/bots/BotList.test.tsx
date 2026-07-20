import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BotList } from '../../src/features/bots/BotList';
import type { Bot } from '../../src/features/bots/types';

function makeBot(id: string, name: string): Bot {
  return {
    id,
    business_id: 'biz-1',
    name,
    tone: 'amigable',
    system_prompt: '',
    avatar_url: null,
    primary_color: '#000',
    is_active: true,
    cta_buttons: [],
    created_at: '2026-01-01T00:00:00Z',
  };
}

function noop() {}

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BotList', () => {
  it('shows a warning card for a bot with no knowledge sources', () => {
    render(
      <BotList
        bots={[makeBot('bot-1', 'Sin conocimiento')]}
        loading={false}
        knowledgeCounts={{}}
        onEdit={noop}
        onDelete={noop}
        onToggleActive={noop}
        onManageKnowledge={noop}
        onShowWidget={noop}
      />,
    );

    expect(screen.getByText(/Tu bot "Sin conocimiento" responderá mejor/)).toBeTruthy();
  });

  it('does not show a warning card for a bot that already has knowledge sources', () => {
    render(
      <BotList
        bots={[makeBot('bot-1', 'Con conocimiento')]}
        loading={false}
        knowledgeCounts={{ 'bot-1': 3 }}
        onEdit={noop}
        onDelete={noop}
        onToggleActive={noop}
        onManageKnowledge={noop}
        onShowWidget={noop}
      />,
    );

    expect(screen.queryByText(/responderá mejor/)).toBeNull();
  });
});
