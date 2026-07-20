import { useEffect, useState } from 'react';
import { supabase } from '../../shared/supabaseClient';
import { useSession } from '../auth/useSession';
import { PLAN_MESSAGE_LIMIT } from './useDashboardSummary';
import { isLowConfidenceMessage } from './lowConfidencePhrases';

export type BotHealthStatus = 'green' | 'yellow' | 'red';

export interface BotHealth {
  status: BotHealthStatus;
  successRate: number;
  totalMessages: number;
  lowConfidenceCount: number;
  quotaPercent: number;
  loading: boolean;
}

function currentPeriod(): string {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
}

function statusFor(successRate: number, quotaPercent: number): BotHealthStatus {
  const ratePct = successRate * 100;
  if (ratePct < 70 || quotaPercent >= 100) return 'red';
  if ((ratePct >= 70 && ratePct <= 90) || quotaPercent >= 80) return 'yellow';
  return 'green';
}

export function useBotHealth(botId: string): BotHealth {
  const { session } = useSession();
  const [health, setHealth] = useState<Omit<BotHealth, 'loading'>>({
    status: 'green',
    successRate: 1,
    totalMessages: 0,
    lowConfidenceCount: 0,
    quotaPercent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    async function load() {
      setLoading(true);
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', session!.user.id)
        .single();

      if (!business) {
        setLoading(false);
        return;
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [usageResult, conversationsResult] = await Promise.all([
        supabase
          .from('usage_metrics')
          .select('messages_count')
          .eq('business_id', business.id)
          .eq('period', currentPeriod())
          .maybeSingle(),
        supabase.from('conversations').select('id').eq('bot_id', botId),
      ]);

      const conversationIds = (conversationsResult.data ?? []).map((c: { id: string }) => c.id);
      const quotaPercent = ((usageResult.data?.messages_count ?? 0) / PLAN_MESSAGE_LIMIT) * 100;

      if (conversationIds.length === 0) {
        setHealth({ status: statusFor(1, quotaPercent), successRate: 1, totalMessages: 0, lowConfidenceCount: 0, quotaPercent });
        setLoading(false);
        return;
      }

      const { data: messages } = await supabase
        .from('messages')
        .select('content')
        .in('conversation_id', conversationIds)
        .eq('role', 'assistant')
        .gte('created_at', sevenDaysAgo.toISOString());

      const total = messages?.length ?? 0;
      const lowConfidenceCount = (messages ?? []).filter((m: { content: string }) => isLowConfidenceMessage(m.content))
        .length;
      const successRate = total === 0 ? 1 : (total - lowConfidenceCount) / total;

      setHealth({ status: statusFor(successRate, quotaPercent), successRate, totalMessages: total, lowConfidenceCount, quotaPercent });
      setLoading(false);
    }

    load();
  }, [session, botId]);

  return { ...health, loading };
}
