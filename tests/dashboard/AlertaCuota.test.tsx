import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AlertaCuota } from '../../src/features/dashboard/AlertaCuota';

function renderAlert(quotaPercent: number) {
  return render(
    <MemoryRouter>
      <AlertaCuota messagesUsed={400} messageLimit={500} quotaPercent={quotaPercent} />
    </MemoryRouter>,
  );
}

describe('AlertaCuota', () => {
  it('does not render below 80% quota', () => {
    renderAlert(79);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders at 80%+ quota with the percentage and message count', () => {
    renderAlert(80);
    expect(screen.getByText(/Llevas 80% de tu cuota mensual \(400 de 500 mensajes\)/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ver planes' })).toBeTruthy();
  });

  it('is dismissable via the close button', () => {
    renderAlert(90);
    expect(screen.getByRole('alert')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
