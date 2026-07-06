import { useEffect, useState } from 'react';
import { Dropdown, Tooltip } from 'antd';
import { CloseOutlined, MenuOutlined, MoonOutlined, SunOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { ThemeMode } from './useTheme';
import { useActiveSection } from './useActiveSection';

interface NavbarProps {
  mode: ThemeMode;
  onToggleTheme: () => void;
}

const NAV_LINKS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'caracteristicas', label: 'Características' },
  { id: 'demo', label: 'Demo' },
  { id: 'precios', label: 'Precios' },
];

const USER_MENU_ITEMS = [
  { key: 'login', label: <Link to="/login">Iniciar sesión</Link> },
  { key: 'signup', label: <Link to="/registro">Crear cuenta</Link> },
];

function scrollToSection(id: string) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
}

export function Navbar({ mode, onToggleTheme }: NavbarProps) {
  const [spinning, setSpinning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeId = useActiveSection(NAV_LINKS.map((link) => link.id));

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleToggleTheme() {
    setSpinning(true);
    onToggleTheme();
    setTimeout(() => setSpinning(false), 400);
  }

  function handleNavClick(id: string) {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      scrollToSection(id);
      setMenuOpen(false);
    };
  }

  return (
    <header
      className={scrolled ? 'lp-navbar--scrolled' : ''}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '14px 24px',
        background: 'var(--lp-paper)',
        borderBottom: '1px solid var(--lp-border)',
        transition: 'box-shadow 0.25s ease',
      }}
    >
      <Link
        to="/"
        className="lp-display"
        style={{ fontSize: 20, color: 'var(--lp-ink)', textDecoration: 'none', cursor: 'pointer' }}
      >
        SaasChatbotIA
      </Link>

      <nav className="lp-nav-links lp-nav-pill" style={{ flex: 1, justifyContent: 'center' }}>
        {NAV_LINKS.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={handleNavClick(link.id)}
            className={`lp-nav-link ${activeId === link.id ? 'lp-nav-link--active' : ''}`}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          aria-label={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          onClick={handleToggleTheme}
          className={`lp-theme-toggle ${spinning ? 'lp-theme-toggle--spin' : ''}`}
        >
          {mode === 'dark' ? <MoonOutlined /> : <SunOutlined />}
        </button>

        <Dropdown menu={{ items: USER_MENU_ITEMS }} trigger={['click']} placement="bottomRight">
          <Tooltip title="Acceder">
            <button type="button" aria-label="Acceder" className="lp-theme-toggle">
              <UserOutlined />
            </button>
          </Tooltip>
        </Dropdown>

        <button
          type="button"
          aria-label="Abrir menú"
          className="lp-theme-toggle lp-nav-hamburger"
          onClick={() => setMenuOpen(true)}
        >
          <MenuOutlined />
        </button>
      </div>

      <div className={`lp-menu-overlay ${menuOpen ? 'lp-menu-overlay--open' : ''}`}>
        <button
          type="button"
          aria-label="Cerrar menú"
          className="lp-menu-close"
          onClick={() => setMenuOpen(false)}
        >
          <CloseOutlined />
        </button>
        <nav className="lp-menu-links">
          {NAV_LINKS.map((link, index) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={handleNavClick(link.id)}
              className={`lp-menu-link ${link.id === 'precios' ? 'lp-menu-link--accent' : ''}`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Link to="/registro" className="lp-menu-cta" onClick={() => setMenuOpen(false)}>
          Crear cuenta gratis →
        </Link>
      </div>
    </header>
  );
}
