import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Lock, Building2, ServerOff, WifiOff, ShieldAlert, X, Mail, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

/* ── Graduation Cap Logo ──────────────────────────── */
const GraduationLogo = () => (
  <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4"
    style={{ background: 'var(--accent)' }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M21.5034 4.14819L12.5034 9.14819C12.193 9.32074 11.807 9.32074 11.4966 9.14819L2.49658 4.14819C2.17937 3.97193 1.77665 4.16853 1.72758 4.53232L1.03784 9.64687C1.01258 9.83424 1.08272 10.0215 1.22271 10.1475L11.6669 19.5475C11.854 19.7159 12.146 19.7159 12.3331 19.5475L22.7773 10.1475C22.9173 10.0215 22.9874 9.83424 22.9622 9.64687L22.2724 4.53232C22.2234 4.16853 21.8206 3.97193 21.5034 4.14819Z"
        fill="var(--primary)"
      />
    </svg>
  </div>
);

/* ── Error rendering ──────────────────────────────── */
const renderErrorIcon = (type) => {
  const cls = 'h-5 w-5 shrink-0';
  switch (type) {
    case 'CREDENTIALS': return <AlertCircle className={`${cls} text-red-500`} />;
    case 'ACCOUNT_LOCKED': return <Lock className={`${cls} text-amber-500`} />;
    case 'TENANT_NOT_FOUND':
    case 'TENANT_INACTIVE': return <Building2 className={`${cls} text-orange-500`} />;
    case 'SERVER_ERROR': return <ServerOff className={`${cls} text-red-500`} />;
    case 'NETWORK_ERROR': return <WifiOff className={`${cls} text-rose-500`} />;
    case 'RATE_LIMIT': return <ShieldAlert className={`${cls} text-amber-500`} />;
    default: return <AlertCircle className={`${cls} text-red-500`} />;
  }
};

/* ── Testimonial Card ─────────────────────────────── */
const TestimonialCard = ({ testimonial, delay }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-2xl p-4 backdrop-blur-xl`}
    style={{ background: 'var(--card)', border: '1px solid var(--border)', opacity: 0.95 }}>
    <img src={testimonial.avatarSrc} className="h-10 w-10 rounded-xl object-cover" alt="" />
    <div className="text-sm leading-snug">
      <p className="font-medium" style={{ color: 'var(--foreground)' }}>{testimonial.name}</p>
      <p style={{ color: 'var(--muted-foreground)' }}>{testimonial.handle}</p>
      <p className="mt-1" style={{ color: 'var(--foreground)', opacity: 0.8 }}>{testimonial.text}</p>
    </div>
  </div>
);

/**
 * SignInPage — Figma-inspired soft pastel login.
 *
 * Centered card on pastel gradient with decorative elements,
 * graduation cap logo, green Sign In button, social login options.
 */
export const SignInPage = ({
  title,
  description = 'Sign in to continue learning',
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onResetPassword,
  error,
  errorMessage,
  onDismissError,
  isSubmitting = false,
  showTenantSlug = false,
  tenantSlugHint = 'Select the tenant workspace you want to access.',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const errorDetails = error && typeof error === 'object'
    ? { title: error.title || 'Sign In Failed', message: error.message || errorMessage || 'An error occurred.', type: error.type || 'UNKNOWN' }
    : (typeof error === 'string' && error) || errorMessage
      ? { title: 'Sign In Failed', message: typeof error === 'string' ? error : errorMessage, type: 'UNKNOWN' }
      : null;

  return (
    <div className="flex min-h-[100dvh] w-full" style={{ background: 'var(--background)' }}>
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute w-36 h-36 rounded-full" style={{ top: '6%', left: '4%', background: 'var(--primary)', opacity: 0.12 }} />
        <div className="absolute w-24 h-24 rounded-full" style={{ top: '12%', right: '8%', background: '#fde68a', opacity: 0.18 }} />
        <div className="absolute w-20 h-20 rounded-full" style={{ bottom: '15%', left: '6%', background: '#f8bbd0', opacity: 0.18 }} />
        <div className="absolute w-28 h-28 rounded-full" style={{ bottom: '8%', right: '12%', background: '#bbdefb', opacity: 0.15 }} />
        <div className="absolute w-14 h-14 rounded-full" style={{ top: '45%', left: '18%', background: '#fde68a', opacity: 0.2 }} />
        <div className="absolute w-12 h-12 rounded-full" style={{ top: '25%', right: '22%', background: 'var(--primary)', opacity: 0.15 }} />
        {/* Leaf decorations */}
        <svg className="absolute" style={{ top: '4%', right: '6%', width: 140, height: 140, opacity: 0.1 }} viewBox="0 0 100 100">
          <ellipse cx="50" cy="50" rx="20" ry="45" fill="#86efac" transform="rotate(-30 50 50)" />
          <ellipse cx="65" cy="35" rx="15" ry="35" fill="#a7f3d0" transform="rotate(15 65 35)" />
        </svg>
        <svg className="absolute" style={{ bottom: '6%', left: '4%', width: 100, height: 100, opacity: 0.1 }} viewBox="0 0 100 100">
          <ellipse cx="50" cy="50" rx="18" ry="40" fill="#86efac" transform="rotate(20 50 50)" />
        </svg>
      </div>

      {/* Left hero panel (desktop only) */}
      {heroImageSrc && (
        <section className="relative hidden flex-1 md:flex items-center justify-center p-8">
          <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
            {/* Brand */}
            <div className="animate-element animate-delay-100 flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--primary)', color: '#fff' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21.5034 4.14819L12.5034 9.14819C12.193 9.32074 11.807 9.32074 11.4966 9.14819L2.49658 4.14819C2.17937 3.97193 1.77665 4.16853 1.72758 4.53232L1.03784 9.64687C1.01258 9.83424 1.08272 10.0215 1.22271 10.1475L11.6669 19.5475C11.854 19.7159 12.146 19.7159 12.3331 19.5475L22.7773 10.1475C22.9173 10.0215 22.9874 9.83424 22.9622 9.64687L22.2724 4.53232C22.2234 4.16853 21.8206 3.97193 21.5034 4.14819Z" fill="currentColor" />
                </svg>
              </div>
              <span className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>LMS</span>
            </div>

            <h2 className="animate-element animate-delay-200 text-3xl font-bold leading-tight mb-3"
              style={{ color: 'var(--foreground)' }}>
              Empower Learning,<br />Drive Growth
            </h2>
            <p className="animate-element animate-delay-300 text-base mb-10"
              style={{ color: 'var(--muted-foreground)' }}>
              A modern learning management platform built for teams that value knowledge.
            </p>

            {/* Testimonials */}
            {testimonials.length > 0 && (
              <div className="flex flex-col gap-4 w-full max-w-sm">
                {testimonials.map((t, i) => (
                  <TestimonialCard key={i} testimonial={t} delay={`animate-delay-${800 + i * 200}`} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Right login form */}
      <section className="relative z-10 flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[420px] rounded-2xl p-8"
          style={{
            background: 'var(--card)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)',
            border: '1px solid var(--border)',
          }}>
          <GraduationLogo />
          <h1 className="text-center text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
            Welcome back
          </h1>
          <p className="text-center text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
            {description}
          </p>

          <form className="space-y-4" onSubmit={onSignIn} noValidate>
            {/* Error Alert */}
            {errorDetails && (
              <div role="alert" aria-live="polite"
                className="flex items-start gap-3 rounded-xl p-3 text-left"
                style={{ background: 'var(--color-red-50)', border: '1px solid var(--color-red-100)' }}>
                <div className="mt-0.5">{renderErrorIcon(errorDetails.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-700">{errorDetails.title}</p>
                  <p className="text-xs text-red-600 mt-0.5">{errorDetails.message}</p>
                </div>
                {onDismissError && (
                  <button type="button" onClick={onDismissError}
                    className="p-1 rounded-lg text-red-500 hover:bg-red-100 transition-colors" aria-label="Dismiss error">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                <Input
                  id="email" name="email" type="email" autoComplete="email" required
                  placeholder="Enter your email address"
                  onChange={() => onDismissError?.()}
                  className="pl-10 h-11 rounded-xl"
                  style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                <Input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password" required
                  placeholder="Enter your password"
                  onChange={() => onDismissError?.()}
                  className="pl-10 pr-10 h-11 rounded-xl"
                  style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)' }}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Tenant slug (conditional) */}
            {showTenantSlug && (
              <div className="space-y-1.5">
                <Label htmlFor="tenantSlug">Tenant slug <span className="font-normal text-xs">(optional)</span></Label>
                <Input id="tenantSlug" name="tenantSlug" type="text" autoComplete="organization"
                  placeholder="e.g. acme-learning" className="h-11 rounded-xl" />
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{tenantSlugHint}</p>
              </div>
            )}

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox name="rememberMe" id="rememberMe" />
                <span className="text-sm" style={{ color: 'var(--foreground)' }}>Remember me</span>
              </label>
              <button type="button" onClick={onResetPassword}
                aria-label="Reset password"
                className="text-sm font-medium transition-colors hover:underline"
                style={{ background: 'none', border: 'none', color: 'var(--primary)' }}>
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <Button type="submit" disabled={isSubmitting}
              className="w-full h-12 rounded-xl text-base font-semibold"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>or continue with</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button className="w-full h-11 rounded-xl flex items-center justify-center gap-3 text-sm font-medium transition-colors hover:opacity-80"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} type="button">
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.97 10.97 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button className="w-full h-11 rounded-xl flex items-center justify-center gap-3 text-sm font-medium transition-colors hover:opacity-80"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} type="button">
              <svg className="h-5 w-5" viewBox="0 0 23 23"><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>
              Microsoft
            </button>
          </div>

          <p className="text-center text-xs mt-5" style={{ color: 'var(--muted-foreground)' }}>
            Don't have an account? <button type="button" className="font-medium hover:underline"
              style={{ background: 'none', border: 'none', color: 'var(--primary)' }}>Contact Admin</button>
          </p>
        </div>
      </section>
    </div>
  );
};

export default SignInPage;
