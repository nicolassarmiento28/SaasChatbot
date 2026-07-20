import { sendMessage, type BotConfig, type ChatClientOptions } from './chatClient';

const GENERIC_ERROR_MESSAGE = 'Servicio no disponible por el momento. Intenta más tarde.';

export interface ChatWidgetOptions {
  clientOptions: ChatClientOptions;
  bot: BotConfig;
  visitorId: string;
  getConversationId: () => string | undefined;
  setConversationId: (id: string) => void;
}

export function mountChatWidget(options: ChatWidgetOptions): void {
  const host = document.createElement('div');
  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    .button { position: fixed; bottom: 20px; right: 20px; width: 56px; height: 56px;
      border-radius: 50%; background: ${options.bot.primary_color ?? '#4f46e5'};
      color: #fff; border: none; cursor: pointer; font-size: 24px; }
    .panel { position: fixed; bottom: 88px; right: 20px; width: 320px; height: 420px;
      background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,.2);
      display: none; flex-direction: column; overflow: hidden; font-family: sans-serif; }
    .panel.open { display: flex; }
    .messages { flex: 1; overflow-y: auto; padding: 8px; }
    .msg { margin: 4px 0; padding: 6px 10px; border-radius: 8px; max-width: 80%; }
    .msg.user { background: #eef2ff; margin-left: auto; }
    .msg.assistant { background: #f3f4f6; }
    .input-row { display: flex; border-top: 1px solid #e5e7eb; }
    .input-row input { flex: 1; border: none; padding: 10px; font-size: 14px; }
    .input-row button { border: none; background: none; padding: 0 12px; cursor: pointer; }
    .cta-row { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 8px; }
    .cta-btn { border: 1px solid ${options.bot.primary_color ?? '#4f46e5'};
      color: ${options.bot.primary_color ?? '#4f46e5'}; background: #fff; border-radius: 6px;
      padding: 4px 10px; font-size: 13px; cursor: pointer; }
  `;

  const button = document.createElement('button');
  button.className = 'button';
  button.textContent = '💬';

  const panel = document.createElement('div');
  panel.className = 'panel';

  const messages = document.createElement('div');
  messages.className = 'messages';

  const inputRow = document.createElement('div');
  inputRow.className = 'input-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Escribe un mensaje...';

  const sendButton = document.createElement('button');
  sendButton.textContent = '➤';

  inputRow.append(input, sendButton);
  panel.append(messages, inputRow);
  shadow.append(style, button, panel);
  document.body.appendChild(host);

  function appendMessage(role: 'user' | 'assistant', content: string) {
    const el = document.createElement('div');
    el.className = `msg ${role}`;
    el.textContent = content;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  function appendCtaButtons(buttons: { label: string; url: string }[]) {
    if (!buttons.length) return;
    const row = document.createElement('div');
    row.className = 'cta-row';
    for (const cta of buttons) {
      const btn = document.createElement('button');
      btn.className = 'cta-btn';
      btn.textContent = cta.label;
      btn.addEventListener('click', () => window.open(cta.url, '_blank', 'noopener,noreferrer'));
      row.appendChild(btn);
    }
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  button.addEventListener('click', () => {
    panel.classList.toggle('open');
  });

  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    appendMessage('user', text);

    try {
      const result = await sendMessage(options.clientOptions, {
        botId: options.bot.id,
        visitorId: options.visitorId,
        message: text,
        conversationId: options.getConversationId(),
      });
      options.setConversationId(result.conversation_id);
      appendMessage('assistant', result.reply);
      appendCtaButtons(result.cta_buttons ?? []);
    } catch {
      appendMessage('assistant', GENERIC_ERROR_MESSAGE);
    }
  }

  sendButton.addEventListener('click', handleSend);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });
}
