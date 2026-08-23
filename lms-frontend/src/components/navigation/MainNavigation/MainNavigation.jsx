import { NavLink } from 'react-router-dom';
import usePermission from '../../../hooks/usePermission';

/**
 * Renders a permission-filtered, icon-aware navigation tree.
 * items: [{ label, to, permission?, group?, icon?, end? }]
 *
 * Full dark monochrome design — uses CSS vars from globals.css
 */
export const MainNavigation = ({ items = [] }) => {
  const { hasPermission } = usePermission();
  const visible = items.filter((item) => !item.permission || hasPermission(item.permission));

  const groups = visible.reduce((acc, item) => {
    const key = item.group ?? '';
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontFamily: 'Inter, sans-serif' }}>
      {Object.entries(groups).map(([group]) => {
        const groupItems = groups[group];
        return (
          <div key={group || 'default'}>
            {/* Group Header */}
            {group && (
              <div style={{ padding: '16px 20px 6px' }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '1px', color: 'var(--text-muted)',
                }}>
                  {group}
                </span>
              </div>
            )}

            {/* Menu Items */}
            <ul style={{ listStyle: 'none', margin: 0, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {groupItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={item.onNavigate}
                    style={({ isActive }) => ({
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
                    })}
                    className="nav-item"
                  >
                    {({ isActive }) => (
                      <>
                        {item.icon && (
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                            transition: 'color 0.15s ease',
                            flexShrink: 0,
                          }}>
                            {item.icon}
                          </span>
                        )}
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-item:hover {
          background-color: var(--hover-bg) !important;
          color: var(--text-primary) !important;
        }
        .nav-item:hover span {
          color: var(--text-primary) !important;
        }
      `}} />
    </div>
  );
};

export default MainNavigation;
