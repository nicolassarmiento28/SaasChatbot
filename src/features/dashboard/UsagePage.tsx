import { Typography } from 'antd';
import { useDashboardSummary } from './useDashboardSummary';
import { UsageChart } from './UsageChart';

export function UsagePage() {
  const { messagesUsedThisMonth, messageLimit, loading } = useDashboardSummary();

  return (
    <div>
      <Typography.Title level={3}>Uso</Typography.Title>
      {!loading && <UsageChart messagesUsed={messagesUsedThisMonth} messageLimit={messageLimit} />}
    </div>
  );
}
