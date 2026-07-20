import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useConversationSearch } from '../../src/features/dashboard/useConversationSearch';

function tableMock(rows: unknown[]) {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn(() => builder);
  builder.in = vi.fn(() => builder);
  builder.ilike = vi.fn(() => Promise.resolve({ data: rows, error: null }));
  return builder;
}

let messagesRows: unknown[] = [];

vi.mock('../../src/shared/supabaseClient', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'messages') return tableMock(messagesRows);
      return tableMock([]);
    },
  },
}));

describe('useConversationSearch', () => {
  beforeEach(() => {
    messagesRows = [{ conversation_id: 'conv-2' }];
  });

  it('returns null (no filter) when the query is empty', async () => {
    const { result } = renderHook(() => useConversationSearch(['conv-1', 'conv-2'], ''));
    expect(result.current.matchingIds).toBeNull();
  });

  it('returns the matching conversation ids after debounce', async () => {
    const { result } = renderHook(() => useConversationSearch(['conv-1', 'conv-2'], 'hola'));

    await waitFor(() => expect(result.current.matchingIds).not.toBeNull());

    expect(result.current.matchingIds).toEqual(new Set(['conv-2']));
  });
});
