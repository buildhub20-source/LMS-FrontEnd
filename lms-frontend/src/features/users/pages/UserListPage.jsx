import { useCallback, useEffect, useState } from 'react';
import {
  Search,
  Users as UsersIcon,
  MoreVertical,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  History,
  ShieldCheck,
  Pencil,
  Mail,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { ROUTES } from '../../../constants/routes';
import userService from '../services/userService';
import roleService from '../../roles/services/roleService';
import { useToast } from '../../../components/feedback/Toast';

/* ─── helpers ─── */

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  'bg-brand-100 text-brand-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
];

function avatarColor(name = '') {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatDateTime(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ user }) {
  if (user?.locked) return <AdminBadge variant="danger" dot>Locked</AdminBadge>;
  if (!user?.active) return <AdminBadge variant="neutral" dot>Inactive</AdminBadge>;
  return <AdminBadge variant="success" dot>Active</AdminBadge>;
}

function MenuItem({ icon, label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'LOCKED', 'INACTIVE'];

/* ─── component ─── */

export const UserListPage = () => {
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  // List state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Action menu
  const [openMenuId, setOpenMenuId] = useState(null);

  // Confirm action modal
  const [confirmAction, setConfirmAction] = useState(null);
  // { user, type: 'activate'|'deactivate'|'lock'|'unlock', loading }

  // Status history modal
  const [statusHistory, setStatusHistory] = useState(null); // { user, history: [] }
  const [historyLoading, setHistoryLoading] = useState(false);

  // Edit user modal
  const [editUser, setEditUser] = useState(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Edit roles modal
  const [rolesUser, setRolesUser] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesSaving, setRolesSaving] = useState(false);

  /* ─── data fetching ─── */

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await userService.list({
        page,
        size: pageSize,
        search: search || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      // userService normalizes all responses to { content, totalPages, totalElements }
      const content = Array.isArray(res?.content) ? res.content
        : Array.isArray(res?.items) ? res.items
        : Array.isArray(res) ? res : [];
      setUsers(content);
      setTotalPages(res?.totalPages ?? (content.length > 0 ? 1 : 0));
      setTotalElements(res?.totalElements ?? content.length);
    } catch (err) {
      setLoadError(err?.message ?? 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);


  useEffect(() => { loadUsers(); }, [loadUsers]);

  // Close action menu on outside click
  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [openMenuId]);

  /* ─── search / filter ─── */

  const handleSearch = () => { setPage(0); setSearch(searchInput); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };
  const handleStatusFilter = (status) => { setPage(0); setStatusFilter(status); };

  /* ─── confirm actions ─── */

  const doConfirmAction = async () => {
    if (!confirmAction) return;
    setConfirmAction((a) => ({ ...a, loading: true }));
    const { user: u, type } = confirmAction;
    try {
      if (type === 'activate')   await userService.activate(u.id);
      if (type === 'deactivate') await userService.deactivate(u.id);
      if (type === 'lock')       await userService.lock(u.id);
      if (type === 'unlock')     await userService.unlock(u.id);
      toastSuccess(`${u.fullName} has been ${type}d.`);
      setConfirmAction(null);
      loadUsers();
    } catch (err) {
      toastError(err?.message ?? `Failed to ${type} user.`);
      setConfirmAction((a) => ({ ...a, loading: false }));
    }
  };

  /* ─── status history ─── */

  const openStatusHistory = async (u) => {
    setStatusHistory({ user: u, history: [] });
    setHistoryLoading(true);
    try {
      const history = await userService.getStatusHistory(u.id);
      setStatusHistory({ user: u, history: Array.isArray(history) ? history : [] });
    } catch (err) {
      toastError(err?.message ?? 'Failed to load status history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  /* ─── edit user ─── */

  const openEditUser = (u) => {
    setEditUser(u);
    setEditFirstName(u.name?.split(' ')[0] ?? u.firstName ?? '');
    setEditLastName(u.name?.split(' ').slice(1).join(' ') ?? u.lastName ?? '');
    setEditEmail(u.email ?? '');
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setEditSaving(true);
    try {
      // Backend UpdateUserRequest accepts: name, phone, profileImageUrl
      const name = [editFirstName, editLastName].filter(Boolean).join(' ').trim() || editFirstName;
      await userService.update(editUser.id, { name });
      toastSuccess(`${editUser.fullName}'s profile has been updated.`);
      setEditUser(null);
      loadUsers();
    } catch (err) {
      toastError(err?.message ?? 'Failed to update user.');
    } finally {
      setEditSaving(false);
    }
  };

  /* ─── edit roles ─── */

  const openEditRoles = async (u) => {
    setRolesUser(u);
    // roles is Set<String> from backend — no IDs, just names.
    // We'll match by role name when saving.
    setSelectedRoleIds([]); // will be set to IDs after roles are loaded
    setRolesLoading(true);
    try {
      const roles = await roleService.list();
      const roleList = Array.isArray(roles?.items) ? roles.items
        : Array.isArray(roles?.content) ? roles.content
        : Array.isArray(roles) ? roles : [];
      setAllRoles(roleList);
      // Pre-select roles by matching name to ID
      const userRoleNames = Array.isArray(u.roles) ? u.roles : [];
      const preSelected = roleList
        .filter((r) => userRoleNames.includes(r.name))
        .map((r) => r.id);
      setSelectedRoleIds(preSelected);
    } catch (err) {
      toastError(err?.message ?? 'Failed to load roles.');
    } finally {
      setRolesLoading(false);
    }
  };

  const toggleRole = (roleId) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSaveRoles = async () => {
    if (!rolesUser) return;
    setRolesSaving(true);
    try {
      await userService.updateRoles(rolesUser.id, selectedRoleIds);
      toastSuccess(`Roles updated for ${rolesUser.fullName}.`);
      setRolesUser(null);
      loadUsers();
    } catch (err) {
      toastError(err?.message ?? 'Failed to update roles.');
    } finally {
      setRolesSaving(false);
    }
  };

  const confirmLabels = { activate: 'Activate', deactivate: 'Deactivate', lock: 'Lock', unlock: 'Unlock' };
  const confirmMessages = {
    activate: 'This user will regain access to the platform immediately.',
    deactivate: 'This user will lose access to the platform but their data is preserved.',
    lock: 'This user will be locked out and cannot sign in.',
    unlock: 'This user will be able to sign in again.',
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users</h1>
          <p className="mt-1 text-slate-500">Manage user accounts, roles, and access status.</p>
        </div>
        <PermissionGuard required={[PERMISSIONS.USER_WRITE]} fallback={null}>
          <AdminButton
            icon={<Plus className="h-4 w-4" />}
            onClick={() => navigate(ROUTES.USER_CREATE)}
          >
            Add User
          </AdminButton>
        </PermissionGuard>
      </div>

      {/* Filters bar */}
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
            <AdminButton size="sm" onClick={handleSearch}>
              Search
            </AdminButton>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        {loading ? (
          <div className="p-6">
            <AdminTableSkeleton rows={6} cols={5} />
          </div>
        ) : loadError ? (
          <AdminErrorState message={loadError} onRetry={loadUsers} />
        ) : users.length === 0 ? (
          <AdminEmptyState
            icon={<UsersIcon className="h-7 w-7" />}
            title="No users found"
            message={
              search || statusFilter !== 'ALL'
                ? 'Try adjusting your search or filter criteria.'
                : 'Users will appear here once invitations are accepted.'
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">User</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Roles</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Joined</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shrink-0 ${avatarColor(u.fullName ?? '')}`}>
                            {getInitials(u.fullName ?? u.email ?? '?')}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{u.fullName}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge user={u} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(u.roles ?? []).length > 0 ? (
                            // roles is Set<String> from backend
                            (Array.isArray(u.roles) ? u.roles : [...(u.roles ?? [])]).map((roleName) => (
                              <span key={roleName} className="rounded-md bg-brand-50 border border-brand-200 px-2 py-0.5 text-xs font-medium text-brand-700">
                                {roleName}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">No roles</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDate(u.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === u.id ? null : u.id);
                            }}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openMenuId === u.id && (
                            <div className="absolute right-0 top-10 z-20 w-52 rounded-xl border border-slate-200 bg-white py-1.5 shadow-soft animate-scale-in">
                              <PermissionGuard required={[PERMISSIONS.USER_WRITE]} fallback={null}>
                                <>
                                  {u.locked ? (
                                    <MenuItem icon={<Unlock className="h-4 w-4" />} label="Unlock" onClick={() => { setConfirmAction({ user: u, type: 'unlock', loading: false }); setOpenMenuId(null); }} />
                                  ) : (
                                    <MenuItem icon={<Lock className="h-4 w-4" />} label="Lock" danger onClick={() => { setConfirmAction({ user: u, type: 'lock', loading: false }); setOpenMenuId(null); }} />
                                  )}
                                  {u.active ? (
                                    <MenuItem icon={<UserX className="h-4 w-4" />} label="Deactivate" danger onClick={() => { setConfirmAction({ user: u, type: 'deactivate', loading: false }); setOpenMenuId(null); }} />
                                  ) : (
                                    <MenuItem icon={<UserCheck className="h-4 w-4" />} label="Activate" onClick={() => { setConfirmAction({ user: u, type: 'activate', loading: false }); setOpenMenuId(null); }} />
                                  )}
                                  <div className="my-1 border-t border-slate-100" />
                                  <MenuItem icon={<ShieldCheck className="h-4 w-4" />} label="Edit Roles" onClick={() => { openEditRoles(u); setOpenMenuId(null); }} />
                                  <MenuItem icon={<Pencil className="h-4 w-4" />} label="Edit Profile" onClick={() => { openEditUser(u); setOpenMenuId(null); }} />
                                  <div className="my-1 border-t border-slate-100" />
                                </>
                              </PermissionGuard>
                              <MenuItem icon={<History className="h-4 w-4" />} label="Status History" onClick={() => { openStatusHistory(u); setOpenMenuId(null); }} />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {users.map((u) => (
                <div key={u.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shrink-0 ${avatarColor(u.fullName ?? '')}`}>
                      {getInitials(u.fullName ?? u.email ?? '?')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{u.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <StatusBadge user={u} />
                        {(Array.isArray(u.roles) ? u.roles : [...(u.roles ?? [])]).map((roleName) => (
                          <span key={roleName} className="rounded-md bg-brand-50 border border-brand-200 px-2 py-0.5 text-xs font-medium text-brand-700">
                            {roleName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <PermissionGuard required={[PERMISSIONS.USER_WRITE]} fallback={null}>
                      <>
                        {u.locked
                          ? <AdminButton size="sm" variant="outline" icon={<Unlock className="h-3.5 w-3.5" />} onClick={() => setConfirmAction({ user: u, type: 'unlock', loading: false })}>Unlock</AdminButton>
                          : <AdminButton size="sm" variant="outline" icon={<Lock className="h-3.5 w-3.5" />} onClick={() => setConfirmAction({ user: u, type: 'lock', loading: false })}>Lock</AdminButton>
                        }
                        {u.active
                          ? <AdminButton size="sm" variant="outline" icon={<UserX className="h-3.5 w-3.5" />} onClick={() => setConfirmAction({ user: u, type: 'deactivate', loading: false })}>Deactivate</AdminButton>
                          : <AdminButton size="sm" variant="outline" icon={<UserCheck className="h-3.5 w-3.5" />} onClick={() => setConfirmAction({ user: u, type: 'activate', loading: false })}>Activate</AdminButton>
                        }
                        <AdminButton size="sm" variant="outline" icon={<ShieldCheck className="h-3.5 w-3.5" />} onClick={() => openEditRoles(u)}>Roles</AdminButton>
                        <AdminButton size="sm" variant="outline" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => openEditUser(u)}>Edit</AdminButton>
                      </>
                    </PermissionGuard>
                    <AdminButton size="sm" variant="ghost" icon={<History className="h-3.5 w-3.5" />} onClick={() => openStatusHistory(u)}>History</AdminButton>
                  </div>
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

      {/* ── Confirm action modal ── */}
      {confirmAction && (
        <AdminConfirmModal
          open
          onClose={() => setConfirmAction(null)}
          onConfirm={doConfirmAction}
          title={`${confirmLabels[confirmAction.type] ?? ''} ${confirmAction.user?.fullName ?? ''}`}
          message={confirmMessages[confirmAction.type] ?? ''}
          confirmLabel={confirmLabels[confirmAction.type] ?? 'Confirm'}
          variant={confirmAction.type === 'activate' || confirmAction.type === 'unlock' ? 'primary' : 'danger'}
          loading={confirmAction.loading}
        />
      )}

      {/* ── Status history modal ── */}
      {statusHistory && (
        <AdminModal
          open
          onClose={() => setStatusHistory(null)}
          title="Status History"
          description={`${statusHistory.user?.fullName ?? ''} · ${statusHistory.user?.email ?? ''}`}
          size="lg"
        >
          {historyLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
            </div>
          ) : statusHistory.history.length === 0 ? (
            <AdminEmptyState
              icon={<History className="h-7 w-7" />}
              title="No history yet"
              message="No status changes have been recorded for this user."
            />
          ) : (
            <div className="space-y-0">
              {statusHistory.history.map((item, i) => (
                <div key={item.id ?? i} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < statusHistory.history.length - 1 && (
                    <div className="absolute left-4 top-9 bottom-0 w-px bg-slate-200" />
                  )}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    item.action === 'LOCKED'      ? 'bg-red-100 text-red-600' :
                    item.action === 'DEACTIVATED' ? 'bg-slate-100 text-slate-600' :
                    item.action === 'UNLOCKED'    ? 'bg-emerald-100 text-emerald-600' :
                    'bg-brand-100 text-brand-600'
                  }`}>
                    {item.action === 'LOCKED'    ? <Lock className="h-4 w-4" /> :
                     item.action === 'UNLOCKED'  ? <Unlock className="h-4 w-4" /> :
                     item.action === 'ACTIVATED' ? <UserCheck className="h-4 w-4" /> :
                     <UserX className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm font-semibold text-slate-900">
                      {(item.action ?? '').replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-slate-500">{item.description}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {item.performedBy} · {formatDateTime(item.performedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminModal>
      )}

      {/* ── Edit user modal ── */}
      {editUser && (
        <AdminModal
          open
          onClose={() => setEditUser(null)}
          title="Edit Profile"
          description={`${editUser.fullName} · ${editUser.email}`}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setEditUser(null)} disabled={editSaving}>Cancel</AdminButton>
              <AdminButton onClick={handleSaveEdit} loading={editSaving}>Save changes</AdminButton>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <AdminInput label="First name" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
              <AdminInput label="Last name" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
            </div>
            <AdminInput label="Email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} icon={<Mail className="h-4 w-4" />} />
          </div>
        </AdminModal>
      )}

      {/* ── Edit roles modal ── */}
      {rolesUser && (
        <AdminModal
          open
          onClose={() => setRolesUser(null)}
          title="Edit Roles"
          description={`Assign roles to ${rolesUser.fullName}`}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setRolesUser(null)} disabled={rolesSaving}>Cancel</AdminButton>
              <AdminButton onClick={handleSaveRoles} loading={rolesSaving}>Save roles</AdminButton>
            </>
          }
        >
          {rolesLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
            </div>
          ) : (
            <div className="space-y-2">
              {allRoles.map((role) => {
                const selected = selectedRoleIds.includes(role.id);
                return (
                  <button
                    key={role.id}
                    onClick={() => toggleRole(role.id)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
                      selected
                        ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/15'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors mt-0.5 ${
                      selected ? 'border-brand-600 bg-brand-600' : 'border-slate-300'
                    }`}>
                      {selected && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{role.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{role.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </AdminModal>
      )}
    </div>
  );
};

export default UserListPage;
