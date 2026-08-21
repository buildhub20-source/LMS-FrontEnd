import { ChevronLeft, ChevronRight } from 'lucide-react';
import AdminButton from './AdminButton';

/**
 * Admin Dashboard Pagination.
 * Props: page (0-based), totalPages, totalElements, size, onPageChange
 */
export const AdminPagination = ({ page, totalPages, totalElements, size, onPageChange }) => {
  if (totalPages <= 1) return null;

  const startItem = page * size + 1;
  const endItem   = Math.min((page + 1) * size, totalElements);

  // Show up to 7 page buttons
  const maxVisible = 7;
  let pageNumbers = [];
  if (totalPages <= maxVisible) {
    pageNumbers = Array.from({ length: totalPages }, (_, i) => i);
  } else if (page < 4) {
    pageNumbers = [0, 1, 2, 3, 4, '...', totalPages - 1];
  } else if (page >= totalPages - 4) {
    pageNumbers = [0, '...', totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1];
  } else {
    pageNumbers = [0, '...', page - 1, page, page + 1, '...', totalPages - 1];
  }

  return (
    <div className="flex items-center justify-between gap-4 px-1">
      <p className="text-sm text-slate-500">
        Showing{' '}
        <span className="font-semibold text-slate-700">{startItem}</span>–
        <span className="font-semibold text-slate-700">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-700">{totalElements}</span>
      </p>
      <div className="flex items-center gap-2">
        <AdminButton
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          icon={<ChevronLeft className="h-4 w-4" />}
        >
          Prev
        </AdminButton>
        <div className="flex items-center gap-1">
          {pageNumbers.map((n, i) =>
            n === '...' ? (
              <span key={`ellipsis-${i}`} className="h-8 w-6 flex items-center justify-center text-sm text-slate-400">
                …
              </span>
            ) : (
              <button
                key={n}
                onClick={() => onPageChange(n)}
                className={`h-8 min-w-8 rounded-lg px-2 text-sm font-semibold transition-colors ${
                  n === page ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {n + 1}
              </button>
            )
          )}
        </div>
        <AdminButton
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </AdminButton>
      </div>
    </div>
  );
};

/**
 * Admin Dashboard EmptyState.
 * Props: icon, title, message, action
 */
export const AdminEmptyState = ({ icon, title, message, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
      {icon}
    </div>
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    <p className="mt-1 text-sm text-slate-500 max-w-sm">{message}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

/**
 * Admin Dashboard ErrorState.
 * Props: message, onRetry
 */
export const AdminErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    </div>
    <h3 className="text-base font-semibold text-slate-900">Something went wrong</h3>
    <p className="mt-1 text-sm text-slate-500 max-w-sm">{message}</p>
    {onRetry && (
      <AdminButton variant="outline" size="sm" className="mt-6" onClick={onRetry}>
        Try again
      </AdminButton>
    )}
  </div>
);

export default AdminPagination;
