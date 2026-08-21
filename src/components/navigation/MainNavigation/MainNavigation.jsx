import { NavLink } from 'react-router-dom';
import usePermission from '../../../hooks/usePermission';

/**
 * Renders a permission-filtered, icon-aware navigation tree.
 * items: [{ label, to, permission?, group?, icon?, end? }]
 *
 * Redesigned to match the reference Admin Dashboard sidebar style:
 * - Active item: brand-50 background, brand-700 text
 * - Hover: slate-50 background
 * - Icons: rendered at h-5 w-5 with colour-aware classes
 * - Group labels: uppercase, muted, spacing above
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
    <div className="space-y-1">
      {Object.entries(groups).map(([group, groupItems]) => (
        <div key={group || 'default'}>
          {group && (
            <p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {group}
            </p>
          )}
          <ul className="space-y-0.5 list-none m-0 p-0">
            {groupItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={item.onNavigate}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.icon && (
                        <span
                          className={`shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-400'}`}
                        >
                          {item.icon}
                        </span>
                      )}
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default MainNavigation;
