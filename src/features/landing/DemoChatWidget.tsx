import { useEffect, useRef, useState } from 'react';
import { Button, Card, Input, Space } from 'antd';
import { sendMessage } from '../../widget/chatClient';
import { SignupCta } from './SignupCta';

const VISITOR_ID_KEY = 'saaschatbotia_demo_visitor_id';
const GENERIC_ERROR_MESSAGE = 'Servicio no disponible por el momento. Intenta más tarde.';
const PARTICLE_COUNT = 7;

interface DemoMessage {
  role: 'user' | 'assistant';
  content: string;
}

function getVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

const clientOptions = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

function ParticleBurst() {
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
    const distance = 34;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    };
  });

  return (
    <span className="lp-particle-layer" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="lp-particle"
          style={{ ['--lp-particle-x' as string]: `${p.x}px`, ['--lp-particle-y' as string]: `${p.y}px` }}
        />
      ))}
    </span>
  );
}

interface DemoChatWidgetProps {
  botId?: string;
  botName?: string;
}

export function DemoChatWidget({ botId = import.meta.env.VITE_DEMO_BOT_ID, botName }: DemoChatWidgetProps = {}) {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [burstAt, setBurstAt] = useState<number>();
  const prevAssistantCount = useRef(0);

  useEffect(() => {
    const assistantCount = messages.filter((m) => m.role === 'assistant').length;
    if (assistantCount > prevAssistantCount.current) {
      const id = Date.now();
      setBurstAt(id);
      const timer = setTimeout(() => setBurstAt((current) => (current === id ? undefined : current)), 800);
      prevAssistantCount.current = assistantCount;
      return () => clearTimeout(timer);
    }
    prevAssistantCount.current = assistantCount;
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setSending(true);

    try {
      const result = await sendMessage(clientOptions, {
        botId,
        visitorId: getVisitorId(),
        message: text,
        conversationId,
      });
      setConversationId(result.conversation_id);
      setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: GENERIC_ERROR_MESSAGE }]);
    } finally {
      setSending(false);
    }
  }

  const hasReply = messages.some((message) => message.role === 'assistant');
  const lastAssistantIndex = messages.map((m) => m.role).lastIndexOf('assistant');

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px' }}>
      <Card
        className="lp-demo-card"
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={`lp-bot-avatar ${sending || hasReply ? 'lp-bot-avatar--active' : ''}`}>
              <span className="lp-bot-avatar__ring" />
            </span>
            {botName ?? 'Prueba el chatbot en vivo'}
          </span>
        }
      >
        {!started ? (
          <div style={{ textAlign: 'center', padding: '24px 8px' }}>
            <p style={{ color: 'var(--lp-muted)', marginBottom: 20 }}>
              Escríbele como lo haría un cliente real y mira cómo responde al instante.
            </p>
            <Button type="primary" className="lp-btn-primary" onClick={() => setStarted(true)}>
              Probar demo
            </Button>
          </div>
        ) : (
          <div className="lp-demo-reveal lp-demo-reveal--visible">
            <div style={{ minHeight: 200, maxHeight: 320, overflowY: 'auto', marginBottom: 12 }}>
              {messages.map((message, index) => (
                <div key={index} style={{ position: 'relative', margin: '6px 0' }}>
                  <div className={`lp-bubble ${message.role === 'user' ? 'lp-bubble--customer' : 'lp-bubble--bot'}`}>
                    {message.content}
                  </div>
                  {message.role === 'assistant' && index === lastAssistantIndex && burstAt && <ParticleBurst />}
                </div>
              ))}
              {sending && (
                <div className="lp-bubble lp-bubble--bot lp-typing-dots" style={{ margin: '6px 0' }}>
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={handleSend}
                placeholder="Escribe un mensaje..."
                disabled={sending}
              />
              <Button type="primary" className="lp-demo-send-btn" onClick={handleSend} loading={sending}>
                Enviar
              </Button>
            </Space.Compact>
          </div>
        )}
      </Card>
      {hasReply && <SignupCta />}
    </div>
  );
}
