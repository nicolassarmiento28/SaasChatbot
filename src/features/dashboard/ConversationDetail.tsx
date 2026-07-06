import { useEffect } from 'react';
import { Empty, Typography } from 'antd';
import type { MessageRow } from './types';

interface ConversationDetailProps {
  conversationId: string | null;
  messages: MessageRow[] | undefined;
  onOpen: (conversationId: string) => void;
}

export function ConversationDetail({ conversationId, messages, onOpen }: ConversationDetailProps) {
  useEffect(() => {
    if (conversationId) onOpen(conversationId);
  }, [conversationId, onOpen]);

  if (!conversationId) {
    return <Empty description="Selecciona una conversación" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(messages ?? []).map((message) => (
        <div
          key={message.id}
          style={{
            alignSelf: message.role === 'user' ? 'flex-start' : 'flex-end',
            background: message.role === 'user' ? '#f3f4f6' : '#eef2ff',
            borderRadius: 8,
            padding: '6px 10px',
            maxWidth: '80%',
          }}
        >
          <Typography.Text>{message.content}</Typography.Text>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              {new Date(message.created_at).toLocaleString()}
            </Typography.Text>
          </div>
        </div>
      ))}
    </div>
  );
}
