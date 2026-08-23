import { useCallback, useEffect, useState } from 'react';
import {
  Search,
  MailPlus,
  Send,
  Trash2,
  Plus,
  MoreVertical,
  Mail,
  User,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import AdminButton from '../../../components/ui/AdminButton';
import AdminBadge from '../../../components/ui/AdminBadge';
import AdminInput from '../../../components/ui/AdminInput';
import { AdminModal, AdminConfirmModal } from '../../../components/ui/AdminModal';
import AdminPagination, {
  AdminEmptyState,
  AdminErrorState,
} from '../../../components/ui/AdminPagination';
import { AdminTableSkeleton } from '../../../components/ui/AdminSkeleton';
import PermissionGuard from '../../../guards/PermissionGuard';
import { PERMISSIONS } from '../../../constants/permissions';
import invitationService from '../services/invitationService';
import roleService from '../../roles/services/roleService';
import { useToast } from '../../../components/feedback/Toast';

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function isExpired(inv) {
  return inv?.expiresAt && new Date(inv.expiresAt) < new Date();
}

function StatusBadge({ status }) {
  if (status === 'PENDING')  return <AdminBadge variant="warning" dot>Pending</AdminBadge>;
  if (status === 'ACCEPTED') return <AdminBadge variant="success" dot>Accepted</AdminBadge>;
  if (status === 'EXPIRED')  return <AdminBadge variant="neutral" dot>Expired</AdminBadge>;
  return <AdminBadge variant="neutral">{status}</AdminBadge>;
}

const STATUS_FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'EXPIRED'];

