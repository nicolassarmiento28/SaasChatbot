import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BotPreviewChat } from '../../src/features/bots/BotPreviewChat';

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function sendPreviewMessage(text: string) {
  fireEvent.change(screen.getByPlaceholderText('Escribe un mensaje de prueba...'), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
}

describe('BotPreviewChat', () => {
  it('shows a simulated reply for an unsaved bot (no botId), without calling the API', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(
      <BotPreviewChat botId={null} name="Mi bot" tone="amigable" primaryColor="#1677ff" avatarUrl={null} ctaButtons={[]} />,
    );

    sendPreviewMessage('Hola');

    await waitFor(() => expect(screen.getByText(/Así de cálido te respondería/)).toBeTruthy());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('calls the real chat API for a saved bot', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ conversation_id: 'conv-1', reply: 'Respuesta real' }) }),
    );

    render(
      <BotPreviewChat botId="bot-1" name="Mi bot" tone="formal" primaryColor="#1677ff" avatarUrl={null} ctaButtons={[]} />,
    );

    sendPreviewMessage('Hola');

    await waitFor(() => expect(screen.getByText('Respuesta real')).toBeTruthy());
  });

  it('shows CTA buttons after the first reply, linking to their configured URL', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ conversation_id: 'conv-1', reply: 'Respuesta real' }) }),
    );

    render(
      <BotPreviewChat
        botId="bot-1"
        name="Mi bot"
        tone="formal"
        primaryColor="#1677ff"
        avatarUrl={null}
        ctaButtons={[{ label: 'Ver menú', url: 'https://example.com/menu' }]}
      />,
    );

    sendPreviewMessage('Hola');

    await waitFor(() => expect(screen.getByText('Respuesta real')).toBeTruthy());
    const ctaLink = screen.getByRole('link', { name: 'Ver menú' });
    expect(ctaLink.getAttribute('href')).toBe('https://example.com/menu');
  });
});
