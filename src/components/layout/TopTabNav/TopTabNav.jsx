import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/utils';

/**
 * TopTabNav — Horizontal tab navigation bar matching Figma reference.
 *
 * Centered pill-style tabs with icons, active tab gets dark background.
 * Sits at the top of the main content area, below the header.
 */
export const TopTabNav = ({ tabs = [] }) => {
  const location = useLocation();

  return (
    <nav
      className="flex items-center justify-center gap-1 px-4 py-2"
      aria-label="Section navigation"
    >
      <div className="flex items-center gap-1 rounded-full p-1"
        style={{ background: 'var(--muted)' }}>
        {tabs.map((tab) => {
          const isActive = tab.to && (
            location.pathname === tab.to ||
            location.pathname.startsWith(tab.to + '/')
          );

          return (
            <NavLink
              key={tab.label}
              to={tab.to || '#'}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
                'transition-all duration-200 whitespace-nowrap',
                isActive
                  ? 'shadow-sm'
                  : 'hover:opacity-70',
              )}
              style={{
                background: isActive ? 'var(--foreground)' : 'transparent',
                color: isActive ? 'var(--background)' : 'var(--muted-foreground)',
                textDecoration: 'none',
              }}
            >
              {tab.icon && (
                <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                  {tab.icon}
                </span>
              )}
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default TopTabNav;
