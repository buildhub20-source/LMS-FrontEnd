import { Menu } from 'lucide-react';

/**
 * Admin Header / Topbar — redesigned with modern Tailwind styling.
 * API unchanged: title, onToggleSidebar, children
 */
export const Header = ({ title, onToggleSidebar, children }) => (
  <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md lg:px-6 shrink-0">
    {/* Hamburger — mobile only */}
    <button
      type="button"
      onClick={onToggleSidebar}
      aria-label="Toggle navigation"
      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors lg:hidden"
    >
      <Menu className="h-5 w-5" />
    </button>

    {/* Page title */}
    {title && (
      <span className="text-base font-semibold text-slate-700 hidden lg:block">
        {title}
      </span>
    )}

    {/* System online status badge */}
    <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 ml-auto">
      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-xs font-medium text-slate-600">System Online</span>
    </div>

    {/* Right-side slot (avatar, sign-out, etc.) */}
    <div className={`flex items-center gap-3 ${title ? '' : 'ml-auto'}`}>
      {children}
    </div>
  </header>
);

export default Header;
