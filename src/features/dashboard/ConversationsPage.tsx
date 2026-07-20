import { useState } from 'react';
import type { Dayjs } from 'dayjs';
import { Card, Col, Row, Typography } from 'antd';
import { useBots } from '../bots/useBots';
import { WidgetSnippetModal } from '../bots/WidgetSnippetModal';
import { useRealtimeConversations } from './useRealtimeConversations';
import { useConversationSearch } from './useConversationSearch';
import { ConversationList } from './ConversationList';
import { ConversationDetail } from './ConversationDetail';
import type { ConversationRow } from './types';

export function ConversationsPage() {
  const { bots } = useBots();
  const { conversations, messagesByConversation, loading, ensureMessagesLoaded } = useRealtimeConversations();
  const [botFilter, setBotFilter] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<'widget' | 'demo' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [selected, setSelected] = useState<ConversationRow | null>(null);
  const [snippetOpen, setSnippetOpen] = useState(false);
  const { matchingIds } = useConversationSearch(
    conversations.map((c) => c.id),
    searchQuery,
  );

  return (
    <div>
      <Typography.Title level={3}>Conversaciones</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <ConversationList
            conversations={conversations}
            bots={bots}
            loading={loading}
            botFilter={botFilter}
            sourceFilter={sourceFilter}
            searchQuery={searchQuery}
            matchingIds={matchingIds}
            dateRange={dateRange}
            onBotFilterChange={setBotFilter}
            onSourceFilterChange={setSourceFilter}
            onSearchQueryChange={setSearchQuery}
            onDateRangeChange={setDateRange}
            onSelect={setSelected}
            onGetSnippet={() => setSnippetOpen(true)}
          />
        </Col>
        <Col xs={24} lg={10}>
          <Card title={selected ? `Conversación con ${selected.visitor_id}` : 'Detalle'}>
            <ConversationDetail
              conversationId={selected?.id ?? null}
              messages={selected ? messagesByConversation[selected.id] : undefined}
              onOpen={ensureMessagesLoaded}
            />
          </Card>
        </Col>
      </Row>

      <WidgetSnippetModal bot={snippetOpen ? (bots[0] ?? null) : null} onClose={() => setSnippetOpen(false)} />
    </div>
  );
}
