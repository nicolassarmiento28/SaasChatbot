import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../shared/supabaseClient';
import { LOW_CONFIDENCE_PHRASES } from './lowConfidencePhrases';

const OR_FILTER = LOW_CONFIDENCE_PHRASES.map((phrase) => `content.ilike.%${phrase}%`).join(',');

// Conversaciones con al menos un mensaje del bot marcado como de baja
// confianza — usado por el filtro "Necesita revisión" (specs/06-dashboard.md §5).
export function useLowConfidenceConversations(conversationIds: string[]) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  // conversationIds llega como un array nuevo en cada render del padre; usamos
  // una clave estable para no re-disparar el efecto en cada render.
  const idsKey = useMemo(() => conversationIds.join(','), [conversationIds]);

  useEffect(() => {
    if (conversationIds.length === 0) {
      setIds(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', conversationIds)
      .eq('role', 'assistant')
      .or(OR_FILTER)
      .then(({ data }) => {
        setIds(new Set((data ?? []).map((row: { conversation_id: string }) => row.conversation_id)));
        setLoading(false);
      });
  }, [idsKey]);

  return { needsReviewIds: ids, loading };
}
