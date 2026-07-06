import { Button, Col, Row } from 'antd';
import { Link } from 'react-router-dom';
import { Reveal } from './Reveal';

const PLANS = [
  { name: 'Free', price: '$0', description: '1 bot, ideal para probar el producto.', highlight: false },
  { name: 'Pro', price: '$29/mes', description: 'Varios bots y mayor límite de mensajes.', highlight: true },
  { name: 'Enterprise', price: 'A medida', description: 'Límites altos y soporte dedicado.', highlight: false },
];

export function PricingSection() {
  return (
    <div id="precios" className="lp-section">
      <h2 className="lp-display" style={{ textAlign: 'center', fontSize: 32, marginBottom: 40 }}>
        Precios
      </h2>
      <Row gutter={[16, 16]} justify="center" style={{ maxWidth: 900, margin: '0 auto' }}>
        {PLANS.map((plan, index) => (
          <Col key={plan.name} xs={24} sm={12} lg={7}>
            <Reveal className="lp-h-full" delayMs={index * 80}>
              <div className={`lp-pricing-card ${plan.highlight ? 'lp-pricing-card--highlight' : ''}`}>
                <p className="lp-eyebrow" style={{ marginBottom: 4 }}>
                  {plan.name}
                </p>
                <p className="lp-display" style={{ fontSize: 28, margin: '0 0 8px' }}>
                  {plan.price}
                </p>
                <p style={{ color: 'var(--lp-muted)', marginBottom: 20 }}>{plan.description}</p>
                <Link to="/registro">
                  <Button type="primary" block className="lp-btn-primary">
                    Empezar
                  </Button>
                </Link>
              </div>
            </Reveal>
          </Col>
        ))}
      </Row>
    </div>
  );
}
