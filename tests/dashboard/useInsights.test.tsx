import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useInsights } from '../../src/features/dashboard/useInsights';
import { useSession } from '../../src/features/auth/useSession';

vi.mock('../../src/features/auth/useSession', () => ({
  useSession: vi.fn(),
}));

const invoke = vi.fn();

vi.mock('../../src/shared/supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => invoke(...args),
    },
  },
}));

describe('useInsights', () => {
  beforeEach(() => {
    vi.mocked(useSession).mockReturnValue({ session: { user: { id: 'user-1' } } } as never);
  });

  it('exposes the content returned by the insights function', async () => {
    invoke.mockResolvedValue({ data: { content: 'Top preguntas: ...' }, error: null });

    const { result } = renderHook(() => useInsights());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(invoke).toHaveBeenCalledWith('insights');
    expect(result.current.content).toBe('Top preguntas: ...');
  });

  it('is loading initially', () => {
    invoke.mockResolvedValue({ data: { content: 'x' }, error: null });

    const { result } = renderHook(() => useInsights());

    expect(result.current.loading).toBe(true);
  });
});
