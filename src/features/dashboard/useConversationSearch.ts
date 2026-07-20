import { useEffect, useState } from 'react';
import { supabase } from '../../shared/supabaseClient';

const DEBOUNCE_MS = 300;

// Búsqueda por contenido de mensajes: devuelve los conversation_id que
// tienen al menos un mensaje que matchea el texto, o null si no hay
// búsqueda activa (sin filtrar).
export function useConversationSearch(conversationIds: string[], query: string) {
  const [matchingIds, setMatchingIds] = useState<Set<string> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || conversationIds.length === 0) {
      setMatchingIds(trimmed ? new Set() : null);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from('messages')
        .select('conversation_id')
        .in('conversation_id', conversationIds)
        .ilike('content', `%${trimmed}%`);
      setMatchingIds(new Set((data ?? []).map((row: { conversation_id: string }) => row.conversation_id)));
      setLoading(false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [conversationIds, query]);

  return { matchingIds, loading };
}
