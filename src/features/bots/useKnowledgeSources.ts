import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../shared/supabaseClient';
import type { KnowledgeSource, KnowledgeSourceType } from './types';

export interface KnowledgeSourceInput {
  type: KnowledgeSourceType;
  title: string;
  content: string;
  file_url: string | null;
}

export function useKnowledgeSources(botId: string) {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('knowledge_sources')
      .select('*')
      .eq('bot_id', botId)
      .order('created_at', { ascending: true });
    setError(fetchError?.message ?? null);
    setSources(data ?? []);
    setLoading(false);
  }, [botId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function createSource(input: KnowledgeSourceInput) {
    const { error: insertError } = await supabase.from('knowledge_sources').insert({ bot_id: botId, ...input });
    if (insertError) throw insertError;
    await refresh();
  }

  async function updateSource(id: string, input: KnowledgeSourceInput) {
    const { error: updateError } = await supabase.from('knowledge_sources').update(input).eq('id', id);
    if (updateError) throw updateError;
    await refresh();
  }

  async function deleteSource(id: string) {
    const { error: deleteError } = await supabase.from('knowledge_sources').delete().eq('id', id);
    if (deleteError) throw deleteError;
    await refresh();
  }

  return { sources, loading, error, createSource, updateSource, deleteSource, refresh };
}
