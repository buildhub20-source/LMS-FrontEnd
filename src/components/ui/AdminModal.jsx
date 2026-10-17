import { X } from 'lucide-react';
import AdminButton from './AdminButton';

/**
 * Admin Dashboard Modal — Tailwind-based.
 * Props: open, onClose, title, description, children, footer, size ('sm'|'md'|'lg'|'xl')
 */
const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const AdminModal = ({ open, onClose, title, description, children, footer, size = 'md' }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`relative w-full ${sizeMap[size] ?? sizeMap.md} max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl animate-scale-in flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Admin Dashboard Confirm Modal.
 * Props: open, onClose, onConfirm, title, message, confirmLabel, variant ('primary'|'danger'), loading
 */
export const AdminConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  loading = false,
}) => (
  <AdminModal
    open={open}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <AdminButton variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </AdminButton>
        <AdminButton variant={variant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </AdminButton>
      </>
    }
  >
    <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
  </AdminModal>
);

export default AdminModal;
