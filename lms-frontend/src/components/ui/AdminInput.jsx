import { forwardRef } from 'react';

/**
 * Admin Dashboard Input — Tailwind-based.
 * Props: label, error, icon (ReactNode), hint, ...HTMLInputAttributes
 */
export const AdminInput = forwardRef(({ label, error, icon, hint, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="label-base">{label}</label>}
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        className={`input-base ${icon ? 'pl-10' : ''} ${
          error ? 'border-red-300 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      />
    </div>
    {error ? (
      <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
    ) : hint ? (
      <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
    ) : null}
  </div>
));

AdminInput.displayName = 'AdminInput';

export default AdminInput;
