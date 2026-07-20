import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../shared/supabaseClient';
import { useSession } from '../auth/useSession';
import { buildSystemPrompt, type BotTone } from './systemPrompt';
import type { Bot } from './types';

export interface BotInput {
  name: string;
  tone: BotTone;
  primary_color: string;
  avatar_url: string | null;
}

export function useBots() {
  const { session } = useSession();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', session.user.id)
      .single();

    if (!business) {
      setBots([]);
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('bots')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: true });

    setError(fetchError?.message ?? null);
    setBots(data ?? []);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function createBot(input: BotInput) {
    if (!session) throw new Error('No hay sesión activa');
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', session.user.id)
      .single();
    if (businessError || !business) throw new Error('No se encontró el negocio del usuario');

    const { data: newBot, error: insertError } = await supabase
      .from('bots')
      .insert({
        business_id: business.id,
        name: input.name,
        tone: input.tone,
        primary_color: input.primary_color,
        avatar_url: input.avatar_url,
        system_prompt: buildSystemPrompt(input.name, input.tone),
      })
      .select()
      .single();
    if (insertError) throw insertError;
    await refresh();
    return newBot as Bot;
  }

  async function updateBot(id: string, input: BotInput) {
    const { error: updateError } = await supabase
      .from('bots')
      .update({
        name: input.name,
        tone: input.tone,
        primary_color: input.primary_color,
        avatar_url: input.avatar_url,
        system_prompt: buildSystemPrompt(input.name, input.tone),
      })
      .eq('id', id);
    if (updateError) throw updateError;
    await refresh();
  }

  async function setBotActive(id: string, isActive: boolean) {
    const { error: updateError } = await supabase.from('bots').update({ is_active: isActive }).eq('id', id);
    if (updateError) throw updateError;
    await refresh();
  }

  async function deleteBot(id: string) {
    const { error: deleteError } = await supabase.from('bots').delete().eq('id', id);
    if (deleteError) throw deleteError;
    await refresh();
  }

  return { bots, loading, error, createBot, updateBot, setBotActive, deleteBot, refresh };
}
