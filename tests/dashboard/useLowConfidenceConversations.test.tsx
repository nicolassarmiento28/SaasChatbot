import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLowConfidenceConversations } from '../../src/features/dashboard/useLowConfidenceConversations';

let messagesRows: unknown[] = [];

function tableMock(rows: unknown[]) {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn(() => builder);
  builder.in = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.or = vi.fn(() => Promise.resolve({ data: rows, error: null }));
  return builder;
}

vi.mock('../../src/shared/supabaseClient', () => ({
  supabase: {
    from: (table: string) => (table === 'messages' ? tableMock(messagesRows) : tableMock([])),
  },
}));

describe('useLowConfidenceConversations', () => {
  beforeEach(() => {
    messagesRows = [{ conversation_id: 'conv-2' }];
  });

  it('returns the conversation ids with at least one low-confidence message', async () => {
    const { result } = renderHook(() => useLowConfidenceConversations(['conv-1', 'conv-2']));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.needsReviewIds).toEqual(new Set(['conv-2']));
  });

  it('returns an empty set when there are no conversations', async () => {
    const { result } = renderHook(() => useLowConfidenceConversations([]));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.needsReviewIds).toEqual(new Set());
  });
});
