import { useEffect } from 'react';
import { Button, Empty, Space, Tooltip, Typography } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { isLowConfidenceMessage } from './lowConfidencePhrases';
import type { MessageRow } from './types';

interface ConversationDetailProps {
  conversationId: string | null;
  messages: MessageRow[] | undefined;
  onOpen: (conversationId: string) => void;
  onAddToKnowledge: (question: string) => void;
}

export function ConversationDetail({ conversationId, messages, onOpen, onAddToKnowledge }: ConversationDetailProps) {
  useEffect(() => {
    if (conversationId) onOpen(conversationId);
  }, [conversationId, onOpen]);

  if (!conversationId) {
    return <Empty description="Selecciona una conversación" />;
  }

  const rows = messages ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((message, index) => {
        const lowConfidence = message.role === 'assistant' && isLowConfidenceMessage(message.content);
        const question = rows
          .slice(0, index)
          .reverse()
          .find((m) => m.role === 'user')?.content;

        return (
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
            <Space align="start">
              <Typography.Text>{message.content}</Typography.Text>
              {lowConfidence && (
                <Tooltip title="El bot no supo responder">
                  <WarningOutlined style={{ color: '#fa8c16' }} />
                </Tooltip>
              )}
            </Space>
            <div>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                {new Date(message.created_at).toLocaleString()}
              </Typography.Text>
            </div>
            {lowConfidence && question && (
              <div>
                <Button size="small" onClick={() => onAddToKnowledge(question)}>
                  Agregar a base de conocimiento
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
