import { Col, Row } from 'antd';

export function ProductDescription() {
  return (
    <div className="lp-section lp-section--alt">
      <Row gutter={[40, 32]} align="middle" style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Col xs={24} md={12}>
          <p className="lp-eyebrow" style={{ marginBottom: 12 }}>
            · cómo funciona ·
          </p>
          <h2 className="lp-display" style={{ fontSize: 30, marginBottom: 16 }}>
            ¿Qué es un chatbot de atención al cliente con IA?
          </h2>
          <p style={{ color: 'var(--lp-muted)', fontSize: 16, lineHeight: 1.6, marginBottom: 16 }}>
            Es un asistente virtual que responde a tus clientes las 24 horas, usando la
            información de tu propio negocio: horarios, precios, políticas, catálogo o
            cualquier pregunta frecuente que hoy respondes tú a mano.
          </p>
          <p style={{ color: 'var(--lp-muted)', fontSize: 16, lineHeight: 1.6 }}>
            Tú defines el tono y cargas la base de conocimiento sin escribir código. El bot
            entiende lenguaje natural y responde solo con lo que le enseñaste — nunca
            inventa políticas ni precios que no le diste.
          </p>
        </Col>
        <Col xs={24} md={12}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              padding: 24,
              background: 'var(--lp-paper)',
              border: '1px solid var(--lp-border)',
              borderRadius: 20,
            }}
          >
            <div className="lp-bubble lp-bubble--customer">¿Cuánto cuesta el servicio básico?</div>
            <div className="lp-bubble lp-bubble--bot">Desde $25.000, incluye diagnóstico inicial ✓</div>
            <div className="lp-bubble lp-bubble--customer">¿Atienden los fines de semana?</div>
            <div className="lp-bubble lp-bubble--bot">Sí, sábados de 9:00 a 14:00 ✓</div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
