import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../../src/features/dashboard/DashboardPage';
import { useDashboardSummary } from '../../src/features/dashboard/useDashboardSummary';

vi.mock('../../src/features/dashboard/useDashboardSummary', () => ({
  useDashboardSummary: vi.fn(),
}));

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DashboardPage', () => {
  it('shows a guided empty state with a link to onboarding when the user has no bots', () => {
    vi.mocked(useDashboardSummary).mockReturnValue({
      activeConversationsToday: 0,
      messagesUsedThisMonth: 0,
      messageLimit: 500,
      bots: [],
      plan: 'free',
      loading: false,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Aún no tienes un bot')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Crear mi primer bot' })).toBeTruthy();
  });

  it('shows the summary cards when the user has bots', () => {
    vi.mocked(useDashboardSummary).mockReturnValue({
      activeConversationsToday: 2,
      messagesUsedThisMonth: 10,
      messageLimit: 500,
      bots: [
        {
          id: 'bot-1',
          business_id: 'biz-1',
          name: 'Mi bot',
          tone: 'amigable',
          system_prompt: '',
          avatar_url: null,
          primary_color: '#000',
          is_active: true,
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
      plan: 'free',
      loading: false,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Aún no tienes un bot')).toBeNull();
    expect(screen.getByText('Mi bot')).toBeTruthy();
  });
});
