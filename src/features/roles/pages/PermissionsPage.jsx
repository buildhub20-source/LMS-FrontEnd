import { useCallback, useEffect, useState } from 'react';
import {
  KeyRound,
  Plus,
  Pencil,
  Trash2,
  Search,
  Lock,
} from 'lucide-react';
import AdminButton from '../../../components/ui/AdminButton';
import AdminBadge from '../../../components/ui/AdminBadge';
import AdminInput from '../../../components/ui/AdminInput';
import { AdminModal, AdminConfirmModal } from '../../../components/ui/AdminModal';
import {
  AdminEmptyState,
  AdminErrorState,
} from '../../../components/ui/AdminPagination';
import { AdminCardSkeleton } from '../../../components/ui/AdminSkeleton';
import PermissionGuard from '../../../guards/PermissionGuard';
import { PERMISSIONS } from '../../../constants/permissions';
import roleService from '../services/roleService';
import { useToast } from '../../../components/feedback/Toast';

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export const PermissionsPage = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  // List state
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');

  // Create / Edit modal
  const [editPerm, setEditPerm] = useState(null); // null = create
  const [modalOpen, setModalOpen] = useState(false);
  const [permName, setPermName] = useState('');
  const [permDescription, setPermDescription] = useState('');
  const [permAuthority, setPermAuthority] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const canManage = true; // Guarded by PermissionGuard at action level

  /* ─── data fetching ─── */

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await roleService.listPermissions();
      const list = Array.isArray(res?.items) ? res.items
        : Array.isArray(res?.content) ? res.content
        : Array.isArray(res) ? res : [];
      setPermissions(list);
    } catch (err) {
      setLoadError(err?.message ?? 'Failed to load permissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPermissions(); }, [loadPermissions]);

  const filtered = search
    ? permissions.filter((p) => {
        const q = search.toLowerCase();
        return (
          p.name?.toLowerCase().includes(q) ||
          p.authority?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
        );
      })
    : permissions;

  /* ─── create / edit ─── */

  const openCreate = () => {
    setEditPerm(null);
    setPermName('');
    setPermDescription('');
    setPermAuthority('');
    setModalError('');
    setModalOpen(true);
  };

  const openEdit = (perm) => {
    setEditPerm(perm);
    setPermName(perm.name ?? '');
    setPermDescription(perm.description ?? '');
    setPermAuthority(perm.authority ?? '');
    setModalError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setModalError('');
    if (!permName.trim())        { setModalError('Permission name is required.'); return; }
    if (!permDescription.trim()) { setModalError('Description is required.'); return; }
    if (!permAuthority.trim())   { setModalError('Authority identifier is required.'); return; }

    const authority = permAuthority.trim().toUpperCase().replace(/\s+/g, '_');
    setSaving(true);
    try {
      if (editPerm) {
        await roleService.updatePermission(editPerm.id, {
          name: permName.trim(),
          description: permDescription.trim(),
          authority,
        });
        toastSuccess(`Permission "${permName}" has been updated.`);
      } else {
        await roleService.createPermission({
          name: permName.trim(),
          description: permDescription.trim(),
          authority,
        });
        toastSuccess(`Permission "${permName}" has been created.`);
      }
      setModalOpen(false);
      loadPermissions();
    } catch (err) {
      setModalError(err?.message ?? 'Failed to save permission.');
    } finally {
      setSaving(false);
    }
  };

  /* ─── delete ─── */

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await roleService.deletePermission(deleteTarget.id);
      toastSuccess(`Permission "${deleteTarget.name}" has been deleted.`);
      setDeleteTarget(null);
      loadPermissions();
    } catch (err) {
      toastError(err?.message ?? 'Failed to delete permission.');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Permissions</h1>
          <p className="mt-1 text-slate-500">
            Manage granular authorities that can be assigned to roles.
          </p>
        </div>
        <PermissionGuard required={[PERMISSIONS.ROLE_WRITE]} fallback={null}>
          <AdminButton icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Create Permission
          </AdminButton>
        </PermissionGuard>
      </div>

      {/* Search */}
      <div className="card-base p-4">
        <AdminInput
          placeholder="Search permissions by name, authority, or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <AdminCardSkeleton key={i} />)}
        </div>
      ) : loadError ? (
        <AdminErrorState message={loadError} onRetry={loadPermissions} />
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={<KeyRound className="h-7 w-7" />}
          title="No permissions found"
          message={
            search
              ? 'Try adjusting your search.'
              : 'Create permissions to define granular access controls.'
          }
          action={
            <PermissionGuard required={[PERMISSIONS.ROLE_WRITE]} fallback={null}>
              {!search && <AdminButton icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Create Permission</AdminButton>}
            </PermissionGuard>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((perm) => (
            <div
              key={perm.id}
              className="card-base p-5 flex flex-col transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5 animate-slide-up"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-4 ring-brand-100">
                  <Lock className="h-5 w-5" />
                </div>
                <PermissionGuard required={[PERMISSIONS.ROLE_WRITE]} fallback={null}>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(perm)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(perm)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </PermissionGuard>
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">{perm.name}</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed flex-1">{perm.description}</p>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-1.5">Authority</p>
                <AdminBadge variant="default" className="font-mono text-[11px]">
                  {perm.authority}
                </AdminBadge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {modalOpen && (
        <AdminModal
          open
          onClose={() => setModalOpen(false)}
          title={editPerm ? 'Edit Permission' : 'Create Permission'}
          description={editPerm ? `Editing "${editPerm.name}"` : 'Define a new granular authority'}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</AdminButton>
              <AdminButton onClick={handleSave} loading={saving}>
                {editPerm ? 'Save changes' : 'Create permission'}
              </AdminButton>
            </>
          }
        >
          {modalError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">{modalError}</p>
            </div>
          )}
          <div className="space-y-5">
            <AdminInput
              label="Permission name"
              value={permName}
              onChange={(e) => setPermName(e.target.value)}
              placeholder="e.g. Create Course"
              autoFocus
            />
            <AdminInput
              label="Description"
              value={permDescription}
              onChange={(e) => setPermDescription(e.target.value)}
              placeholder="What this permission allows users to do"
            />
            <AdminInput
              label="Authority identifier"
              value={permAuthority}
              onChange={(e) => setPermAuthority(e.target.value)}
              placeholder="e.g. COURSE_CREATE"
              hint="Uppercase with underscores. Used in role-based access checks."
            />
          </div>
        </AdminModal>
      )}

      {/* ── Delete Confirm ── */}
      {deleteTarget && (
        <AdminConfirmModal
          open
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Permission"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone and may affect roles that use this permission.`}
          confirmLabel="Delete"
          variant="danger"
          loading={deleting}
        />
      )}
    </div>
  );
};

export default PermissionsPage;
