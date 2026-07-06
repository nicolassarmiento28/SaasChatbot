import { useState } from 'react';
import { Card, Col, Row, Typography } from 'antd';
import { useBots } from '../bots/useBots';
import { useRealtimeConversations } from './useRealtimeConversations';
import { ConversationList } from './ConversationList';
import { ConversationDetail } from './ConversationDetail';
import type { ConversationRow } from './types';

export function ConversationsPage() {
  const { bots } = useBots();
  const { conversations, messagesByConversation, loading, ensureMessagesLoaded } = useRealtimeConversations();
  const [botFilter, setBotFilter] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<'widget' | 'demo' | null>(null);
  const [selected, setSelected] = useState<ConversationRow | null>(null);

  return (
    <div>
      <Typography.Title level={3}>Conversaciones</Typography.Title>
      <Row gutter={16}>
        <Col span={14}>
          <ConversationList
            conversations={conversations}
            bots={bots}
            loading={loading}
            botFilter={botFilter}
            sourceFilter={sourceFilter}
            onBotFilterChange={setBotFilter}
            onSourceFilterChange={setSourceFilter}
            onSelect={setSelected}
          />
        </Col>
        <Col span={10}>
          <Card title={selected ? `Conversación con ${selected.visitor_id}` : 'Detalle'}>
            <ConversationDetail
              conversationId={selected?.id ?? null}
              messages={selected ? messagesByConversation[selected.id] : undefined}
              onOpen={ensureMessagesLoaded}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
