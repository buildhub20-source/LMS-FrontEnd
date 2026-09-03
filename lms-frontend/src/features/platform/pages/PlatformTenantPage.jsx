import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Building2, LoaderCircle, LogOut, PauseCircle, PlayCircle, Plus, RefreshCw, ServerCog, ShieldAlert } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';
import platformAuthStorage from '../services/platformAuthStorage';
import platformService from '../services/platformService';
import { isPlatformHostname } from '../../../utils/tenantHostname';

const emptyTenant = { name: '', slug: '', ownerName: '', ownerEmail: '', initialAdminPassword: '' };

const statusStyles = {
  ACTIVE: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  PROVISIONING: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  SUSPENDED: 'border-slate-600 bg-slate-800 text-slate-300',
  CLOUD_PAUSING: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
  CLOUD_PAUSED: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
  CLOUD_RESTORING: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  DELETION_SCHEDULED: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
  PROVISION_FAILED: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
};

const formatDate = (value) => (value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : 'Not provisioned');

export const PlatformTenantPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState(emptyTenant);
  const [actionError, setActionError] = useState('');
  const hasToken = Boolean(platformAuthStorage.getToken());
  const tenants = useQuery({ queryKey: ['platform-tenants'], queryFn: platformService.listTenants, enabled: hasToken });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['platform-tenants'] });
  const create = useMutation({
    mutationFn: platformService.createTenant,
    onSuccess: () => { setValues(emptyTenant); setFormOpen(false); setActionError(''); refresh(); },
    onError: (error) => setActionError(error?.response?.data?.message ?? 'Tenant registration failed.'),
  });
  const lifecycle = useMutation({
    mutationFn: ({ action, id }) => platformService[action](id),
    onSuccess: () => { setActionError(''); refresh(); },
    onError: (error) => setActionError(error?.response?.data?.message ?? 'Tenant lifecycle action failed.'),
  });

  if (!hasToken || !isPlatformHostname()) return <Navigate to={ROUTES.LOGIN} replace />;

  const submit = (event) => {
    event.preventDefault();
    create.mutate({ ...values, slug: values.slug.trim().toLowerCase() });
  };
  const signOut = () => { platformAuthStorage.clear(); navigate(ROUTES.PLATFORM_LOGIN, { replace: true }); };
  const runAction = (action, id) => lifecycle.mutate({ action, id });

  return (
    <main className="min-h-[100dvh] bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/90 px-4 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-white"><Building2 className="h-5 w-5" aria-hidden="true" /></div>
            <div><p className="text-sm font-bold text-white">LMS Platform</p><p className="text-xs text-slate-400">Tenant control plane</p></div>
          </div>
          <button onClick={signOut} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"><LogOut className="h-4 w-4" aria-hidden="true" />Sign out</button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><h1 className="text-2xl font-bold tracking-tight text-white">Tenants</h1><p className="mt-1 text-sm text-slate-400">Create and manage isolated LMS environments.</p></div>
          <button onClick={() => setFormOpen((open) => !open)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400"><Plus className="h-4 w-4" aria-hidden="true" />Add tenant</button>
        </div>

        {actionError && <p role="alert" className="mt-6 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{actionError}</p>}

        {formOpen && <form onSubmit={submit} className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="mb-5 flex items-center gap-2"><ServerCog className="h-5 w-5 text-brand-300" aria-hidden="true" /><h2 className="font-semibold text-white">Register a tenant</h2></div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['name', 'Tenant name', 'text'], ['slug', 'Tenant slug', 'text'], ['ownerName', 'Initial admin name', 'text'], ['ownerEmail', 'Initial admin email', 'email'], ['initialAdminPassword', 'Initial admin password', 'password'],
            ].map(([field, label, type]) => <label key={field} className="block text-sm font-medium text-slate-300">{label}<input type={type} required minLength={field === 'initialAdminPassword' ? 12 : undefined} value={values[field]} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20" /></label>)}
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setFormOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800">Cancel</button><button type="submit" disabled={create.isPending} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{create.isPending && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}Register tenant</button></div>
        </form>}

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4"><h2 className="font-semibold text-white">Tenant environments</h2><button onClick={refresh} aria-label="Refresh tenants" className="rounded-lg p-2 text-slate-300 hover:bg-slate-800"><RefreshCw className={`h-4 w-4 ${tenants.isFetching ? 'animate-spin' : ''}`} aria-hidden="true" /></button></div>
          {tenants.isLoading ? <div className="flex items-center gap-2 px-5 py-10 text-sm text-slate-400"><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />Loading tenants</div> : tenants.isError ? <div className="px-5 py-10 text-sm text-rose-200">Unable to load tenants. Refresh and sign in again if the session has expired.</div> : tenants.data?.length === 0 ? <div className="px-5 py-10 text-sm text-slate-400">No tenants registered yet. Register one before creating its database.</div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-950/50 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3 font-medium">Tenant</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Created</th><th className="px-5 py-3 font-medium">Actions</th></tr></thead><tbody className="divide-y divide-slate-800">{tenants.data.map((tenant) => <tr key={tenant.id} className="align-top"><td className="px-5 py-4"><p className="font-semibold text-slate-100">{tenant.name}</p><p className="mt-1 font-mono text-xs text-slate-400">{tenant.slug}</p><p className="mt-1 text-xs text-slate-500">{tenant.ownerEmail}</p>{tenant.failureReason && <p className="mt-2 max-w-sm text-xs text-rose-200">{tenant.failureReason}</p>}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[tenant.status] ?? 'border-slate-700 bg-slate-800 text-slate-300'}`}>{tenant.status.replaceAll('_', ' ')}</span></td><td className="px-5 py-4 text-slate-400">{formatDate(tenant.provisionedAt ?? tenant.createdAt)}</td><td className="px-5 py-4"><div className="flex flex-wrap gap-2">{(tenant.status === 'PROVISIONING' || tenant.status === 'PROVISION_FAILED') && <button onClick={() => runAction('provisionTenant', tenant.id)} disabled={lifecycle.isPending} className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">Provision</button>}{tenant.status === 'ACTIVE' && <><button onClick={() => runAction('suspendTenant', tenant.id)} disabled={lifecycle.isPending} className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-60">Suspend</button><button onClick={() => { if (window.confirm(`Pause ${tenant.name}'s cloud database? LMS access will stop, but all tenant data is retained.`)) runAction('pauseCloudProject', tenant.id); }} disabled={lifecycle.isPending} className="inline-flex items-center gap-1 rounded-md border border-sky-500/40 px-3 py-1.5 text-xs font-semibold text-sky-200 hover:bg-sky-500/10 disabled:opacity-60"><PauseCircle className="h-3.5 w-3.5" aria-hidden="true" />Pause cloud DB</button></>}{tenant.status === 'CLOUD_PAUSED' && <button onClick={() => runAction('restoreCloudProject', tenant.id)} disabled={lifecycle.isPending} className="inline-flex items-center gap-1 rounded-md bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"><PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />Resume cloud DB</button>}{tenant.status === 'CLOUD_RESTORING' && <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-amber-200"><LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />Restoring database</span>}{!['DELETION_SCHEDULED', 'DELETED'].includes(tenant.status) && <button onClick={() => { if (window.confirm(`Schedule ${tenant.name} for deletion? This is recoverable for 30 days.`)) runAction('scheduleDeletion', tenant.id); }} disabled={lifecycle.isPending} className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/10 disabled:opacity-60"><ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />Schedule deletion</button>}</div></td></tr>)}</tbody></table></div>}
        </div>
      </section>
    </main>
  );
};

export default PlatformTenantPage;
