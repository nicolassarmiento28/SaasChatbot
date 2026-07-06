import { Col, Row } from 'antd';
import { Reveal } from './Reveal';
import { useCountUp } from './useCountUp';
import { useReveal } from './useReveal';

const FEATURES = [
  { title: 'Configuración sin código', description: 'Define nombre, tono y apariencia de tu bot en minutos.' },
  { title: 'Base de conocimiento', description: 'Carga FAQs, documentos o texto libre para que el bot responda con tu información.' },
  { title: 'Widget embebible', description: 'Un script vanilla JS que pegas en tu sitio, sin dependencias pesadas.' },
  { title: 'Panel de conversaciones', description: 'Sigue en tiempo real lo que tus clientes preguntan.' },
];

const STATS = [
  { target: 24, suffix: '/7', label: 'disponibilidad' },
  { target: 2, prefix: '<', suffix: 's', label: 'tiempo de respuesta' },
  { target: 100, suffix: '%', label: 'sin código' },
];

function StatsRow() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap', marginBottom: 48 }}>
      {STATS.map((stat) => (
        <Stat key={stat.label} {...stat} active={visible} />
      ))}
    </div>
  );
}

function Stat({
  target,
  prefix = '',
  suffix = '',
  label,
  active,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
  active: boolean;
}) {
  const value = useCountUp(target, active);
  return (
    <div style={{ textAlign: 'center' }}>
      <p className="lp-display" style={{ fontSize: 32, margin: 0, color: 'var(--lp-indigo)' }}>
        {prefix}
        {value}
        {suffix}
      </p>
      <p style={{ color: 'var(--lp-muted)', fontSize: 13, margin: 0 }}>{label}</p>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <div id="caracteristicas" className="lp-section">
      <p className="lp-eyebrow" style={{ textAlign: 'center', marginBottom: 8 }}>
        · así te ayuda ·
      </p>
      <h2 className="lp-display" style={{ textAlign: 'center', fontSize: 32, marginBottom: 40 }}>
        Todo lo que necesitas para atender a tus clientes
      </h2>
      <StatsRow />
      <Row gutter={[16, 16]} style={{ maxWidth: 1080, margin: '0 auto' }}>
        {FEATURES.map((feature, index) => (
          <Col key={feature.title} xs={24} sm={12} lg={6}>
            <Reveal className="lp-h-full" delayMs={index * 80}>
              <div className="lp-feature-card">
                <p className="lp-feature-card__title">{feature.title}</p>
                <p className="lp-feature-card__desc">{feature.description}</p>
              </div>
            </Reveal>
          </Col>
        ))}
      </Row>
    </div>
  );
}
