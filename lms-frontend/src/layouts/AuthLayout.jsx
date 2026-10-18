import { Outlet, useLocation } from 'react-router-dom';
import appConfig from '../config/appConfig';
import { ROUTES } from '../constants/routes';
import ThemeSlider from '../components/common/ThemeSlider';
import { GradusMindLogo } from '@/components/brand/GradusMindLogo';

/**
 * AuthLayout — Figma-inspired soft pastel background with decorative elements.
 *
 * - Login and AcceptInvitation render full-screen (custom layouts)
 * - Other auth pages (forgot password, reset) get the centered card
 * - Soft mint/green background with floating pastel circles
 */
export const AuthLayout = () => {
  const location = useLocation();
  const isFullScreen =
    location.pathname === ROUTES.LOGIN || location.pathname.startsWith('/auth/accept-invitation');

  return (
    <div
      className="relative min-h-screen"
      style={{
        background: isFullScreen ? '#0b0c0d' : 'var(--background, #0b0c0d)',
      }}
    >
      {/* Decorative floating circles (only on standard non-fullscreen auth cards) */}
      {!isFullScreen && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            className="absolute w-32 h-32 rounded-full opacity-30"
            style={{ top: '8%', left: '5%', background: '#f6e27a' }}
          />
          <div
            className="absolute w-20 h-20 rounded-full opacity-25"
            style={{ top: '15%', right: '10%', background: '#fde68a' }}
          />
          <div
            className="absolute w-16 h-16 rounded-full opacity-20"
            style={{ bottom: '20%', left: '8%', background: '#f8bbd0' }}
          />
          <div
            className="absolute w-24 h-24 rounded-full opacity-20"
            style={{ bottom: '10%', right: '15%', background: '#bbdefb' }}
          />
          <div
            className="absolute w-12 h-12 rounded-full opacity-25"
            style={{ top: '50%', left: '20%', background: '#fde68a' }}
          />
          <div
            className="absolute w-10 h-10 rounded-full opacity-30"
            style={{ top: '30%', right: '25%', background: '#f8bbd0' }}
          />
          {/* Decorative leaves/shapes */}
          <svg
            className="absolute opacity-15"
            style={{ top: '5%', right: '8%', width: 120, height: 120 }}
            viewBox="0 0 100 100"
          >
            <ellipse cx="50" cy="50" rx="20" ry="45" fill="#dfc04a" transform="rotate(-30 50 50)" />
            <ellipse cx="60" cy="40" rx="15" ry="35" fill="#c9973b" transform="rotate(15 60 40)" />
          </svg>
          <svg
            className="absolute opacity-15"
            style={{ bottom: '8%', left: '5%', width: 80, height: 80 }}
            viewBox="0 0 100 100"
          >
            <ellipse cx="50" cy="50" rx="18" ry="40" fill="#dfc04a" transform="rotate(20 50 50)" />
          </svg>
        </div>
      )}

      {/* Theme Switcher */}
      <div className="fixed top-5 right-6 z-50">
        <ThemeSlider size="md" />
      </div>

      {isFullScreen ? (
        <Outlet />
      ) : (
        <main className="relative z-10 min-h-screen grid place-items-center p-5">
          <div
            className="w-full max-w-[420px] rounded-2xl p-8"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--brand-tile-bg)', color: 'var(--brand-tile-fg)' }}
              >
                <GradusMindLogo size={26} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)', margin: 0 }}>
                {appConfig.name}
              </h2>
            </div>
            <Outlet />
          </div>
        </main>
      )}
    </div>
  );
};

export default AuthLayout;