export const InvitationListPage = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  // List state
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [openMenuId, setOpenMenuId] = useState(null);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createRoleName, setCreateRoleName] = useState(''); // Role NAME (not ID) — backend expects role name string
  const [allRoles, setAllRoles] = useState([]);
  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Confirm actions
  const [resendTarget, setResendTarget] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  /* ─── data fetching ─── */

  const loadInvitations = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      // Backend does not support status/search query params — pass page/size only,
      // then filter client-side.
      const res = await invitationService.list({ page, size: pageSize, search });
      let content = Array.isArray(res?.content) ? res.content
        : Array.isArray(res?.items) ? res.items
        : Array.isArray(res) ? res : [];

      // Client-side search filter
      if (search) {
        const q = search.toLowerCase();
        content = content.filter(
          (i) => i.name?.toLowerCase().includes(q) || i.email?.toLowerCase().includes(q),
        );
      }
      // Client-side status filter
      if (statusFilter !== 'ALL') {
        content = content.filter((i) => i.status === statusFilter);
      }

      setInvitations(content);
      setTotalPages(res?.totalPages ?? (content.length > 0 ? 1 : 0));
      setTotalElements(res?.totalElements ?? content.length);
    } catch (err) {
      setLoadError(err?.message ?? 'Failed to load invitations.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => { loadInvitations(); }, [loadInvitations]);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [openMenuId]);

  const handleSearch = () => { setPage(0); setSearch(searchInput); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };
  const handleStatusFilter = (s) => { setPage(0); setStatusFilter(s); };

  /* ─── create invitation ─── */

  const openCreate = async () => {
    setCreateOpen(true);
    setCreateName('');
    setCreateEmail('');
    setCreateRoleName('');
    setCreateError('');
    try {
      const roles = await roleService.list();
      const roleList = Array.isArray(roles?.items) ? roles.items
        : Array.isArray(roles?.content) ? roles.content
        : Array.isArray(roles) ? roles : [];
      setAllRoles(roleList);
    } catch (err) {
      toastError(err?.message ?? 'Failed to load roles.');
    }
  };

  const selectedRole = allRoles.find((r) => r.name === createRoleName);

  const handleCreate = async () => {
    setCreateError('');
    if (!createName.trim()) { setCreateError('Please enter the recipient\'s name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createEmail)) { setCreateError('Please enter a valid email address.'); return; }
    if (!createRoleName) { setCreateError('Please select a role for the invitation.'); return; }

    setCreating(true);
    try {
      // Backend CreateInvitationRequest expects { name, email, role } where role is the ROLE NAME string
      await invitationService.invite({
        name: createName.trim(),
        email: createEmail.trim(),
        role: createRoleName,
      });
      toastSuccess(`Invitation sent to ${createEmail}. They will receive an email with a temporary password.`);
      setCreateOpen(false);
      loadInvitations();
    } catch (err) {
      setCreateError(err?.message ?? 'Failed to send invitation.');
    } finally {
      setCreating(false);
    }
  };

  /* ─── resend / revoke ─── */

  const handleResend = async () => {
    if (!resendTarget) return;
    setActionLoading(true);
    try {
      await invitationService.resend(resendTarget.id);
      toastSuccess(`Invitation resent to ${resendTarget.email}.`);
      setResendTarget(null);
      loadInvitations();
    } catch (err) {
      toastError(err?.message ?? 'Failed to resend invitation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setActionLoading(true);
    try {
      await invitationService.revoke(revokeTarget.id);
      toastSuccess(`Invitation for ${revokeTarget.email} has been revoked.`);
      setRevokeTarget(null);
      loadInvitations();
    } catch (err) {
      toastError(err?.message ?? 'Failed to revoke invitation.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invitations</h1>
          <p className="mt-1 text-slate-500">Send and manage user invitations to the platform.</p>
        </div>
        <PermissionGuard required={[PERMISSIONS.INVITATION_WRITE]} fallback={null}>
          <AdminButton icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            New Invitation
          </AdminButton>
        </PermissionGuard>
      </div>

      {/* Filters */}
      <div className="card-base p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <AdminInput
              placeholder="Search by name or email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusFilter(s)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  statusFilter === s
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
            <AdminButton size="sm" onClick={handleSearch}>Search</AdminButton>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        {loading ? (
          <div className="p-6"><AdminTableSkeleton rows={5} cols={5} /></div>
        ) : loadError ? (
          <AdminErrorState message={loadError} onRetry={loadInvitations} />
        ) : invitations.length === 0 ? (
          <AdminEmptyState
            icon={<MailPlus className="h-7 w-7" />}
            title="No invitations found"
            message={
              search || statusFilter !== 'ALL'
                ? 'Try adjusting your search or filter.'
                : 'Send invitations to invite new users to the platform.'
            }
            action={
              <PermissionGuard required={[PERMISSIONS.INVITATION_WRITE]} fallback={null}>
                <AdminButton icon={<Plus className="h-4 w-4" />} onClick={openCreate}>New Invitation</AdminButton>
              </PermissionGuard>
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Recipient</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Expires</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Sent By</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 text-sm font-bold">
                            {getInitials(inv.name ?? '')}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{inv.name}</p>
                            <p className="text-xs text-slate-500">{inv.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
                      <td className="px-6 py-4">
                        <span className="rounded-md bg-brand-50 border border-brand-200 px-2 py-0.5 text-xs font-medium text-brand-700">
                          {inv.roleName ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {isExpired(inv)
                            ? <Clock className="h-3.5 w-3.5 text-slate-400" />
                            : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                          <span className="text-sm text-slate-500">{formatDate(inv.expiresAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{inv.invitedBy ?? '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <PermissionGuard required={[PERMISSIONS.INVITATION_WRITE]} fallback={<span className="text-xs text-slate-400">—</span>}>
                          <div className="relative inline-block">
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === inv.id ? null : inv.id); }}
                              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {openMenuId === inv.id && (
                              <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-slate-200 bg-white py-1.5 shadow-soft animate-scale-in">
                                {inv.status === 'PENDING' && (
                                  <button
                                    onClick={() => { setResendTarget(inv); setOpenMenuId(null); }}
                                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                  >
                                    <Send className="h-4 w-4" /> Resend
                                  </button>
                                )}
                                <button
                                  onClick={() => { setRevokeTarget(inv); setOpenMenuId(null); }}
                                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" /> Revoke
                                </button>
                              </div>
                            )}
                          </div>
                        </PermissionGuard>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {invitations.map((inv) => (
                <div key={inv.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 text-sm font-bold">
                      {getInitials(inv.name ?? '')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{inv.name}</p>
                      <p className="text-xs text-slate-500 truncate">{inv.email}</p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <StatusBadge status={inv.status} />
                        <span className="rounded-md bg-brand-50 border border-brand-200 px-2 py-0.5 text-xs font-medium text-brand-700">
                          {inv.roleName ?? '—'}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-400">Expires {formatDate(inv.expiresAt)}</p>
                    </div>
                  </div>
                  <PermissionGuard required={[PERMISSIONS.INVITATION_WRITE]} fallback={null}>
                    <div className="mt-3 flex gap-2">
                      {inv.status === 'PENDING' && (
                        <AdminButton size="sm" variant="outline" icon={<Send className="h-3.5 w-3.5" />} onClick={() => setResendTarget(inv)}>Resend</AdminButton>
                      )}
                      <AdminButton size="sm" variant="outline" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setRevokeTarget(inv)}>Revoke</AdminButton>
                    </div>
                  </PermissionGuard>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="border-t border-slate-100 px-6 py-4">
              <AdminPagination
                page={page}
                totalPages={totalPages}
                totalElements={totalElements}
                size={pageSize}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Create Invitation Modal ── */}
      {createOpen && (
        <AdminModal
          open
          onClose={() => setCreateOpen(false)}
          title="New Invitation"
          description="Invite a new user to join the platform"
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</AdminButton>
              <AdminButton onClick={handleCreate} loading={creating} icon={!creating ? <Send className="h-4 w-4" /> : undefined}>
                Send Invitation
              </AdminButton>
            </>
          }
        >
          {createError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">{createError}</p>
            </div>
          )}
          <div className="space-y-4">
            <AdminInput
              label="Full name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="e.g. Jane Smith"
              icon={<User className="h-4 w-4" />}
              autoFocus
            />
            <AdminInput
              label="Email address"
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              placeholder="jane@example.com"
              icon={<Mail className="h-4 w-4" />}
            />
            <div>
              <label className="label-base">Role</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRolesDropdownOpen(!rolesDropdownOpen)}
                  className={`input-base flex items-center justify-between text-left ${createRoleName ? '' : 'text-slate-400'}`}
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                    {selectedRole ? selectedRole.name : 'Select a role…'}
                  </span>
                  <svg className={`h-4 w-4 text-slate-400 transition-transform ${rolesDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {rolesDropdownOpen && (
                  <div className="absolute z-20 mt-1.5 w-full rounded-xl border border-slate-200 bg-white py-1.5 shadow-soft max-h-60 overflow-y-auto animate-scale-in">
                    {allRoles.map((role) => (
                      <button
                        key={role.id ?? role.name}
                        type="button"
                        onClick={() => { setCreateRoleName(role.name); setRolesDropdownOpen(false); }}
                        className={`flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 ${createRoleName === role.name ? 'bg-brand-50' : ''}`}
                      >
                        <ShieldCheck className={`h-4 w-4 mt-0.5 ${createRoleName === role.name ? 'text-brand-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{role.name}</p>
                          <p className="text-xs text-slate-500">{role.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </AdminModal>
      )}

      {/* ── Resend confirm ── */}
      {resendTarget && (
        <AdminConfirmModal
          open
          onClose={() => setResendTarget(null)}
          onConfirm={handleResend}
          title="Resend Invitation"
          message={`A new invitation email will be sent to ${resendTarget.email} with a fresh expiry.`}
          confirmLabel="Resend"
          variant="primary"
          loading={actionLoading}
        />
      )}

      {/* ── Revoke confirm ── */}
      {revokeTarget && (
        <AdminConfirmModal
          open
          onClose={() => setRevokeTarget(null)}
          onConfirm={handleRevoke}
          title="Revoke Invitation"
          message={`The invitation for ${revokeTarget.email} will be permanently revoked.`}
          confirmLabel="Revoke"
          variant="danger"
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default InvitationListPage;
