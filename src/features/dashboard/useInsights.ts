import { useEffect, useState } from 'react';
import { supabase } from '../../shared/supabaseClient';
import { useSession } from '../auth/useSession';

export interface Insights {
  content: string | null;
  loading: boolean;
}

export function useInsights(): Insights {
  const { session } = useSession();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    async function load() {
      setLoading(true);
      const { data } = await supabase.functions.invoke('insights');
      setContent(data?.content ?? null);
      setLoading(false);
    }

    load();
  }, [session]);

  return { content, loading };
}
