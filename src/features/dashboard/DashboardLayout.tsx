import { ConfigProvider, theme } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BarChartOutlined, DashboardOutlined, LogoutOutlined, MessageOutlined, RobotOutlined } from '@ant-design/icons';
import { supabase } from '../../shared/supabaseClient';
import { useSession } from '../auth/useSession';
import { useTheme } from '../landing/useTheme';
import { useDashboardSummary } from './useDashboardSummary';
import '../landing/landing.css';
import './dashboard.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: <DashboardOutlined />, exact: true },
  { to: '/dashboard/bots', label: 'Mis bots', icon: <RobotOutlined /> },
  { to: '/dashboard/conversaciones', label: 'Conversaciones', icon: <MessageOutlined /> },
  { to: '/dashboard/uso', label: 'Uso', icon: <BarChartOutlined /> },
];

const PRIMARY = { light: '#1D9E75', dark: '#1D9E75' };

export function DashboardLayout() {
  const { mode } = useTheme();
  const { session } = useSession();
  const { plan } = useDashboardSummary();
  const location = useLocation();

  return (
    <ConfigProvider
      theme={{
        algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary: PRIMARY[mode], borderRadius: 12 },
      }}
    >
      <div className="lp-root dash-root" data-theme={mode}>
        <aside className="dash-sidebar">
          <div className="dash-sidebar__top">
            <span className="lp-display dash-logo">SaasChatbotIA</span>
            <span className="dash-plan">Plan {plan ?? 'free'}</span>
          </div>

          <nav className="dash-nav">
            {NAV_ITEMS.map((item) => {
              const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
              return (
                <Link key={item.to} to={item.to} className={`dash-nav-item ${active ? 'dash-nav-item--active' : ''}`}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="dash-sidebar__footer">
            <span className="dash-email">{session?.user.email}</span>
            <button type="button" className="dash-logout" onClick={() => supabase.auth.signOut()}>
              <LogoutOutlined /> Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="dash-content">
          <header className="dash-topbar">
            <span className="dash-badge dash-badge--active">
              <span className="dash-live-dot" /> En vivo
            </span>
          </header>
          <main className="dash-main">
            <Outlet />
          </main>
        </div>
      </div>
    </ConfigProvider>
  );
}
