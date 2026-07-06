import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ConfigProvider, Spin, Typography, theme } from 'antd';
import { fetchBotConfig, type BotConfig } from '../../widget/chatClient';
import './landing.css';
import { DemoChatWidget } from './DemoChatWidget';
import { DemoInstructions } from './DemoInstructions';
import { useTheme } from './useTheme';

const CORAL = { light: '#2f6bff', dark: '#3b82f6' };
const BG_LAYOUT = { light: '#F2FAF7', dark: '#0e0e0d' };

const clientOptions = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

export function DemoPage() {
  const { botId: paramBotId } = useParams<{ botId: string }>();
  const botId = paramBotId ?? import.meta.env.VITE_DEMO_BOT_ID;
  const { mode } = useTheme();
  const [bot, setBot] = useState<BotConfig | null | undefined>(undefined);

  useEffect(() => {
    if (!botId) return;
    setBot(undefined);
    fetchBotConfig(clientOptions, botId).then(setBot);
  }, [botId]);

  return (
    <ConfigProvider
      theme={{
        algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary: CORAL[mode], colorBgLayout: BG_LAYOUT[mode], borderRadius: 12 },
      }}
    >
      <div
        className="lp-root"
        data-theme={mode}
        style={{
          minHeight: '100vh',
          background: 'var(--lp-paper)',
          overflowX: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 0',
        }}
      >
        {bot === undefined && <Spin size="large" />}
        {bot === null && <Typography.Text>Este bot no existe o no está disponible.</Typography.Text>}
        {bot && !bot.is_active && <Typography.Text>Este bot no está disponible actualmente.</Typography.Text>}
        {bot && bot.is_active && (
          <div>
            {bot.id === import.meta.env.VITE_DEMO_BOT_ID && <DemoInstructions />}
            <DemoChatWidget botId={bot.id} botName={bot.name} />
          </div>
        )}
      </div>
    </ConfigProvider>
  );
}
