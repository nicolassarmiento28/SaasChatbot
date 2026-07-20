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

const otherConversation: ConversationRow = {
  id: 'conv-2',
  bot_id: 'bot-1',
  source: 'widget',
  visitor_id: 'visitor-2',
  started_at: '2026-01-05T00:00:00Z',
  ended_at: null,
};

function noop() {}

const baseProps = {
  bots: [bot],
  loading: false,
  botFilter: null,
  sourceFilter: null,
  searchQuery: '',
  matchingIds: null,
  dateRange: null,
  needsReviewFilter: false,
  needsReviewIds: new Set<string>(),
  onBotFilterChange: noop,
  onSourceFilterChange: noop,
  onSearchQueryChange: noop,
  onDateRangeChange: noop,
  onNeedsReviewFilterChange: noop,
  onSelect: noop,
  onGetSnippet: noop,
};

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
    render(<ConversationList {...baseProps} conversations={[]} onGetSnippet={onGetSnippet} />);

    expect(screen.getByText(/Aún no hay conversaciones/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Obtener snippet' }));
    expect(onGetSnippet).toHaveBeenCalledTimes(1);
  });

  it('shows the table when there are conversations', () => {
    render(<ConversationList {...baseProps} conversations={[conversation]} />);

    expect(screen.queryByText(/Aún no hay conversaciones/)).toBeNull();
    expect(screen.getByText('visitor-1')).toBeTruthy();
  });

  it('filters out conversations not matching the search results', () => {
    render(
      <ConversationList
        {...baseProps}
        conversations={[conversation, otherConversation]}
        matchingIds={new Set(['conv-2'])}
      />,
    );

    expect(screen.queryByText('visitor-1')).toBeNull();
    expect(screen.getByText('visitor-2')).toBeTruthy();
  });

  it('"Necesita revisión" filters to conversations with low-confidence messages', () => {
    render(
      <ConversationList
        {...baseProps}
        conversations={[conversation, otherConversation]}
        needsReviewFilter
        needsReviewIds={new Set(['conv-2'])}
      />,
    );

    expect(screen.queryByText('visitor-1')).toBeNull();
    expect(screen.getByText('visitor-2')).toBeTruthy();
  });

  it('shows a positive empty state when "Necesita revisión" has no matches', () => {
    render(
      <ConversationList
        {...baseProps}
        conversations={[conversation, otherConversation]}
        needsReviewFilter
        needsReviewIds={new Set()}
      />,
    );

    expect(screen.getByText(/Tu bot está respondiendo bien/)).toBeTruthy();
  });
});
