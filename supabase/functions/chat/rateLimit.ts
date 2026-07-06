export interface RateLimitEvent {
  visitor_id: string;
  ip: string;
  bot_id: string;
  created_at: string;
}

export interface RateLimitConfig {
  visitorId: string;
  ip: string;
  botId: string;
  windowMs: number;
  maxRequests: number;
}

export function isRateLimited(
  events: RateLimitEvent[],
  { visitorId, ip, botId, windowMs, maxRequests }: RateLimitConfig,
  now: number = Date.now(),
): boolean {
  const windowStart = now - windowMs;
  const count = events.filter(
    (event) =>
      event.bot_id === botId &&
      (event.visitor_id === visitorId || event.ip === ip) &&
      new Date(event.created_at).getTime() >= windowStart,
  ).length;
  return count >= maxRequests;
}
