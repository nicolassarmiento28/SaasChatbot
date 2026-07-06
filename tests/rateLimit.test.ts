import { describe, expect, it } from 'vitest';
import { isRateLimited, type RateLimitEvent } from '../supabase/functions/chat/rateLimit';

const baseConfig = {
  visitorId: 'visitor-1',
  ip: '1.2.3.4',
  botId: 'bot-1',
  windowMs: 60_000,
  maxRequests: 3,
};

function event(overrides: Partial<RateLimitEvent> = {}): RateLimitEvent {
  return {
    visitor_id: 'visitor-1',
    ip: '1.2.3.4',
    bot_id: 'bot-1',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('isRateLimited', () => {
  it('allows requests under the limit', () => {
    const events = [event(), event()];
    expect(isRateLimited(events, baseConfig)).toBe(false);
  });

  it('blocks once the limit is reached', () => {
    const events = [event(), event(), event()];
    expect(isRateLimited(events, baseConfig)).toBe(true);
  });

  it('ignores events outside the time window', () => {
    const old = Date.now() - 120_000;
    const events = [
      event({ created_at: new Date(old).toISOString() }),
      event({ created_at: new Date(old).toISOString() }),
      event({ created_at: new Date(old).toISOString() }),
    ];
    expect(isRateLimited(events, baseConfig)).toBe(false);
  });

  it('matches by ip even with a different visitor_id (spoof resistance)', () => {
    const events = [
      event({ visitor_id: 'other-1' }),
      event({ visitor_id: 'other-2' }),
      event({ visitor_id: 'other-3' }),
    ];
    expect(isRateLimited(events, baseConfig)).toBe(true);
  });

  it('does not count events from a different bot', () => {
    const events = [
      event({ bot_id: 'other-bot' }),
      event({ bot_id: 'other-bot' }),
      event({ bot_id: 'other-bot' }),
    ];
    expect(isRateLimited(events, baseConfig)).toBe(false);
  });
});
