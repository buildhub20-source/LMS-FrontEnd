import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import usePermission from '../../../hooks/usePermission';

/**
 * Renders a permission-filtered, icon-aware navigation tree.
 *
 * items: [{ label, to, permission?, group?, icon?, end?, children? }]
 *
 * An item with `children` becomes a collapsible section instead of a link: the
 * parent is a toggle, the children are the destinations. Children are
 * permission-filtered individually, and a section with nothing visible left is
 * dropped entirely rather than rendering an empty expander.
 *
 * Full dark monochrome design — uses CSS vars from globals.css
 */
export const MainNavigation = ({ items = [] }) => {
  const { hasPermission } = usePermission();
  const allowed = (item) => !item.permission || hasPermission(item.permission);

  const visible = items
    .filter(allowed)
    .map((item) => (item.children ? { ...item, children: item.children.filter(allowed) } : item))
    .filter((item) => !item.children || item.children.length > 0);

  const groups = visible.reduce((acc, item) => {
    const key = item.group ?? '';
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 2, fontFamily: 'Inter, sans-serif' }}
    >
      {Object.entries(groups).map(([group]) => {
        const groupItems = groups[group];
        return (
          <div key={group || 'default'}>
            {/* Group Header */}
            {group && (
              <div style={{ padding: '16px 20px 6px' }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {group}
                </span>
              </div>
            )}

            {/* Menu Items */}
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: '0 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {groupItems.map((item) =>
                item.children ? (
                  <NavSection key={item.label} item={item} />
                ) : (
                  <li key={item.to}>
                    <NavItemLink item={item} />
                  </li>
                ),
              )}
            </ul>
          </div>
        );
      })}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .nav-item:hover {
          background-color: var(--hover-bg) !important;
          color: var(--text-primary) !important;
        }
        .nav-item:hover span {
          color: var(--text-primary) !important;
        }
        .nav-child:hover {
          color: var(--text-primary) !important;
        }
        .nav-child:hover .nav-dot {
          background-color: var(--text-primary) !important;
        }
      `,
        }}
      />
    </div>
  );
};

const linkStyle = ({ isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '9px 12px',
  borderRadius: 6,
  fontSize: 14,
  fontWeight: isActive ? 600 : 400,
  textDecoration: 'none',
  transition: 'all 0.15s ease',
  background: isActive ? 'var(--active-bg)' : 'transparent',
  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
  border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
});

const NavItemLink = ({ item }) => (
  <NavLink
    to={item.to}
    end={item.end}
    onClick={item.onNavigate}
    style={linkStyle}
    className="nav-item"
  >
    {({ isActive }) => (
      <>
        {item.icon && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'color 0.15s ease',
              flexShrink: 0,
            }}
          >
            {item.icon}
          </span>
        )}
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.label}
        </span>
      </>
    )}
  </NavLink>
);

/** A collapsible parent and its children. */
const NavSection = ({ item }) => {
  const { pathname } = useLocation();

  // Open when the current route is inside the section, so a hard refresh or a
  // deep link lands with the right section already expanded.
  const containsActive = item.children.some(
    (child) => pathname === child.to || pathname.startsWith(`${child.to}/`),
  );
  const [isOpen, setIsOpen] = useState(containsActive);
  const expanded = isOpen || containsActive;

  return (
    <li>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={expanded}
        className="nav-item"
        style={{
          ...linkStyle({ isActive: containsActive }),
          width: '100%',
          justifyContent: 'space-between',
          cursor: 'pointer',
          font: 'inherit',
          fontSize: 14,
          fontWeight: containsActive ? 600 : 400,
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {item.icon && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                color: containsActive ? 'var(--text-primary)' : 'var(--text-muted)',
                flexShrink: 0,
              }}
            >
              {item.icon}
            </span>
          )}
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.label}
          </span>
        </span>
        <ChevronDown
          className="h-4 w-4"
          style={{
            flexShrink: 0,
            transition: 'transform 0.15s ease',
            transform: expanded ? 'rotate(180deg)' : 'none',
            color: 'var(--text-muted)',
          }}
        />
      </button>

      {expanded && (
        <ul
          style={{
            listStyle: 'none',
            margin: '2px 0 4px',
            // The rule lines the children up under the parent's icon.
            padding: '0 0 0 22px',
            borderLeft: '1px solid var(--border-color)',
            marginLeft: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {item.children.map((child) => (
            <li key={child.to}>
              <NavLink
                to={child.to}
                end={child.end}
                className="nav-child"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 10px',
                  borderRadius: 6,
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 400,
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                  color: isActive ? 'var(--color-primary, #14b8a6)' : 'var(--text-secondary)',
                })}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className="nav-dot"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: isActive
                          ? 'var(--color-primary, #14b8a6)'
                          : 'var(--text-muted)',
                        transition: 'background-color 0.15s ease',
                      }}
                    />
                    <span
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {child.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default MainNavigation;
