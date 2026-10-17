import { X, AlertTriangle } from 'lucide-react';
import AdminButton from './AdminButton';

/**
 * AdminModal — Pastel macaron design.
 * Props: open, onClose, title, description, children, footer, size ('sm'|'md'|'lg'|'xl')
 */
const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const AdminModal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  overflowVisible = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`relative w-full ${sizeMap[size] ?? sizeMap.md} max-h-[90vh] ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'} rounded-2xl shadow-lg animate-scale-in flex flex-col`}
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="m-0 text-lg font-bold" style={{ color: 'var(--foreground)' }}>
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 transition-colors hover:bg-[var(--muted)]"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}
          >
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className={`flex-1 ${overflowVisible ? 'overflow-visible' : 'overflow-y-auto'} px-6 py-5`}>{children}</div>
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--muted)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * AdminConfirmModal — Pastel-styled confirmation dialog.
 */
export const AdminConfirmModal = ({
  open,
  onClose,
  onCancel,
  onConfirm,
  title = 'Are you sure?',
  message,
  description,
  confirmLabel = 'Confirm',
  variant = 'danger',
  danger = false,
  loading = false,
}) => {
  const handleClose = onClose || onCancel;
  const displayMessage = message || description;
  const isDestructive = danger || variant === 'danger';
  const resolvedVariant = isDestructive ? 'danger' : (variant || 'primary');

  return (
    <AdminModal
      open={open}
      onClose={handleClose}
      title={title}
      size="sm"
      footer={
        <>
          <AdminButton variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </AdminButton>
          <AdminButton variant={resolvedVariant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </AdminButton>
        </>
      }
    >
      <div className="flex gap-3.5 items-start">
        {isDestructive && (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--color-red-50)', color: 'var(--color-red-500)' }}
          >
            <AlertTriangle size={18} />
          </div>
        )}
        <p className="m-0 text-sm flex-1 whitespace-pre-line" style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
          {displayMessage}
        </p>
      </div>
    </AdminModal>
  );
};

export default AdminModal;
