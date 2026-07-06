import { Select, Space, Table } from 'antd';
import type { Bot } from '../bots/types';
import type { ConversationRow } from './types';

interface ConversationListProps {
  conversations: ConversationRow[];
  bots: Bot[];
  loading: boolean;
  botFilter: string | null;
  sourceFilter: 'widget' | 'demo' | null;
  onBotFilterChange: (botId: string | null) => void;
  onSourceFilterChange: (source: 'widget' | 'demo' | null) => void;
  onSelect: (conversation: ConversationRow) => void;
}

export function ConversationList({
  conversations,
  bots,
  loading,
  botFilter,
  sourceFilter,
  onBotFilterChange,
  onSourceFilterChange,
  onSelect,
}: ConversationListProps) {
  const botNameById = new Map(bots.map((bot) => [bot.id, bot.name]));

  const filtered = conversations.filter(
    (conversation) =>
      (!botFilter || conversation.bot_id === botFilter) && (!sourceFilter || conversation.source === sourceFilter),
  );

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
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
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={filtered}
        pagination={false}
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
