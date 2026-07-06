import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchBotConfig, sendMessage } from '../src/widget/chatClient';

const clientOptions = { supabaseUrl: 'https://project.supabase.co', supabaseAnonKey: 'anon-key' };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchBotConfig', () => {
  it('returns the bot config on success', async () => {
    const bot = { id: 'bot-1', name: 'Bot', primary_color: '#000', avatar_url: null, is_active: true };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [bot] }));

    const result = await fetchBotConfig(clientOptions, 'bot-1');
    expect(result).toEqual(bot);
  });

  it('returns null when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const result = await fetchBotConfig(clientOptions, 'bot-1');
    expect(result).toBeNull();
  });
});

describe('sendMessage', () => {
  it('returns the reply on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ conversation_id: 'c1', reply: 'hola' }) }),
    );

    const result = await sendMessage(clientOptions, {
      botId: 'bot-1',
      visitorId: 'visitor-1',
      message: 'hi',
    });

    expect(result).toEqual({ conversation_id: 'c1', reply: 'hola' });
  });

  it('throws when the endpoint responds with an error (rate limit / plan limit)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await expect(
      sendMessage(clientOptions, { botId: 'bot-1', visitorId: 'visitor-1', message: 'hi' }),
    ).rejects.toThrow('chat_unavailable');
  });
});
