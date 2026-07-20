import { Button, Col, Result, Row, Space, Spin, Statistic, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AlertaCuota } from './AlertaCuota';
import { BotHealthBadge } from './BotHealthBadge';
import { useDashboardSummary } from './useDashboardSummary';

export function DashboardPage() {
  const { activeConversationsToday, messagesUsedThisMonth, messageLimit, bots, loading } = useDashboardSummary();
  const navigate = useNavigate();
  const quotaPercent = (messagesUsedThisMonth / messageLimit) * 100;

  if (!loading && bots.length === 0) {
    return (
      <Result
        status="info"
        title="Aún no tienes un bot"
        subTitle="Crea tu primer bot para empezar a atender a tus clientes."
        extra={
          <Button type="primary" onClick={() => navigate('/onboarding')}>
            Crear mi primer bot
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 16 }}>
        Dashboard
      </Typography.Title>

      {!loading && (
        <AlertaCuota messagesUsed={messagesUsedThisMonth} messageLimit={messageLimit} quotaPercent={quotaPercent} />
      )}

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
                <div key={bot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    {bot.name}
                    <BotHealthBadge botId={bot.id} />
                  </Space>
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
