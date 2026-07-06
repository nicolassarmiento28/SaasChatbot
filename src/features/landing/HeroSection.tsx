import { Button, Col, Row } from 'antd';
import { Link } from 'react-router-dom';
import { Reveal } from './Reveal';
import { useTypewriter } from './useTypewriter';

const HEADLINE = 'Tu negocio, respondiendo solo, a toda hora.';

export function HeroSection() {
  const headline = useTypewriter(HEADLINE);

  return (
    <div id="inicio" className="lp-section lp-hero" style={{ paddingTop: 96 }}>
      <Row gutter={[32, 48]} align="middle" style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Col xs={24} md={13}>
          <Reveal>
            <p className="lp-eyebrow" style={{ marginBottom: 16 }}>
              · chatbot para negocios ·
            </p>
            <h1
              className="lp-display lp-typewriter"
              style={{ fontSize: 'clamp(32px, 5vw, 52px)', margin: '0 0 16px', minHeight: '1.05em' }}
            >
              {headline}
            </h1>
            <p style={{ fontSize: 18, color: 'var(--lp-muted)', maxWidth: 480, marginBottom: 28 }}>
              Configura el tono, la base de conocimiento y la apariencia de tu chatbot sin
              escribir código, y pega un script en tu sitio para atender clientes 24/7.
            </p>
            <Link to="/registro">
              <Button type="primary" size="large" className="lp-btn-primary">
                Crear mi chatbot gratis →
              </Button>
            </Link>
            <div className="lp-receipt" style={{ marginTop: 20 }}>
              <span>7 días gratis</span>
              <span>Sin tarjeta</span>
              <span>Cancela cuando quieras</span>
            </div>
          </Reveal>
        </Col>
        <Col xs={24} md={11}>
          <Reveal>
            <div
              style={{
                transform: 'rotate(-1.5deg)',
                background: 'var(--lp-paper-alt)',
                border: '1px solid var(--lp-border)',
                borderRadius: 20,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div className="lp-bubble lp-bubble--customer">Hola, ¿tienen envíos hoy?</div>
              <div className="lp-bubble lp-bubble--bot">¡Claro! Hacemos envíos hasta las 20:00 ✓</div>
              <div className="lp-bubble lp-bubble--customer">Perfecto, gracias</div>
            </div>
          </Reveal>
        </Col>
      </Row>
    </div>
  );
}
