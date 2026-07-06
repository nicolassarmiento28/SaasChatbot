import { Progress, Statistic } from 'antd';

interface UsageChartProps {
  messagesUsed: number;
  messageLimit: number;
}

export function UsageChart({ messagesUsed, messageLimit }: UsageChartProps) {
  const percent = Math.min(100, Math.round((messagesUsed / messageLimit) * 100));

  return (
    <div>
      <Statistic title="Mensajes este mes" value={messagesUsed} suffix={`/ ${messageLimit}`} />
      <Progress percent={percent} status={percent >= 100 ? 'exception' : 'active'} />
    </div>
  );
}
