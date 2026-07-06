import { Modal, Typography } from 'antd';
import type { Bot } from './types';

const { Paragraph, Text } = Typography;

interface WidgetSnippetModalProps {
  bot: Bot | null;
  onClose: () => void;
}

function buildSnippet(bot: Bot): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return `<script src="https://cdn.saaschatbotia.com/widget.js" data-bot-id="${bot.id}" data-supabase-url="${supabaseUrl}" data-supabase-anon-key="${supabaseAnonKey}" defer></script>`;
}

function buildDemoLink(bot: Bot): string {
  return `${window.location.origin}/demo/${bot.id}`;
}

export function WidgetSnippetModal({ bot, onClose }: WidgetSnippetModalProps) {
  return (
    <Modal
      open={bot !== null}
      width="min(560px, 92vw)"
      onCancel={onClose}
      onOk={onClose}
      title={bot ? `Widget de "${bot.name}"` : ''}
    >
      {bot && (
        <>
          <Text strong>Snippet para embeber</Text>
          <Paragraph
            copyable={{ text: buildSnippet(bot) }}
            code
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
          >
            {buildSnippet(bot)}
          </Paragraph>

          <Text strong>Link público de la demo</Text>
          <Paragraph copyable={{ text: buildDemoLink(bot) }} style={{ wordBreak: 'break-all' }}>
            <a href={buildDemoLink(bot)} target="_blank" rel="noreferrer">
              {buildDemoLink(bot)}
            </a>
          </Paragraph>
        </>
      )}
    </Modal>
  );
}
