import { forwardRef } from 'react';
import { cn } from '@/utils';

/**
 * AdminInput — Pastel macaron design.
 * Props: label, error, icon (ReactNode), hint, ...HTMLInputAttributes
 */
export const AdminInput = forwardRef(
  ({ label, error, icon, hint, style = {}, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label
          className="block mb-1.5 text-[13px] font-medium"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-[38px] rounded-xl text-sm outline-none',
            'transition-all duration-150',
            'focus:ring-2 focus:ring-offset-0',
            icon ? 'pl-9 pr-3' : 'px-3',
            error ? 'ring-1 ring-red-300' : '',
            className,
          )}
          style={{
            background: 'var(--card)',
            border: error ? '1px solid var(--color-red-300)' : '1px solid var(--border)',
            color: 'var(--foreground)',
            '--tw-ring-color': 'var(--primary)',
            ...style,
          }}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs" style={{ color: 'var(--color-red-500)' }}>{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>{hint}</p>
      ) : null}
    </div>
  ),
);

AdminInput.displayName = 'AdminInput';

export default AdminInput;
