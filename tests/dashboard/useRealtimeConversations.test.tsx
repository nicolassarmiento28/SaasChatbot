import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRealtimeConversations } from '../../src/features/dashboard/useRealtimeConversations';
import { useSession } from '../../src/features/auth/useSession';

vi.mock('../../src/features/auth/useSession', () => ({
  useSession: vi.fn(),
}));

function tableMock(rows: unknown[]) {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.in = vi.fn(() => builder);
  builder.order = vi.fn(() => Promise.resolve({ data: rows, error: null, count: rows.length }));
  builder.single = vi.fn(() => Promise.resolve({ data: rows[0] ?? null, error: null }));
  // Permite usar el builder directamente como el resultado final (ej. `await
  // supabase.from(x).select().eq(...)` sin encadenar `.order()`/`.single()`).
  builder.then = (onFulfilled: (value: { data: unknown; error: null }) => unknown) =>
    onFulfilled({ data: rows, error: null });
  return builder;
}

const { removeChannel, channelFactory } = vi.hoisted(() => {
  const channel = { on: vi.fn(), subscribe: vi.fn() };
  channel.on.mockReturnValue(channel);
  channel.subscribe.mockReturnValue(channel);
  return { removeChannel: vi.fn(), channelFactory: vi.fn(() => channel) };
});

vi.mock('../../src/shared/supabaseClient', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'businesses') return tableMock([{ id: 'biz-1' }]);
      if (table === 'bots') return tableMock([{ id: 'bot-1' }]);
      if (table === 'conversations') return tableMock([{ id: 'conv-1', bot_id: 'bot-1', source: 'widget' }]);
      return tableMock([]);
    },
    channel: channelFactory,
    removeChannel,
  },
}));

describe('useRealtimeConversations', () => {
  beforeEach(() => {
    channelFactory.mockClear();
    removeChannel.mockClear();
    vi.mocked(useSession).mockReturnValue({ session: { user: { id: 'user-1' } } } as never, );
  });

  it('loads conversations for the user business and opens a single realtime channel', async () => {
    const { result } = renderHook(() => useRealtimeConversations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.conversations).toEqual([{ id: 'conv-1', bot_id: 'bot-1', source: 'widget' }]);
    expect(channelFactory).toHaveBeenCalledTimes(1);
  });

  it('removes the channel on unmount (no duplicate subscriptions across mounts)', async () => {
    const { result, unmount } = renderHook(() => useRealtimeConversations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    unmount();

    await waitFor(() => expect(removeChannel).toHaveBeenCalledTimes(1));
  });
});
