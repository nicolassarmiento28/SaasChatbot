import { Col, Row, Space, Spin, Statistic, Typography } from 'antd';
import { useDashboardSummary } from './useDashboardSummary';

export function DashboardPage() {
  const { activeConversationsToday, messagesUsedThisMonth, messageLimit, bots, loading } = useDashboardSummary();

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 16 }}>
        Dashboard
      </Typography.Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <div className="dash-stat-card dash-stat-card--highlight">
            {loading ? <Spin /> : <Statistic title="Conversaciones activas hoy" value={activeConversationsToday} />}
          </div>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <div className="dash-stat-card">
            {loading ? (
              <Spin />
            ) : (
              <Statistic title="Mensajes este mes" value={messagesUsedThisMonth} suffix={`/ ${messageLimit}`} />
            )}
          </div>
        </Col>
        <Col xs={24} sm={24} lg={8}>
          <div className="dash-stat-card">
            <Typography.Text strong>Bots</Typography.Text>
            <Space direction="vertical" style={{ marginTop: 12, width: '100%' }}>
              {bots.map((bot) => (
                <div key={bot.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {bot.name}
                  <span className={`dash-badge ${bot.is_active ? 'dash-badge--active' : 'dash-badge--inactive'}`}>
                    {bot.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              ))}
            </Space>
          </div>
        </Col>
      </Row>
    </div>
  );
}
