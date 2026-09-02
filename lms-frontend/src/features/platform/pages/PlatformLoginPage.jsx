import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { KeyRound, LoaderCircle, ShieldCheck } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';
import platformAuthStorage from '../services/platformAuthStorage';
import platformService from '../services/platformService';

export const PlatformLoginPage = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (platformAuthStorage.getToken()) return <Navigate to={ROUTES.PLATFORM_TENANTS} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await platformService.login(values);
      platformAuthStorage.setToken(response.accessToken);
      navigate(ROUTES.PLATFORM_TENANTS, { replace: true });
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? 'Unable to sign in to the platform control plane.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-slate-950 px-4 py-10 text-slate-100 sm:grid sm:place-items-center">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500 text-white">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">LMS platform</p>
            <h1 className="text-xl font-bold tracking-tight text-white">Global administrator</h1>
          </div>
        </div>

        <p className="mb-6 text-sm leading-6 text-slate-400">
          Sign in to manage tenant databases and their lifecycle.
        </p>

        {error && <p role="alert" className="mb-5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>}

        <form className="space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium text-slate-200">
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none placeholder:text-slate-600 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
            />
          </label>
          <label className="block text-sm font-medium text-slate-200">
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={values.password}
              onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none placeholder:text-slate-600 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <KeyRound className="h-4 w-4" aria-hidden="true" />}
            {submitting ? 'Signing in' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default PlatformLoginPage;
