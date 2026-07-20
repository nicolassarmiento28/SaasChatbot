import { Card, Spin, Typography } from 'antd';

interface InsightsCardProps {
  content: string | null;
  loading: boolean;
}

export function InsightsCard({ content, loading }: InsightsCardProps) {
  return (
    <Card title="Insights de la semana" style={{ marginBottom: 16 }}>
      {loading ? <Spin /> : <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>{content}</Typography.Paragraph>}
    </Card>
  );
}
