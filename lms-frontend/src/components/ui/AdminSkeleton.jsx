/**
 * Admin Skeleton components — Pastel macaron design.
 * Uses the new token system via compat layer.
 */

/**
 * Table skeleton — renders rows × cols skeleton cells.
 */
export const AdminTableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <div
            key={j}
            className="animate-pulse h-10 flex-1 rounded-xl"
            style={{
              background: 'var(--skeleton-bg, var(--muted))',
              animationDelay: `${i * 100 + j * 50}ms`,
            }}
          />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Card skeleton — renders a single card placeholder.
 */
export const AdminCardSkeleton = () => (
  <div
    className="rounded-2xl p-6 flex flex-col gap-4"
    style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
    }}
  >
    <div className="animate-pulse h-4 w-24 rounded" style={{ background: 'var(--skeleton-bg, var(--muted))' }} />
    <div className="animate-pulse h-8 w-16 rounded" style={{ background: 'var(--skeleton-bg, var(--muted))' }} />
    <div className="animate-pulse h-3 w-32 rounded" style={{ background: 'var(--skeleton-bg, var(--muted))' }} />
  </div>
);

export default AdminTableSkeleton;
