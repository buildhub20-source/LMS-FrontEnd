import { useState, useMemo } from 'react';
import { Menu, Bell, Mail, Bookmark, Search, LogOut, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ThemeSlider from '../../common/ThemeSlider';
import notificationService from '../../../features/notifications/services/notificationService';
import { useNotificationSocket } from '../../../features/notifications/hooks/useNotificationSocket';
import NotificationDropdown from '../../../features/notifications/components/NotificationDropdown';
import { QUERY_KEYS } from '../../../constants/appConstants';
import { ROUTES } from '../../../constants/routes';
import useAuth from '../../../features/auth/hooks/useAuth';

/**
 * Header — Figma-inspired top bar.
 *
 * Features: hamburger (mobile), top tab nav slot, right-side action icons
 * (mail, notification bell, bookmarks, theme toggle, user avatar).
 */
export const Header = ({ onToggleSidebar, children, tabNav }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { unreadCount: socketUnreadCount } = useNotificationSocket();

  const { data: notificationsData } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS,
    queryFn: () => notificationService.list().catch(() => ({ items: [] })),
    staleTime: 60000,
  });

  const notifications = useMemo(() => {
    return (
      notificationsData?.items ||
      notificationsData?.data?.items ||
      (Array.isArray(notificationsData) ? notificationsData : [])
    );
  }, [notificationsData]);

  const queryUnreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead && !n.read && !n.readAt).length;
  }, [notifications]);

  const unreadCount = socketUnreadCount > 0 ? socketUnreadCount : queryUnreadCount;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header
      className="flex items-center gap-3 h-14 px-4 flex-shrink-0 sticky top-0 z-20 border-b"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
        className="p-1.5 rounded-lg lg:hidden hover:opacity-70 transition-opacity"
        style={{ background: 'transparent', border: 'none', color: 'var(--muted-foreground)' }}
      >
        <Menu size={20} />
      </button>

      {/* Tab Navigation (centered) */}
      <div className="flex-1 flex justify-center">
        {tabNav}
      </div>

      {/* Right-side actions */}
      <div className="flex items-center gap-2">
        {/* Mail icon */}
        <Link
          to={ROUTES.CHAT}
          className="p-2 rounded-lg transition-colors duration-150 hover:opacity-70"
          style={{ color: 'var(--muted-foreground)' }}
          title="Messages"
        >
          <Mail size={18} />
        </Link>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            className={cn(
              'p-2 rounded-lg transition-colors duration-150',
              isDropdownOpen ? 'opacity-100' : 'hover:opacity-70',
            )}
            style={{
              background: isDropdownOpen ? 'var(--accent)' : 'transparent',
              border: 'none',
              color: 'var(--muted-foreground)',
            }}
            title="Notifications"
            aria-label="Toggle notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1"
                style={{
                  background: 'var(--destructive)',
                  color: '#fff',
                  border: '2px solid var(--card)',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            notifications={notifications}
            unreadCount={unreadCount}
          />
        </div>

        {/* Bookmark icon */}
        <Link
          to={ROUTES.NOTES_BOOKMARKS || '#'}
          className="p-2 rounded-lg transition-colors duration-150 hover:opacity-70"
          style={{ color: 'var(--muted-foreground)' }}
          title="Bookmarks"
        >
          <Bookmark size={18} />
        </Link>

        {/* Theme toggle */}
        <ThemeSlider size="md" />

        {/* User Avatar with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="ml-1 rounded-full p-0.5 transition-opacity hover:opacity-80 focus:outline-none cursor-pointer"
              title="User Account"
            >
              <Avatar className="h-8 w-8 border-2" style={{ borderColor: 'var(--border)' }}>
                {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user?.fullName} />}
                <AvatarFallback className="text-xs font-semibold"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                  {getInitials(user?.fullName || user?.email)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-lg">
            <div className="px-2.5 py-2">
              <p className="text-xs font-semibold truncate leading-tight" style={{ color: 'var(--foreground)' }}>
                {user?.fullName || user?.name || 'User'}
              </p>
              <p className="text-[11px] truncate opacity-60 leading-tight">
                {user?.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={ROUTES.PROFILE} className="cursor-pointer flex items-center gap-2 text-xs">
                <User size={14} />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={ROUTES.NOTES_BOOKMARKS || '#'} className="cursor-pointer flex items-center gap-2 text-xs">
                <Bookmark size={14} />
                <span>Saved & Notes</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                document.title = 'LMS';
                await logout();
                navigate(ROUTES.LOGIN, { replace: true, state: {} });
              }}
              className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10 flex items-center gap-2 text-xs"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
