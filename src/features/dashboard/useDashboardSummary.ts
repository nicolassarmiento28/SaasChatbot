import { useEffect, useState } from 'react';
import { supabase } from '../../shared/supabaseClient';
import { useSession } from '../auth/useSession';
import type { Bot } from '../bots/types';

// Mismo límite usado por la Edge Function `chat` (supabase/functions/chat/index.ts)
// para no mantener dos fuentes de verdad sobre el límite de mensajes por plan.
export const PLAN_MESSAGE_LIMIT = 500;

function currentPeriod(): string {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
}

export interface DashboardSummary {
  activeConversationsToday: number;
  messagesUsedThisMonth: number;
  messageLimit: number;
  bots: Bot[];
  plan: string | null;
  loading: boolean;
}

export function useDashboardSummary(): DashboardSummary {
  const { session } = useSession();
  const [summary, setSummary] = useState<Omit<DashboardSummary, 'loading'>>({
    activeConversationsToday: 0,
    messagesUsedThisMonth: 0,
    messageLimit: PLAN_MESSAGE_LIMIT,
    bots: [],
    plan: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const userId = session.user.id;

    async function load() {
      setLoading(true);
      const { data: business } = await supabase
        .from('businesses')
        .select('id, plan')
        .eq('owner_id', userId)
        .single();

      if (!business) {
        setLoading(false);
        return;
      }

      const { data: bots } = await supabase.from('bots').select('*').eq('business_id', business.id);
      const botIds = (bots ?? []).map((b) => b.id);

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [conversationsResult, usageResult] = await Promise.all([
        botIds.length
          ? supabase
              .from('conversations')
              .select('id', { count: 'exact', head: true })
              .in('bot_id', botIds)
              .gte('started_at', startOfToday.toISOString())
          : Promise.resolve({ count: 0 }),
        supabase
          .from('usage_metrics')
          .select('messages_count')
          .eq('business_id', business.id)
          .eq('period', currentPeriod())
          .maybeSingle(),
      ]);

      setSummary({
        activeConversationsToday: conversationsResult.count ?? 0,
        messagesUsedThisMonth: usageResult.data?.messages_count ?? 0,
        messageLimit: PLAN_MESSAGE_LIMIT,
        bots: bots ?? [],
        plan: business.plan ?? null,
      });
      setLoading(false);
    }

    load();
  }, [session]);

  return { ...summary, loading };
}
