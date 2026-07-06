import { useState } from 'react';
import { ConfigProvider, Drawer, theme } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  BarChartOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MenuOutlined,
  MessageOutlined,
  RobotOutlined,
} from '@ant-design/icons';
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

function SidebarContent({
  plan,
  email,
  activePath,
  onNavigate,
}: {
  plan: string | null;
  email: string | undefined;
  activePath: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="dash-sidebar__top">
        <span className="lp-display dash-logo">SaasChatbotIA</span>
        <span className="dash-plan">Plan {plan ?? 'free'}</span>
      </div>

      <nav className="dash-nav">
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? activePath === item.to : activePath.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`dash-nav-item ${active ? 'dash-nav-item--active' : ''}`}
              onClick={onNavigate}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="dash-sidebar__footer">
        <span className="dash-email">{email}</span>
        <button type="button" className="dash-logout" onClick={() => supabase.auth.signOut()}>
          <LogoutOutlined /> Cerrar sesión
        </button>
      </div>
    </>
  );
}

export function DashboardLayout() {
  const { mode } = useTheme();
  const { session } = useSession();
  const { plan } = useDashboardSummary();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ConfigProvider
      theme={{
        algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary: PRIMARY[mode], borderRadius: 12 },
      }}
    >
      <div className="lp-root dash-root" data-theme={mode}>
        <aside className="dash-sidebar">
          <SidebarContent plan={plan} email={session?.user.email} activePath={location.pathname} />
        </aside>

        <div className="dash-content">
          <header className="dash-topbar">
            <button
              type="button"
              className="dash-menu-trigger"
              aria-label="Abrir menú"
              onClick={() => setMenuOpen(true)}
            >
              <MenuOutlined />
            </button>
            <span className="dash-badge dash-badge--active">
              <span className="dash-live-dot" /> En vivo
            </span>
          </header>
          <main className="dash-main">
            <Outlet />
          </main>
        </div>

        <Drawer
          className="dash-drawer"
          placement="left"
          closable={false}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          width={240}
          styles={{ body: { padding: 0 } }}
        >
          <div className="dash-sidebar dash-sidebar--drawer">
            <SidebarContent
              plan={plan}
              email={session?.user.email}
              activePath={location.pathname}
              onNavigate={() => setMenuOpen(false)}
            />
          </div>
        </Drawer>
      </div>
    </ConfigProvider>
  );
}
