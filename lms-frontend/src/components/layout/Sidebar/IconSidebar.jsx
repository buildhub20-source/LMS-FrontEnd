import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { cn } from '@/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useAuth from '@/features/auth/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

/* ─── Monochrome Logo ──────────────────────────────────────── */
const Logo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21.5034 4.14819L12.5034 9.14819C12.193 9.32074 11.807 9.32074 11.4966 9.14819L2.49658 4.14819C2.17937 3.97193 1.77665 4.16853 1.72758 4.53232L1.03784 9.64687C1.01258 9.83424 1.08272 10.0215 1.22271 10.1475L11.6669 19.5475C11.854 19.7159 12.146 19.7159 12.3331 19.5475L22.7773 10.1475C22.9173 10.0215 22.9874 9.83424 22.9622 9.64687L22.2724 4.53232C22.2234 4.16853 21.8206 3.97193 21.5034 4.14819Z"
      fill="currentColor"
    />
  </svg>
);

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Slim Icon Sidebar — Figma-inspired macaron design.
 *
 * - Collapsed: 56px icon-only with tooltips & logout icon
 * - Expanded: 260px with labels, group headings & logout action
 * - Dark rounded icon buttons on both states
 */
export const IconSidebar = ({
  items = [],
  footer = null,
  onLogout = null,
  user = null,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  const currentUser = user || auth.user;

  const handleSignOutAction = async () => {
    if (onLogout) {
      await onLogout();
    } else {
      await auth.logout();
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };

  // Group items by their group property
  const grouped = items.reduce((acc, item) => {
    const group = item.group || '_ungrouped';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  const groupOrder = Object.keys(grouped);

  return (
    <TooltipProvider delayDuration={100}>
      {/* Mobile overlay */}
      {expanded && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setExpanded(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col',
          'transition-all duration-300 ease-in-out',
          'lg:static lg:inset-auto',
          expanded ? 'w-[260px]' : 'w-[56px]',
          className,
        )}
        style={{
          background: 'var(--sidebar)',
          color: 'var(--sidebar-foreground)',
        }}
      >
        {/* Logo / Brand */}
        <div className={cn(
          'flex items-center h-16 flex-shrink-0 border-b',
          expanded ? 'px-4 gap-3' : 'justify-center',
        )} style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)' }}>
            <Logo size={22} />
          </div>
          {expanded && (
            <span className="text-lg font-bold tracking-tight whitespace-nowrap"
              style={{ color: 'var(--sidebar-foreground)' }}>
              LMS
            </span>
          )}
        </div>

        {/* Expand/Collapse Toggle — dedicated row right below logo */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'flex items-center flex-shrink-0 border-b h-9',
            'transition-colors duration-200 hover:opacity-80 cursor-pointer',
            expanded ? 'justify-end px-3' : 'justify-center',
          )}
          style={{
            borderColor: 'var(--sidebar-border)',
            color: 'var(--sidebar-foreground)',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid var(--sidebar-border)',
          }}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg"
            style={{ background: 'var(--sidebar-accent)' }}>
            {expanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </span>
        </button>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav aria-label="Main navigation">
            {groupOrder.map((group) => (
              <div key={group} className="mb-1">
                {/* Group heading (only in expanded mode) */}
                {expanded && group !== '_ungrouped' && (
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider opacity-50">
                    {group}
                  </p>
                )}

                {/* Separator in collapsed mode */}
                {!expanded && group !== '_ungrouped' && group !== groupOrder[0] && (
                  <div className="mx-2 my-2 border-t" style={{ borderColor: 'var(--sidebar-border)' }} />
                )}

                {grouped[group].map((item) => {
                  const isActive = item.to && (
                    location.pathname === item.to ||
                    location.pathname.startsWith(item.to + '/')
                  );

                  const linkContent = (
                    <NavLink
                      to={item.to || '#'}
                      className={cn(
                        'flex items-center gap-3 rounded-xl transition-all duration-200',
                        expanded ? 'mx-2 px-3 py-2.5' : 'mx-auto w-10 h-10 justify-center',
                        isActive
                          ? 'text-white'
                          : 'hover:opacity-80',
                      )}
                      style={{
                        background: isActive ? 'var(--sidebar-primary)' : 'transparent',
                        color: isActive ? 'var(--sidebar-primary-foreground)' : 'var(--sidebar-foreground)',
                      }}
                    >
                      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                        {item.icon}
                      </span>
                      {expanded && (
                        <span className="text-sm font-medium truncate">
                          {item.label}
                        </span>
                      )}
                    </NavLink>
                  );

                  // In collapsed mode, wrap with tooltip
                  if (!expanded) {
                    return (
                      <Tooltip key={item.label}>
                        <TooltipTrigger asChild>
                          {linkContent}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <div key={item.label}>{linkContent}</div>;
                })}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Custom Footer slot */}
        {footer && expanded && (
          <div className="p-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
            {footer}
          </div>
        )}

        {/* User profile & Logout action */}
        <div
          className={cn(
            'border-t transition-all duration-200',
            expanded ? 'p-3' : 'py-2 px-1 flex flex-col items-center'
          )}
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          {expanded ? (
            <div className="flex flex-col gap-2">
              {currentUser && (
                <div
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--sidebar-border)',
                  }}
                >
                  <Avatar className="h-8 w-8 rounded-lg border flex-shrink-0" style={{ borderColor: 'var(--sidebar-border)' }}>
                    {currentUser.avatarUrl && (
                      <AvatarImage src={currentUser.avatarUrl} alt={currentUser.fullName || currentUser.email} />
                    )}
                    <AvatarFallback
                      className="text-xs font-semibold rounded-lg"
                      style={{ background: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)' }}
                    >
                      {getInitials(currentUser.fullName || currentUser.name || currentUser.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate leading-tight" style={{ color: 'var(--sidebar-foreground)' }}>
                      {currentUser.fullName || currentUser.name || 'User'}
                    </p>
                    <p className="text-[11px] truncate opacity-60 leading-tight">
                      {currentUser.email || (Array.isArray(currentUser.roles) ? currentUser.roles[0] : 'Member')}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleSignOutAction}
                className={cn(
                  'flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-medium',
                  'transition-all duration-200 cursor-pointer',
                  'hover:text-red-400 hover:bg-red-500/10'
                )}
                style={{
                  color: 'var(--sidebar-foreground)',
                  opacity: 0.85,
                  border: 'none',
                  background: 'transparent',
                }}
              >
                <LogOut size={16} className="flex-shrink-0 text-red-400" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleSignOutAction}
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-xl',
                    'transition-all duration-200 cursor-pointer',
                    'hover:text-red-400 hover:bg-red-500/10'
                  )}
                  style={{
                    color: 'var(--sidebar-foreground)',
                    opacity: 0.85,
                    border: 'none',
                    background: 'transparent',
                  }}
                  aria-label="Sign Out"
                >
                  <LogOut size={18} className="text-red-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium text-red-400">
                Sign Out
              </TooltipContent>
            </Tooltip>
          )}
        </div>


      </aside>
    </TooltipProvider>
  );
};

export default IconSidebar;
