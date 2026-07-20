import { useState } from 'react';
import type { Dayjs } from 'dayjs';
import { Card, Col, Row, Typography } from 'antd';
import { useBots } from '../bots/useBots';
import { WidgetSnippetModal } from '../bots/WidgetSnippetModal';
import { KnowledgeSourceForm } from '../bots/KnowledgeSourceForm';
import { useKnowledgeSources } from '../bots/useKnowledgeSources';
import { useRealtimeConversations } from './useRealtimeConversations';
import { useConversationSearch } from './useConversationSearch';
import { useLowConfidenceConversations } from './useLowConfidenceConversations';
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
  const [needsReviewFilter, setNeedsReviewFilter] = useState(false);
  const [selected, setSelected] = useState<ConversationRow | null>(null);
  const [snippetOpen, setSnippetOpen] = useState(false);
  const [knowledgePrefill, setKnowledgePrefill] = useState<string | null>(null);
  const { matchingIds } = useConversationSearch(
    conversations.map((c) => c.id),
    searchQuery,
  );
  const { needsReviewIds } = useLowConfidenceConversations(conversations.map((c) => c.id));
  const { createSource } = useKnowledgeSources(selected?.bot_id ?? '');

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
            needsReviewFilter={needsReviewFilter}
            needsReviewIds={needsReviewIds}
            onBotFilterChange={setBotFilter}
            onSourceFilterChange={setSourceFilter}
            onSearchQueryChange={setSearchQuery}
            onDateRangeChange={setDateRange}
            onNeedsReviewFilterChange={setNeedsReviewFilter}
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
              onAddToKnowledge={setKnowledgePrefill}
            />
          </Card>
        </Col>
      </Row>

      <WidgetSnippetModal bot={snippetOpen ? (bots[0] ?? null) : null} onClose={() => setSnippetOpen(false)} />

      <KnowledgeSourceForm
        open={knowledgePrefill !== null}
        prefill={{ type: 'faq', title: knowledgePrefill ?? '', content: knowledgePrefill ?? '' }}
        onCancel={() => setKnowledgePrefill(null)}
        onSubmit={async (input) => {
          await createSource(input);
          setKnowledgePrefill(null);
        }}
      />
    </div>
  );
}
