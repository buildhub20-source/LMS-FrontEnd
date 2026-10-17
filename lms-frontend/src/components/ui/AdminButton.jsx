import { Loader2 } from 'lucide-react';
import { cn } from '@/utils';

/**
 * AdminButton — Pastel macaron design.
 * Wraps inline styles with the new token system.
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'|'success'} variant
 * @param {'sm'|'md'|'lg'} size
 */
const variantStyles = {
  primary: {
    background: 'var(--primary)',
    color: 'var(--primary-foreground)',
    border: '1px solid var(--primary)',
  },
  secondary: {
    background: 'var(--muted)',
    color: 'var(--foreground)',
    border: '1px solid var(--border)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--foreground)',
    border: '1px solid var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--muted-foreground)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'var(--color-red-50)',
    color: 'var(--color-red-600)',
    border: '1px solid var(--color-red-100)',
  },
  success: {
    background: 'var(--color-green-50)',
    color: 'var(--color-green-600)',
    border: '1px solid var(--color-green-100)',
  },
};

const sizeStyles = {
  sm: { height: 32, padding: '0 12px', fontSize: 12, gap: 6 },
  md: { height: 38, padding: '0 16px', fontSize: 14, gap: 8 },
  lg: { height: 44, padding: '0 22px', fontSize: 15, gap: 10 },
};

export const AdminButton = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  style = {},
  disabled,
  type = 'button',
  ...props
}) => {
  const vs = variantStyles[variant] ?? variantStyles.primary;
  const ss = sizeStyles[size] ?? sizeStyles.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold',
        'transition-all duration-150 whitespace-nowrap',
        (disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-85 active:scale-[0.98]',
        className,
      )}
      style={{ ...vs, ...ss, ...style }}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  );
};

export default AdminButton;
