import { Badge, Tooltip } from 'antd';
import { useBotHealth } from './useBotHealth';

const BADGE_STATUS = { green: 'success', yellow: 'warning', red: 'error' } as const;

interface BotHealthBadgeProps {
  botId: string;
}

export function BotHealthBadge({ botId }: BotHealthBadgeProps) {
  const { status, successRate, lowConfidenceCount, quotaPercent, loading } = useBotHealth(botId);

  if (loading) return null;

  const tooltip = `Tasa de éxito: ${(successRate * 100).toFixed(0)}% · ${lowConfidenceCount} mensajes sin respuesta clara · Cuota consumida: ${quotaPercent.toFixed(0)}%`;

  return (
    <Tooltip title={tooltip}>
      <Badge status={BADGE_STATUS[status]} />
    </Tooltip>
  );
}
