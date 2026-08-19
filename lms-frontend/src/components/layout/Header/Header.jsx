import styles from './Header.module.css';

export const Header = ({ title, onToggleSidebar, children }) => (
  <header className={styles.header}>
    <button
      type="button"
      className={styles.menuButton}
      onClick={onToggleSidebar}
      aria-label="Toggle navigation"
    >
      &#9776;
    </button>
    <span className={styles.title}>{title}</span>
    <div className={styles.actions}>{children}</div>
  </header>
);

export default Header;
