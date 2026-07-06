import { Avatar, Button, Space, Switch, Table } from 'antd';
import type { Bot } from './types';

interface BotListProps {
  bots: Bot[];
  loading: boolean;
  onEdit: (bot: Bot) => void;
  onDelete: (bot: Bot) => void;
  onToggleActive: (bot: Bot, isActive: boolean) => void;
  onManageKnowledge: (bot: Bot) => void;
  onShowWidget: (bot: Bot) => void;
}

export function BotList({
  bots,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
  onManageKnowledge,
  onShowWidget,
}: BotListProps) {
  return (
    <Table
      rowKey="id"
      loading={loading}
      dataSource={bots}
      pagination={false}
      columns={[
        {
          title: '',
          dataIndex: 'avatar_url',
          width: 56,
          render: (avatarUrl: string | null, bot) => <Avatar src={avatarUrl ?? undefined}>{bot.name[0]}</Avatar>,
        },
        { title: 'Nombre', dataIndex: 'name' },
        { title: 'Tono', dataIndex: 'tone' },
        {
          title: 'Activo',
          dataIndex: 'is_active',
          render: (isActive: boolean, bot) => (
            <Switch checked={isActive} onChange={(checked) => onToggleActive(bot, checked)} />
          ),
        },
        {
          title: 'Acciones',
          render: (_: unknown, bot: Bot) => (
            <Space>
              <Button size="small" onClick={() => onManageKnowledge(bot)}>
                Conocimiento
              </Button>
              <Button size="small" onClick={() => onShowWidget(bot)}>
                Widget
              </Button>
              <Button size="small" onClick={() => onEdit(bot)}>
                Editar
              </Button>
              <Button size="small" danger onClick={() => onDelete(bot)}>
                Eliminar
              </Button>
            </Space>
          ),
        },
      ]}
    />
  );
}
