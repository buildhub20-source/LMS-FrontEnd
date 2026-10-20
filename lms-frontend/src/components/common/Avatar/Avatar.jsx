import { useState } from 'react';
import { initials } from '../../../utils/formatUtils';
import styles from './Avatar.module.css';

export const Avatar = ({ src, name = '', size = 'md', className = '' }) => {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  // Callers pass either a preset (sm, md, lg) or a pixel size.
  const isPixelSize = typeof size === 'number';
  const sizeStyle = isPixelSize
    ? { width: size, height: size, fontSize: Math.round(size * 0.36) }
    : undefined;

  return (
    <span
      className={`${styles.avatar} ${isPixelSize ? '' : styles[size]} ${className}`}
      style={sizeStyle}
      title={name}
    >
      {showImage ? (
        <img className={styles.image} src={src} alt={name} onError={() => setFailed(true)} />
      ) : (
        initials(name) || '?'
      )}
    </span>
  );
};

export default Avatar;
