import { ChevronLeft, ChevronRight } from 'lucide-react';
import AdminButton from './AdminButton';

/**
 * AdminPagination — Pastel macaron design.
 * Props: page (0-based), totalPages, totalElements, size, onPageChange
 */
export const AdminPagination = ({ page, totalPages, totalElements, size, onPageChange }) => {
  if (totalPages <= 1) return null;

  const startItem = page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements);

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
      <p className="m-0 text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Showing <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{startItem}</span>–
        <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{endItem}</span> of{' '}
        <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{totalElements}</span>
      </p>
      <div className="flex items-center gap-2">
        <AdminButton
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          icon={<ChevronLeft size={16} />}
        >
          Prev
        </AdminButton>
        <div className="flex items-center gap-1">
          {pageNumbers.map((n, i) =>
            n === '...' ? (
              <span
                key={`ellipsis-${i}`}
                className="flex items-center justify-center w-6 h-8 text-sm"
                style={{ color: 'var(--muted-foreground)' }}
              >
                …
              </span>
            ) : (
              <button
                key={n}
                onClick={() => onPageChange(n)}
                className="h-8 min-w-[32px] rounded-lg px-2 text-sm font-semibold transition-all duration-150 border-none cursor-pointer hover:opacity-80"
                style={{
                  background: n === page ? 'var(--primary)' : 'transparent',
                  color: n === page ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                }}
              >
                {n + 1}
              </button>
            ),
          )}
        </div>
        <AdminButton
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
        >
          Next
          <ChevronRight size={16} />
        </AdminButton>
      </div>
    </div>
  );
};

/**
 * AdminEmptyState — Pastel macaron design.
 */
export const AdminEmptyState = ({ icon, title, message, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div
      className="mb-4 flex w-14 h-14 items-center justify-center rounded-2xl"
      style={{ background: 'var(--accent)', color: 'var(--primary)' }}
    >
      {icon}
    </div>
    <h3 className="m-0 text-base font-semibold" style={{ color: 'var(--foreground)' }}>
      {title}
    </h3>
    <p className="mt-1 text-sm max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
      {message}
    </p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

/**
 * AdminErrorState — Pastel macaron design.
 */
export const AdminErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div
      className="mb-4 flex w-14 h-14 items-center justify-center rounded-2xl"
      style={{ background: 'var(--color-red-50)', color: 'var(--color-red-500)' }}
    >
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    </div>
    <h3 className="m-0 text-base font-semibold" style={{ color: 'var(--foreground)' }}>
      Something went wrong
    </h3>
    <p className="mt-1 text-sm max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
      {message}
    </p>
    {onRetry && (
      <div className="mt-6">
        <AdminButton variant="outline" size="sm" onClick={onRetry}>
          Try again
        </AdminButton>
      </div>
    )}
  </div>
);

export default AdminPagination;
