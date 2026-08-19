import appConfig from '../../../config/appConfig';
import styles from './Sidebar.module.css';

export const Sidebar = ({ isOpen = false, footer = null, children }) => (
  <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
    <div className={styles.brand}>{appConfig.name}</div>
    <nav className={styles.nav} aria-label="Main">
      {children}
    </nav>
    {footer && <div className={styles.footer}>{footer}</div>}
  </aside>
);

export default Sidebar;
