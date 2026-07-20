import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationList } from '../../src/features/dashboard/ConversationList';
import type { ConversationRow } from '../../src/features/dashboard/types';
import type { Bot } from '../../src/features/bots/types';

const bot: Bot = {
  id: 'bot-1',
  business_id: 'biz-1',
  name: 'Mi bot',
  tone: 'amigable',
  system_prompt: '',
  avatar_url: null,
  primary_color: '#000',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
};

const conversation: ConversationRow = {
  id: 'conv-1',
  bot_id: 'bot-1',
  source: 'widget',
  visitor_id: 'visitor-1',
  started_at: '2026-01-01T00:00:00Z',
  ended_at: null,
};

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

describe('ConversationList', () => {
  it('shows an empty state with a "Obtener snippet" button when there are no conversations', () => {
    const onGetSnippet = vi.fn();
    render(
      <ConversationList
        conversations={[]}
        bots={[bot]}
        loading={false}
        botFilter={null}
        sourceFilter={null}
        onBotFilterChange={noop}
        onSourceFilterChange={noop}
        onSelect={noop}
        onGetSnippet={onGetSnippet}
      />,
    );

    expect(screen.getByText(/Aún no hay conversaciones/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Obtener snippet' }));
    expect(onGetSnippet).toHaveBeenCalledTimes(1);
  });

  it('shows the table when there are conversations', () => {
    render(
      <ConversationList
        conversations={[conversation]}
        bots={[bot]}
        loading={false}
        botFilter={null}
        sourceFilter={null}
        onBotFilterChange={noop}
        onSourceFilterChange={noop}
        onSelect={noop}
        onGetSnippet={noop}
      />,
    );

    expect(screen.queryByText(/Aún no hay conversaciones/)).toBeNull();
    expect(screen.getByText('visitor-1')).toBeTruthy();
  });
});
