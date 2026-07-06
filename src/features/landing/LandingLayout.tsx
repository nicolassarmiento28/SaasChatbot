import type { ReactNode } from 'react';
import { ConfigProvider, theme } from 'antd';
import './landing.css';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useTheme } from './useTheme';

const PRIMARY = { light: '#1D9E75', dark: '#1D9E75' };
const BG_LAYOUT = { light: '#F2FAF7', dark: '#0e0e0d' };

export function LandingLayout({ children }: { children: ReactNode }) {
  const { mode, toggle } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary: PRIMARY[mode], colorBgLayout: BG_LAYOUT[mode], borderRadius: 12 },
      }}
    >
      <div
        className="lp-root"
        data-theme={mode}
        style={{ minHeight: '100vh', overflowX: 'hidden', touchAction: 'pan-y' }}
      >
        <Navbar mode={mode} onToggleTheme={toggle} />
        {children}
        <Footer />
      </div>
    </ConfigProvider>
  );
}
