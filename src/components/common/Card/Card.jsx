import styles from './Card.module.css';

export const Card = ({ title, actions, footer, onClick, className = '', children }) => (
  <section
    className={`${styles.card} ${onClick ? styles.interactive : ''} ${className}`}
    onClick={onClick}
  >
    {(title || actions) && (
      <header className={styles.header}>
        {typeof title === 'string' ? <h4>{title}</h4> : title}
        {actions}
      </header>
    )}
    <div className={styles.body}>{children}</div>
    {footer && <footer className={styles.footer}>{footer}</footer>}
  </section>
);

export default Card;
