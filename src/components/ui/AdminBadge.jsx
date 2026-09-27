import { cn } from '@/utils';

/**
 * AdminBadge — Pastel macaron design with soft color backgrounds.
 * @param {'default'|'success'|'warning'|'danger'|'info'|'neutral'} variant
 * @param {boolean} dot — show a colored dot before the label
 */
const variantStyles = {
  default: {
    background: 'var(--muted)',
    color: 'var(--muted-foreground)',
    border: '1px solid var(--border)',
  },
  success: {
    background: 'var(--color-green-50)',
    color: 'var(--color-green-700)',
    border: '1px solid var(--color-green-100)',
  },
  warning: {
    background: 'var(--color-amber-50)',
    color: 'var(--color-amber-700)',
    border: '1px solid var(--color-amber-100)',
  },
  danger: {
    background: 'var(--color-red-50)',
    color: 'var(--color-red-700)',
    border: '1px solid var(--color-red-100)',
  },
  info: {
    background: 'var(--color-sky-50)',
    color: 'var(--color-sky-700)',
    border: '1px solid var(--color-sky-100)',
  },
  neutral: {
    background: 'var(--muted)',
    color: 'var(--muted-foreground)',
    border: '1px solid var(--border)',
  },
};

const dotColors = {
  default: 'var(--muted-foreground)',
  success: 'var(--color-green-500)',
  warning: 'var(--color-amber-500)',
  danger: 'var(--color-red-500)',
  info: 'var(--color-sky-500)',
  neutral: 'var(--muted-foreground)',
};

export const AdminBadge = ({
  variant = 'default',
  children,
  style = {},
  className = '',
  dot = false,
}) => {
  const vs = variantStyles[variant] ?? variantStyles.default;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
        'text-[11px] font-semibold whitespace-nowrap tracking-wide',
        className,
      )}
      style={{ ...vs, ...style }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: dotColors[variant] ?? dotColors.default }}
        />
      )}
      {children}
    </span>
  );
};

export default AdminBadge;
