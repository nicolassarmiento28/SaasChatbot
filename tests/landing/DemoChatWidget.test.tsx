import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DemoChatWidget } from '../../src/features/landing/DemoChatWidget';

function renderWidget() {
  return render(<DemoChatWidget />, { wrapper: MemoryRouter });
}

function typeAndSend(text: string) {
  const startButton = screen.queryByRole('button', { name: 'Probar demo' });
  if (startButton) fireEvent.click(startButton);
  fireEvent.change(screen.getByPlaceholderText('Escribe un mensaje...'), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('DemoChatWidget', () => {
  it('sends a message, renders the reply, and shows the signup CTA after the first response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ conversation_id: 'c1', reply: 'Hola, ¿en qué te ayudo?' }) }),
    );

    renderWidget();
    expect(screen.queryByRole('button', { name: /crea tu propio chatbot/i })).toBeNull();

    typeAndSend('Hola');

    await waitFor(() => expect(screen.getByText('Hola, ¿en qué te ayudo?')).toBeTruthy());
    expect(screen.getByRole('button', { name: /crea tu propio chatbot/i })).toBeTruthy();
  });

  it('shows a generic message on failure, never a raw error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    renderWidget();
    typeAndSend('Hola');

    await waitFor(() =>
      expect(screen.getByText('Servicio no disponible por el momento. Intenta más tarde.')).toBeTruthy(),
    );
  });

  it('persists the visitor_id in localStorage across renders', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ conversation_id: 'c1', reply: 'hola' }) }),
    );

    const { unmount } = renderWidget();
    typeAndSend('Hola');
    await waitFor(() => expect(screen.getByText('hola')).toBeTruthy());

    const visitorId = localStorage.getItem('saaschatbotia_demo_visitor_id');
    expect(visitorId).toBeTruthy();

    unmount();
    renderWidget();
    expect(localStorage.getItem('saaschatbotia_demo_visitor_id')).toBe(visitorId);
  });
});
