import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SessionProvider, useSession } from '../../src/features/auth/useSession';

const mockUnsubscribe = vi.fn();
let authChangeCallback: (event: string, session: unknown) => void;

vi.mock('../../src/shared/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn((callback) => {
        authChangeCallback = callback;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      }),
    },
  },
}));

function Probe() {
  const { session, loading } = useSession();
  return <div>{loading ? 'loading' : session ? 'has-session' : 'no-session'}</div>;
}

describe('useSession', () => {
  beforeEach(() => {
    mockUnsubscribe.mockClear();
  });

  it('starts as loading then resolves to no session', async () => {
    render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );

    await waitFor(() => expect(screen.getByText('no-session')).toBeTruthy());
  });

  it('reflects a session pushed via onAuthStateChange', async () => {
    render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );

    await waitFor(() => expect(screen.getByText('no-session')).toBeTruthy());

    authChangeCallback('SIGNED_IN', { user: { id: '123' } });

    await waitFor(() => expect(screen.getByText('has-session')).toBeTruthy());
  });
});
