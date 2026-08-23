import { Menu, Sun, Moon } from 'lucide-react';
import { useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';

/**
 * Admin Header / Topbar — dark monochrome design.
 */
export const Header = ({ title, onToggleSidebar, children }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 12,
      height: 64, padding: '0 24px', flexShrink: 0,
      background: 'var(--surface-dark)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--text-secondary)', padding: 6, borderRadius: 6,
          display: 'flex', alignItems: 'center',
        }}
        className="lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      {title && (
        <span style={{
          fontSize: 15, fontWeight: 600,
          color: 'var(--text-primary)',
          fontFamily: 'Inter, sans-serif',
        }}>
          {title}
        </span>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* System online badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--surface-medium)', border: '1px solid var(--border-color)',
        borderRadius: 20, padding: '4px 10px',
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>System Online</span>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        style={{
          background: 'var(--surface-medium)', border: '1px solid var(--border-color)',
          borderRadius: 8, padding: 7, cursor: 'pointer',
          color: 'var(--text-primary)', display: 'flex', alignItems: 'center',
          transition: 'background 0.15s ease',
        }}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Right slot (avatar, etc.) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {children}
      </div>
    </header>
  );
};

export default Header;
