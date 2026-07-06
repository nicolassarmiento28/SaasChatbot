import type { ReactNode } from 'react';
import { Card, ConfigProvider, theme } from 'antd';
import { Link } from 'react-router-dom';
import '../landing/landing.css';
import './auth.css';
import { useTheme } from '../landing/useTheme';

const PRIMARY = { light: '#1D9E75', dark: '#1D9E75' };

export function AuthLayout({ children }: { children: ReactNode }) {
  const { mode } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary: PRIMARY[mode], borderRadius: 12 },
      }}
    >
      <div className="lp-root auth-root" data-theme={mode}>
        <div className="auth-panel-left">
          <span className="lp-display" style={{ fontSize: 24 }}>
            SaasChatbotIA
          </span>
          <p className="auth-tagline">Tu negocio, respondiendo solo, a toda hora.</p>
          <div className="auth-mockup">
            <div className="auth-mockup__bubble auth-mockup__bubble--customer">¿Tienen envíos hoy?</div>
            <div className="auth-mockup__bubble auth-mockup__bubble--bot">¡Claro! Hasta las 20:00 ✓</div>
          </div>
        </div>
        <div className="auth-panel-right">
          <div className="auth-card-wrap">
            <Link to="/" className="auth-back-link">
              ← Volver
            </Link>
            <Card className="auth-card">{children}</Card>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
