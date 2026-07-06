import { Col, Row } from 'antd';
import { Link } from 'react-router-dom';

const PRODUCT_LINKS = [
  { id: 'caracteristicas', label: 'Características' },
  { id: 'caracteristicas', label: 'Cómo funciona' },
  { id: 'precios', label: 'Precios' },
  { id: 'demo', label: 'Prueba la demo' },
];

const ACCOUNT_LINKS = [
  { href: '/registro', label: 'Crear cuenta' },
  { href: '/login', label: 'Iniciar sesión' },
];

function handleFooterNavClick(id: string) {
  return (e: React.MouseEvent) => {
    e.preventDefault();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  };
}

export function Footer() {
  return (
    <footer className="lp-footer" style={{ padding: '56px 24px 24px' }}>
      <Row gutter={[32, 32]} style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Col xs={24} sm={10}>
          <a
            href="#inicio"
            onClick={handleFooterNavClick('inicio')}
            className="lp-display"
            style={{ fontSize: 20, color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
          >
            SaasChatbotIA
          </a>
          <p style={{ opacity: 0.7, marginTop: 12, maxWidth: 320 }}>
            El chatbot de atención al cliente que dueños de negocios pequeños configuran
            solos, sin código, y pegan en su propio sitio.
          </p>
        </Col>
        <Col xs={12} sm={7}>
          <p className="lp-eyebrow" style={{ marginBottom: 12, color: 'inherit', opacity: 0.6 }}>
            Producto
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PRODUCT_LINKS.map((link) => (
              <a
                key={link.label}
                href={`#${link.id}`}
                onClick={handleFooterNavClick(link.id)}
                style={{ color: 'inherit', opacity: 0.85 }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </Col>
        <Col xs={12} sm={7}>
          <p className="lp-eyebrow" style={{ marginBottom: 12, color: 'inherit', opacity: 0.6 }}>
            Cuenta
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ACCOUNT_LINKS.map((link) => (
              <Link key={link.label} to={link.href} style={{ color: 'inherit', opacity: 0.85 }}>
                {link.label}
              </Link>
            ))}
          </div>
        </Col>
      </Row>
      <div
        style={{
          maxWidth: 1080,
          margin: '40px auto 0',
          paddingTop: 20,
          borderTop: '1px solid rgba(255,255,255,0.12)',
          fontSize: 13,
          opacity: 0.6,
        }}
      >
        © {new Date().getFullYear()} SaasChatbotIA. Todos los derechos reservados.
      </div>
    </footer>
  );
}
