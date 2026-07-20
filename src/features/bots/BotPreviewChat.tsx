import { useState } from 'react';
import { Avatar, Button, Card, Input, Space, Typography } from 'antd';
import { sendMessage } from '../../widget/chatClient';
import type { BotTone } from './systemPrompt';

const MOCK_REPLIES: Record<BotTone, string> = {
  formal: 'Buen día. Con gusto le ayudo — este es un ejemplo de cómo respondería el bot.',
  casual: '¡Ey! Buena onda, así te respondería el bot una vez que tenga info cargada 🙂',
  amigable: '¡Hola! 😊 Así de cálido te respondería el bot una vez que guardes los cambios.',
};

const clientOptions = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

interface PreviewMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface BotPreviewChatProps {
  botId: string | null;
  name: string;
  tone: BotTone;
  primaryColor: string;
  avatarUrl: string | null;
}

export function BotPreviewChat({ botId, name, tone, primaryColor, avatarUrl }: BotPreviewChatProps) {
  const [messages, setMessages] = useState<PreviewMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string>();

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setSending(true);

    if (!botId) {
      // Bot todavía no guardado: no hay bot_id real para llamar a la Edge
      // Function, mostramos una respuesta simulada según el tono elegido.
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: 'assistant', content: MOCK_REPLIES[tone] }]);
        setSending(false);
      }, 500);
      return;
    }

    try {
      const result = await sendMessage(clientOptions, { botId, visitorId: 'bot-config-preview', message: text, conversationId });
      setConversationId(result.conversation_id);
      setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'No se pudo obtener respuesta.' }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <Card
      title={
        <Space>
          <Avatar src={avatarUrl ?? undefined} style={{ backgroundColor: primaryColor }}>
            {name[0]?.toUpperCase()}
          </Avatar>
          {name || 'Tu bot'}
        </Space>
      }
    >
      <div style={{ minHeight: 200, maxHeight: 320, overflowY: 'auto', marginBottom: 12 }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              margin: '6px 0',
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-start' : 'flex-end',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                borderRadius: 8,
                padding: '6px 10px',
                background: message.role === 'user' ? '#f3f4f6' : primaryColor,
                color: message.role === 'user' ? 'inherit' : '#fff',
              }}
            >
              <Typography.Text style={{ color: 'inherit' }}>{message.content}</Typography.Text>
            </div>
          </div>
        ))}
      </div>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleSend}
          placeholder="Escribe un mensaje de prueba..."
          disabled={sending}
        />
        <Button type="primary" onClick={handleSend} loading={sending} style={{ background: primaryColor }}>
          Enviar
        </Button>
      </Space.Compact>
    </Card>
  );
}
