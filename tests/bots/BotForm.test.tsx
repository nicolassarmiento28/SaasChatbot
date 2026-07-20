import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BotForm } from '../../src/features/bots/BotForm';
import { BOT_TEMPLATES } from '../../src/features/bots/botTemplates';

function noop() {}

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BotForm template selector', () => {
  it('applying a template sets the tone and submits its FAQs for a new bot', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<BotForm open initialBot={null} onCancel={noop} onSubmit={onSubmit} />);

    const clinica = BOT_TEMPLATES.find((t) => t.id === 'clinica')!;

    const [rubroSelect] = screen.getAllByRole('combobox');
    fireEvent.mouseDown(rubroSelect);
    fireEvent.click(await screen.findByTitle(clinica.label));

    fireEvent.click(screen.getByRole('button', { name: 'Aplicar plantilla' }));

    // El tono por defecto es "Amigable"; tras aplicar la plantilla clínica (formal) debe cambiar.
    await waitFor(() => expect(screen.getByText('Formal')).toBeTruthy());

    fireEvent.change(screen.getByPlaceholderText('Asistente de Ventas'), { target: { value: 'Bot de clínica' } });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const [input, faqs] = onSubmit.mock.calls[0];
    expect(input).toMatchObject({ name: 'Bot de clínica', tone: 'formal' });
    expect(faqs).toEqual(clinica.faqs);
  });

  it('does not show the template selector when editing an existing bot', () => {
    render(
      <BotForm
        open
        initialBot={{
          id: 'bot-1',
          business_id: 'biz-1',
          name: 'Mi bot',
          tone: 'amigable',
          system_prompt: '',
          avatar_url: null,
          primary_color: '#000',
          is_active: true,
          created_at: '2026-01-01T00:00:00Z',
        }}
        onCancel={noop}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.queryByText('Plantilla por rubro')).toBeNull();
  });
});
