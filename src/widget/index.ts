import { fetchBotConfig } from './chatClient';
import { mountChatWidget } from './ChatWidget';

const VISITOR_ID_KEY = 'saaschatbotia_visitor_id';
const CONVERSATION_ID_KEY = 'saaschatbotia_conversation_id';

function getVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

async function init() {
  const script = document.currentScript as HTMLScriptElement | null;
  const botId = script?.dataset.botId;

  // La URL y la anon key de Supabase se inyectan en el bundle en tiempo de
  // build (vite.widget.config.ts), no vienen del HTML del sitio anfitrión:
  // el snippet que copia el dueño del negocio solo trae data-bot-id.
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!botId || !supabaseUrl || !supabaseAnonKey) return;

  const clientOptions = { supabaseUrl, supabaseAnonKey };
  const bot = await fetchBotConfig(clientOptions, botId);
  if (!bot || !bot.is_active) return;

  mountChatWidget({
    clientOptions,
    bot,
    visitorId: getVisitorId(),
    getConversationId: () => sessionStorage.getItem(CONVERSATION_ID_KEY) ?? undefined,
    setConversationId: (id) => sessionStorage.setItem(CONVERSATION_ID_KEY, id),
  });
}

init();
