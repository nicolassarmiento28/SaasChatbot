import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBotHealth } from '../../src/features/dashboard/useBotHealth';
import { useSession } from '../../src/features/auth/useSession';

vi.mock('../../src/features/auth/useSession', () => ({
  useSession: vi.fn(),
}));

function tableMock(rows: unknown[]) {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.in = vi.fn(() => builder);
  builder.gte = vi.fn(() => Promise.resolve({ data: rows, error: null }));
  builder.single = vi.fn(() => Promise.resolve({ data: rows[0] ?? null, error: null }));
  builder.maybeSingle = vi.fn(() => Promise.resolve({ data: rows[0] ?? null, error: null }));
  builder.then = (onFulfilled: (value: { data: unknown; error: null }) => unknown) =>
    onFulfilled({ data: rows, error: null });
  return builder;
}

let messagesRows: unknown[] = [];
let usageRows: unknown[] = [];
let conversationsRows: unknown[] = [{ id: 'conv-1' }];

vi.mock('../../src/shared/supabaseClient', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'businesses') return tableMock([{ id: 'biz-1' }]);
      if (table === 'usage_metrics') return tableMock(usageRows);
      if (table === 'conversations') return tableMock(conversationsRows);
      if (table === 'messages') return tableMock(messagesRows);
      return tableMock([]);
    },
  },
}));

describe('useBotHealth', () => {
  beforeEach(() => {
    vi.mocked(useSession).mockReturnValue({ session: { user: { id: 'user-1' } } } as never);
    conversationsRows = [{ id: 'conv-1' }];
  });

  it('is green when success rate > 90% and quota < 80%', async () => {
    usageRows = [{ messages_count: 100 }]; // 20% of 500
    messagesRows = Array.from({ length: 10 }, () => ({ content: 'Aquí tienes la respuesta.' }));

    const { result } = renderHook(() => useBotHealth('bot-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.status).toBe('green');
  });

  it('is yellow when success rate is between 70% and 90%', async () => {
    usageRows = [{ messages_count: 100 }];
    messagesRows = [
      ...Array.from({ length: 8 }, () => ({ content: 'Aquí tienes la respuesta.' })),
      ...Array.from({ length: 2 }, () => ({ content: 'no sé la respuesta a eso' })),
    ]; // 80% success rate

    const { result } = renderHook(() => useBotHealth('bot-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.status).toBe('yellow');
  });

  it('is yellow when quota is at 80%+', async () => {
    usageRows = [{ messages_count: 400 }]; // 80% of 500
    messagesRows = Array.from({ length: 10 }, () => ({ content: 'Aquí tienes la respuesta.' }));

    const { result } = renderHook(() => useBotHealth('bot-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.status).toBe('yellow');
  });

  it('is red when success rate < 70%', async () => {
    usageRows = [{ messages_count: 0 }];
    messagesRows = [
      ...Array.from({ length: 6 }, () => ({ content: 'no puedo responder eso' })),
      ...Array.from({ length: 4 }, () => ({ content: 'Aquí tienes la respuesta.' })),
    ]; // 40% success rate

    const { result } = renderHook(() => useBotHealth('bot-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.status).toBe('red');
  });

  it('is red when quota is at 100%', async () => {
    usageRows = [{ messages_count: 500 }];
    messagesRows = Array.from({ length: 10 }, () => ({ content: 'Aquí tienes la respuesta.' }));

    const { result } = renderHook(() => useBotHealth('bot-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.status).toBe('red');
  });
});
