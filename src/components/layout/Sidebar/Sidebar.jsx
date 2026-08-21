import appConfig from '../../../config/appConfig';
import { GraduationCap, X } from 'lucide-react';

/**
 * Admin Sidebar — redesigned with modern Tailwind styling.
 * API unchanged: isOpen, children (nav items), footer
 */
export const Sidebar = ({ isOpen = false, onClose, children, footer = null }) => (
  <>
    {/* Mobile overlay backdrop */}
    {isOpen && (
      <div
        className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
    )}

    {/* Sidebar panel */}
    <aside
      className={[
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white border-r border-slate-200',
        'transition-transform duration-300 ease-in-out',
        'lg:translate-x-0 lg:static lg:inset-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}
    >
      {/* Brand / Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-slate-100 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 leading-tight truncate">
            {appConfig.name ?? 'LMS Admin'}
          </p>
          <p className="text-xs text-slate-400 leading-tight">Management Console</p>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
        {children}
      </nav>

      {/* Footer slot (user card) */}
      {footer && (
        <div className="border-t border-slate-100 p-3 shrink-0">
          {footer}
        </div>
      )}
    </aside>
  </>
);

export default Sidebar;
