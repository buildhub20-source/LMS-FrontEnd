import { formatRelative } from '../../../utils/dateUtils';
import styles from './Notification.module.css';

export const Notification = ({ notification, onSelect }) => (
  <article
    className={`${styles.item} ${notification.readAt ? '' : styles.unread}`}
    onClick={() => onSelect?.(notification)}
  >
    <div>
      <p className={styles.title}>{notification.title}</p>
      <p className={styles.meta}>
        {notification.body} &middot; {formatRelative(notification.createdAt)}
      </p>
    </div>
  </article>
);

export default Notification;
