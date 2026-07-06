import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DemoPage } from '../../src/features/landing/DemoPage';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/demo/:botId" element={<DemoPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('DemoPage', () => {
  it('renders the chat widget for an active bot', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ id: 'bot-1', name: 'Bot de prueba', primary_color: '#000', avatar_url: null, is_active: true }],
      }),
    );

    renderAt('/demo/bot-1');

    await waitFor(() => expect(screen.getByText('Bot de prueba')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Probar demo' }));
    expect(screen.getByPlaceholderText('Escribe un mensaje...')).toBeTruthy();
  });

  it('shows a not-found message when the bot does not exist', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));

    renderAt('/demo/missing-bot');

    await waitFor(() => expect(screen.getByText('Este bot no existe o no está disponible.')).toBeTruthy());
  });

  it('shows an unavailable message for an inactive bot', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ id: 'bot-2', name: 'Bot inactivo', primary_color: '#000', avatar_url: null, is_active: false }],
      }),
    );

    renderAt('/demo/bot-2');

    await waitFor(() => expect(screen.getByText('Este bot no está disponible actualmente.')).toBeTruthy());
  });
});
