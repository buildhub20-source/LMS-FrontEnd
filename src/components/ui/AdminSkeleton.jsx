/**
 * Admin Dashboard Skeleton components.
 */

/**
 * Table skeleton — renders rows × cols skeleton cells.
 */
export const AdminTableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <div
            key={j}
            className="skeleton h-10 flex-1 rounded-lg"
            style={{ animationDelay: `${i * 100 + j * 50}ms` }}
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
  <div className="card-base p-6 space-y-4">
    <div className="skeleton h-4 w-24 rounded" />
    <div className="skeleton h-8 w-16 rounded" />
    <div className="skeleton h-3 w-32 rounded" />
  </div>
);

export default AdminTableSkeleton;
