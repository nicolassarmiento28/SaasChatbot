import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../../src/features/auth/ProtectedRoute';

vi.mock('../../src/features/auth/useSession', () => ({
  useSession: vi.fn(),
}));

import { useSession } from '../../src/features/auth/useSession';

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>secret-content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>login-page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when there is no session', async () => {
    vi.mocked(useSession).mockReturnValue({ session: null, loading: false });

    renderProtected();

    await waitFor(() => expect(screen.getByText('login-page')).toBeTruthy());
  });

  it('renders children when a session exists', async () => {
    vi.mocked(useSession).mockReturnValue({
      session: { user: { id: '123' } } as never,
      loading: false,
    });

    renderProtected();

    await waitFor(() => expect(screen.getByText('secret-content')).toBeTruthy());
  });
});
