import { Outlet, useLocation } from 'react-router-dom';
import appConfig from '../config/appConfig';
import { ROUTES } from '../constants/routes';
import ThemeSlider from '../components/common/ThemeSlider';

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
    location.pathname === ROUTES.LOGIN ||
    location.pathname.startsWith('/auth/accept-invitation');

  return (
    <div
      className="relative min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #f5f7fa 40%, #fef3f2 100%)',
      }}
    >
      {/* Decorative floating circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute w-32 h-32 rounded-full opacity-30" style={{ top: '8%', left: '5%', background: '#bbf7d0' }} />
        <div className="absolute w-20 h-20 rounded-full opacity-25" style={{ top: '15%', right: '10%', background: '#fde68a' }} />
        <div className="absolute w-16 h-16 rounded-full opacity-20" style={{ bottom: '20%', left: '8%', background: '#f8bbd0' }} />
        <div className="absolute w-24 h-24 rounded-full opacity-20" style={{ bottom: '10%', right: '15%', background: '#bbdefb' }} />
        <div className="absolute w-12 h-12 rounded-full opacity-25" style={{ top: '50%', left: '20%', background: '#fde68a' }} />
        <div className="absolute w-10 h-10 rounded-full opacity-30" style={{ top: '30%', right: '25%', background: '#f8bbd0' }} />
        {/* Decorative leaves/shapes */}
        <svg className="absolute opacity-15" style={{ top: '5%', right: '8%', width: 120, height: 120 }} viewBox="0 0 100 100">
          <ellipse cx="50" cy="50" rx="20" ry="45" fill="#86efac" transform="rotate(-30 50 50)" />
          <ellipse cx="60" cy="40" rx="15" ry="35" fill="#a7f3d0" transform="rotate(15 60 40)" />
        </svg>
        <svg className="absolute opacity-15" style={{ bottom: '8%', left: '5%', width: 80, height: 80 }} viewBox="0 0 100 100">
          <ellipse cx="50" cy="50" rx="18" ry="40" fill="#86efac" transform="rotate(20 50 50)" />
        </svg>
      </div>

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
              {/* Graduation cap icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21.5034 4.14819L12.5034 9.14819C12.193 9.32074 11.807 9.32074 11.4966 9.14819L2.49658 4.14819C2.17937 3.97193 1.77665 4.16853 1.72758 4.53232L1.03784 9.64687C1.01258 9.83424 1.08272 10.0215 1.22271 10.1475L11.6669 19.5475C11.854 19.7159 12.146 19.7159 12.3331 19.5475L22.7773 10.1475C22.9173 10.0215 22.9874 9.83424 22.9622 9.64687L22.2724 4.53232C22.2234 4.16853 21.8206 3.97193 21.5034 4.14819Z"
                    fill="var(--primary)"
                  />
                </svg>
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
