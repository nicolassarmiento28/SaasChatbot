import type { Dayjs } from 'dayjs';
import { Button, DatePicker, Empty, Input, Select, Space, Table } from 'antd';
import type { Bot } from '../bots/types';
import type { ConversationRow } from './types';

const { RangePicker } = DatePicker;

interface ConversationListProps {
  conversations: ConversationRow[];
  bots: Bot[];
  loading: boolean;
  botFilter: string | null;
  sourceFilter: 'widget' | 'demo' | null;
  searchQuery: string;
  matchingIds: Set<string> | null;
  dateRange: [Dayjs | null, Dayjs | null] | null;
  onBotFilterChange: (botId: string | null) => void;
  onSourceFilterChange: (source: 'widget' | 'demo' | null) => void;
  onSearchQueryChange: (query: string) => void;
  onDateRangeChange: (range: [Dayjs | null, Dayjs | null] | null) => void;
  onSelect: (conversation: ConversationRow) => void;
  onGetSnippet: () => void;
}

export function ConversationList({
  conversations,
  bots,
  loading,
  botFilter,
  sourceFilter,
  searchQuery,
  matchingIds,
  dateRange,
  onBotFilterChange,
  onSourceFilterChange,
  onSearchQueryChange,
  onDateRangeChange,
  onSelect,
  onGetSnippet,
}: ConversationListProps) {
  const botNameById = new Map(bots.map((bot) => [bot.id, bot.name]));

  const [rangeStart, rangeEnd] = dateRange ?? [null, null];

  const filtered = conversations.filter((conversation) => {
    if (botFilter && conversation.bot_id !== botFilter) return false;
    if (sourceFilter && conversation.source !== sourceFilter) return false;
    if (matchingIds && !matchingIds.has(conversation.id)) return false;
    const startedAt = new Date(conversation.started_at);
    if (rangeStart && startedAt < rangeStart.startOf('day').toDate()) return false;
    if (rangeEnd && startedAt > rangeEnd.endOf('day').toDate()) return false;
    return true;
  });

  if (!loading && conversations.length === 0) {
    return (
      <Empty description="Aún no hay conversaciones. Comparte tu widget para empezar.">
        <Button type="primary" onClick={onGetSnippet}>
          Obtener snippet
        </Button>
      </Empty>
    );
  }

  return (
    <div>
      <Space wrap style={{ marginBottom: 12 }}>
        <Input.Search
          allowClear
          placeholder="Buscar en mensajes"
          style={{ width: 220 }}
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
        <Select
          allowClear
          placeholder="Filtrar por bot"
          style={{ width: 200 }}
          value={botFilter ?? undefined}
          onChange={(value) => onBotFilterChange(value ?? null)}
          options={bots.map((bot) => ({ label: bot.name, value: bot.id }))}
        />
        <Select
          allowClear
          placeholder="Filtrar por origen"
          style={{ width: 160 }}
          value={sourceFilter ?? undefined}
          onChange={(value) => onSourceFilterChange(value ?? null)}
          options={[
            { label: 'Widget', value: 'widget' },
            { label: 'Demo', value: 'demo' },
          ]}
        />
        <RangePicker value={dateRange ?? undefined} onChange={(range) => onDateRangeChange(range)} />
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={filtered}
        pagination={false}
        scroll={{ x: 'max-content' }}
        onRow={(conversation) => ({ onClick: () => onSelect(conversation) })}
        columns={[
          { title: 'Bot', dataIndex: 'bot_id', render: (botId: string) => botNameById.get(botId) ?? botId },
          { title: 'Origen', dataIndex: 'source' },
          { title: 'Visitante', dataIndex: 'visitor_id' },
          {
            title: 'Iniciada',
            dataIndex: 'started_at',
            render: (startedAt: string) => new Date(startedAt).toLocaleString(),
          },
        ]}
      />
    </div>
  );
}
