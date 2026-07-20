import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationDetail } from '../../src/features/dashboard/ConversationDetail';
import type { MessageRow } from '../../src/features/dashboard/types';

function noop() {}

const messages: MessageRow[] = [
  { id: 'm1', conversation_id: 'conv-1', role: 'user', content: '¿Tienen delivery?', created_at: '2026-01-01T00:00:00Z' },
  {
    id: 'm2',
    conversation_id: 'conv-1',
    role: 'assistant',
    content: 'No tengo información sobre eso.',
    created_at: '2026-01-01T00:01:00Z',
  },
  { id: 'm3', conversation_id: 'conv-1', role: 'user', content: 'Ok, gracias', created_at: '2026-01-01T00:02:00Z' },
  {
    id: 'm4',
    conversation_id: 'conv-1',
    role: 'assistant',
    content: 'De nada, que tengas buen día.',
    created_at: '2026-01-01T00:03:00Z',
  },
];

describe('ConversationDetail', () => {
  it('shows the warning icon and knowledge button only for low-confidence assistant messages', () => {
    render(
      <ConversationDetail conversationId="conv-1" messages={messages} onOpen={noop} onAddToKnowledge={noop} />,
    );

    expect(screen.getByLabelText('warning')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Agregar a base de conocimiento' })).toHaveLength(1);
  });

  it('pre-loads the preceding user question when adding to knowledge', () => {
    const onAddToKnowledge = vi.fn();
    render(
      <ConversationDetail
        conversationId="conv-1"
        messages={messages}
        onOpen={noop}
        onAddToKnowledge={onAddToKnowledge}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Agregar a base de conocimiento' }));
    expect(onAddToKnowledge).toHaveBeenCalledWith('¿Tienen delivery?');
  });
});
