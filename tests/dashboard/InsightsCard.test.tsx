import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InsightsCard } from '../../src/features/dashboard/InsightsCard';

describe('InsightsCard', () => {
  it('shows a loading spinner while loading', () => {
    render(<InsightsCard content={null} loading={true} />);
    expect(document.querySelector('.ant-spin')).toBeTruthy();
  });

  it('shows the content once loaded', () => {
    render(<InsightsCard content="Top preguntas frecuentes: ..." loading={false} />);
    expect(screen.getByText('Top preguntas frecuentes: ...')).toBeTruthy();
  });
});
