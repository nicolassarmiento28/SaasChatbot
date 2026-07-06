import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../shared/supabaseClient';
import { useSession } from '../auth/useSession';
import type { ConversationRow, MessageRow } from './types';

export function useRealtimeConversations() {
  const { session } = useSession();
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, MessageRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedConversations = useRef(new Set<string>());

  useEffect(() => {
    if (!session) return;
    const userId = session.user.id;

    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', userId)
        .single();

      if (!business) {
        if (!cancelled) {
          setConversations([]);
          setLoading(false);
        }
        return;
      }

      const { data: bots } = await supabase.from('bots').select('id').eq('business_id', business.id);
      const botIds = (bots ?? []).map((b) => b.id);

      if (botIds.length === 0) {
        if (!cancelled) {
          setConversations([]);
          setLoading(false);
        }
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .in('bot_id', botIds)
        .order('started_at', { ascending: false });

      if (cancelled) return;
      setError(fetchError?.message ?? null);
      setConversations(data ?? []);
      setLoading(false);

      // Un solo canal Realtime por sesión de dashboard: conversaciones y
      // mensajes de los bots del negocio, con cleanup al desmontar.
      const channel = supabase
        .channel(`dashboard-${business.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'conversations', filter: `bot_id=in.(${botIds.join(',')})` },
          (payload) => {
            const conversation = payload.new as ConversationRow;
            setConversations((prev) => [conversation, ...prev]);
          },
        )
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const message = payload.new as MessageRow;
          setConversations((prevConversations) => {
            const belongsToBusiness = prevConversations.some((c) => c.id === message.conversation_id);
            if (belongsToBusiness) {
              setMessagesByConversation((prev) => ({
                ...prev,
                [message.conversation_id]: [...(prev[message.conversation_id] ?? []), message],
              }));
            }
            return prevConversations;
          });
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    const cleanupPromise = load();

    return () => {
      cancelled = true;
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, [session]);

  async function ensureMessagesLoaded(conversationId: string) {
    if (loadedConversations.current.has(conversationId)) return;
    loadedConversations.current.add(conversationId);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    setMessagesByConversation((prev) => ({ ...prev, [conversationId]: data ?? [] }));
  }

  return { conversations, messagesByConversation, loading, error, ensureMessagesLoaded };
}
