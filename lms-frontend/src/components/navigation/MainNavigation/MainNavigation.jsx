import { NavLink } from 'react-router-dom';
import usePermission from '../../../hooks/usePermission';
import styles from './MainNavigation.module.css';

/**
 * Renders a permission-filtered navigation tree.
 * items: [{ label, to, permission?, group? }]
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
    <>
      {Object.entries(groups).map(([group, groupItems]) => (
        <div key={group || 'default'}>
          {group && <p className={styles.groupLabel}>{group}</p>}
          <ul className={styles.list}>
            {groupItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
};

export default MainNavigation;
