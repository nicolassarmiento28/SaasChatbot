import { Button, message, Modal, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { BotForm } from './BotForm';
import { BotList } from './BotList';
import { WidgetSnippetModal } from './WidgetSnippetModal';
import { useBots, type BotInput } from './useBots';
import type { Bot } from './types';

export function BotsPage() {
  const { bots, loading, createBot, updateBot, setBotActive, deleteBot } = useBots();
  const [formOpen, setFormOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [widgetBot, setWidgetBot] = useState<Bot | null>(null);
  const navigate = useNavigate();

  function confirmDelete(bot: Bot) {
    Modal.confirm({
      title: `¿Eliminar "${bot.name}"?`,
      okText: 'Eliminar',
      okButtonProps: { danger: true },
      cancelText: 'Cancelar',
      onOk: () => deleteBot(bot.id),
    });
  }

  async function handleSubmit(input: BotInput) {
    try {
      if (editingBot) {
        await updateBot(editingBot.id, input);
      } else {
        await createBot(input);
      }
      setFormOpen(false);
      setEditingBot(null);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'No se pudo guardar el bot');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3}>Mis bots</Typography.Title>
        <Button
          type="primary"
          onClick={() => {
            setEditingBot(null);
            setFormOpen(true);
          }}
        >
          Nuevo bot
        </Button>
      </div>

      <BotList
        bots={bots}
        loading={loading}
        onEdit={(bot) => {
          setEditingBot(bot);
          setFormOpen(true);
        }}
        onDelete={confirmDelete}
        onToggleActive={(bot, isActive) => setBotActive(bot.id, isActive)}
        onManageKnowledge={(bot) => navigate(`/dashboard/bots/${bot.id}/knowledge`)}
        onShowWidget={setWidgetBot}
      />

      <BotForm
        open={formOpen}
        initialBot={editingBot}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <WidgetSnippetModal bot={widgetBot} onClose={() => setWidgetBot(null)} />
    </div>
  );
}
