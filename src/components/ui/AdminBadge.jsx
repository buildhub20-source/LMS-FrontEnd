/**
 * Admin Dashboard Badge — Tailwind-based.
 * @param {'default'|'success'|'warning'|'danger'|'info'|'neutral'} variant
 * @param {boolean} dot  — show a colored dot before the label
 */
const variantStyles = {
  default: 'bg-brand-50 text-brand-700 border-brand-200',
  success:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning:  'bg-amber-50 text-amber-700 border-amber-200',
  danger:   'bg-red-50 text-red-700 border-red-200',
  info:     'bg-sky-50 text-sky-700 border-sky-200',
  neutral:  'bg-slate-100 text-slate-600 border-slate-200',
};

const dotColors = {
  default: 'bg-brand-500',
  success:  'bg-emerald-500',
  warning:  'bg-amber-500',
  danger:   'bg-red-500',
  info:     'bg-sky-500',
  neutral:  'bg-slate-400',
};

export const AdminBadge = ({ variant = 'default', children, className = '', dot = false }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variantStyles[variant] ?? variantStyles.default} ${className}`}
  >
    {dot && (
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColors[variant] ?? dotColors.default}`} />
    )}
    {children}
  </span>
);

export default AdminBadge;
