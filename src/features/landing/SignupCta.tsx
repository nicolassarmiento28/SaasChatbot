import { Button } from 'antd';
import { Link } from 'react-router-dom';

export function SignupCta() {
  return (
    <div className="lp-cta-banner">
      <p className="lp-display" style={{ fontSize: 20, margin: '0 0 6px' }}>
        ¿Te gustó la demo?
      </p>
      <p style={{ opacity: 0.85, marginBottom: 16 }}>
        Crea tu propio chatbot y personalízalo para tu negocio.
      </p>
      <Link to="/registro">
        <Button className="lp-btn-primary">Crea tu propio chatbot</Button>
      </Link>
    </div>
  );
}
