'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Loader2,
  Clock,
  Mail,
  Phone,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import Modal from './Modal';

export default function AdminPanel() {
  const { pendingUsers, fetchPendingUsers, user, members, fetchMembers, settings, fetchSettings } = useAppStore();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  
  const [resetPassword, setResetPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const [savingSettings, setSavingSettings] = useState(false);

  const isSuperAdmin = user?.role === 'superadmin';

  useEffect(() => {
    fetchPendingUsers();
    fetchMembers();
    fetchSettings();
  }, [fetchPendingUsers, fetchMembers, fetchSettings]);

  async function handleAction(userId: string, action: 'approve' | 'reject') {
    setActionLoading(userId);
    setMessage('');

    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage(`User ${data.data.name} has been ${action === 'approve' ? 'approved' : 'rejected'}.`);
        fetchPendingUsers();
        fetchMembers();
      }
    } catch {
      setMessage('Failed to process request');
    } finally {
      setActionLoading(null);
    }
  }

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string, name: string } | null>(null);

  async function handleDeleteUserConfirm() {
    if (!userToDelete) return;
    
    setActionLoading(`delete-${userToDelete.id}`);
    setMessage('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', userId: userToDelete.id })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`User ${userToDelete.name} has been deleted.`);
        fetchMembers();
      } else {
        setMessage(data.error || 'Failed to delete user');
      }
    } catch {
      setMessage('Error deleting user');
    } finally {
      setActionLoading(null);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  }

  function promptDeleteUser(userId: string, name: string) {
    setUserToDelete({ id: userId, name });
    setDeleteModalOpen(true);
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreatingUser(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          phone: newUserPhone,
          password: newUserPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('User created successfully.');
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPhone('');
        setNewUserPassword('');
        fetchMembers();
      } else {
        setMessage(data.error || 'Failed to create user');
      }
    } catch {
      setMessage('Error creating user');
    } finally {
      setCreatingUser(false);
    }
  }

  async function handleTogglePermission(userId: string, permissionType: 'dataEntry' | 'spinLottery', currentValue: boolean) {
    if (!isSuperAdmin) return;
    setActionLoading(`perm-${userId}-${permissionType}`);
    try {
      const res = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, permissionType, value: !currentValue }),
      });
      const data = await res.json();
      if (data.success) {
        fetchMembers();
      } else {
        setMessage(data.error || 'Failed to update permission');
      }
    } catch {
      setMessage('Error updating permission');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleFactoryReset(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm('WARNING: This will delete ALL data (Users, Savings, Debt, Lottery). Are you absolutely sure?')) return;
    
    setResetting(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('System reset successful.');
        setResetPassword('');
        fetchMembers();
        fetchPendingUsers();
      } else {
        setMessage(data.error || 'Failed to reset system');
      }
    } catch {
      setMessage('Error during factory reset');
    } finally {
      setResetting(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSavingSettings(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const payload = type === 'logo' ? { logoBase64: base64 } : { bannerBase64: base64 };
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setMessage(`${type === 'logo' ? 'Logo' : 'Banner'} updated successfully.`);
          fetchSettings();
        } else {
          setMessage(data.error || 'Failed to update branding');
        }
      } catch {
        setMessage('Network error during upload');
      } finally {
        setSavingSettings(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck size={24} style={{ color: 'var(--accent-secondary)' }} />
          Admin Panel
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Manage user approvals and system settings
        </p>
      </div>

      {/* Success/Info Message */}
      {message && (
        <div className="p-3 rounded-xl text-sm font-medium flex items-center gap-2 fade-in-up"
          style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            color: '#4ade80',
          }}>
          <CheckCircle size={16} />
          {message}
        </div>
      )}

      {/* Pending Users */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock size={18} style={{ color: 'var(--warning)' }} />
            Pending Approvals
          </h3>
          <span className="badge badge-warning">{pendingUsers.length} pending</span>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No pending requests. All caught up! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map((u) => (
              <div key={u.id} className="p-4 rounded-xl fade-in-up"
                style={{
                  background: 'rgba(245, 158, 11, 0.06)',
                  border: '1px solid rgba(245, 158, 11, 0.12)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="avatar" style={{
                      background: u.avatarColor,
                      width: '44px',
                      height: '44px',
                      fontSize: '18px',
                      borderRadius: '12px',
                    }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white">{u.name}</p>
                      <div className="flex flex-wrap gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <Mail size={12} /> {u.email}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <Phone size={12} /> {u.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 sm:flex-shrink-0">
                    <button
                      onClick={() => handleAction(u.id, 'approve')}
                      disabled={actionLoading === u.id}
                      className="btn-success flex-1 sm:flex-none min-h-[44px]"
                      id={`approve-${u.id}`}
                    >
                      {actionLoading === u.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>
                          <UserCheck size={14} /> Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAction(u.id, 'reject')}
                      disabled={actionLoading === u.id}
                      className="btn-danger flex-1 sm:flex-none min-h-[44px]"
                      id={`reject-${u.id}`}
                    >
                      {actionLoading === u.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>
                          <UserX size={14} /> Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add User Section */}
      <div className="glass-card p-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <UserCheck size={18} style={{ color: 'var(--success)' }} />
          Add Member Account
        </h3>
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Name</label>
            <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Phone</label>
            <input type="text" value={newUserPhone} onChange={e => setNewUserPhone(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Password</label>
            <input type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="input-field" required />
          </div>
          <button type="submit" disabled={creatingUser} className="btn-primary w-full h-[42px]">
            {creatingUser ? <Loader2 size={16} className="animate-spin" /> : 'Create User'}
          </button>
        </form>
      </div>

      {/* Delete User Section */}
      <div className="glass-card p-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <UserX size={18} style={{ color: 'var(--danger)' }} />
          Manage Existing Members
        </h3>
        <div className="space-y-3">
          {members.map(m => (
            <div key={m.user.id} className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
              <div>
                <p className="font-bold text-white text-sm">{m.user.name}</p>
                <div className="flex flex-col gap-1 mt-1">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.user.email}</p>
                  {isSuperAdmin && (
                    <div className="flex gap-2 mt-1">
                      <label className="flex items-center gap-1 text-[10px] cursor-pointer" style={{ color: m.user.canDataEntry ? 'var(--success)' : 'var(--text-muted)' }}>
                        <input type="checkbox" checked={!!m.user.canDataEntry} onChange={() => handleTogglePermission(m.user.id, 'dataEntry', !!m.user.canDataEntry)} disabled={actionLoading !== null} className="w-3 h-3" />
                        Data Entry
                      </label>
                      <label className="flex items-center gap-1 text-[10px] cursor-pointer" style={{ color: m.user.canSpinLottery ? 'var(--accent-secondary)' : 'var(--text-muted)' }}>
                        <input type="checkbox" checked={!!m.user.canSpinLottery} onChange={() => handleTogglePermission(m.user.id, 'spinLottery', !!m.user.canSpinLottery)} disabled={actionLoading !== null} className="w-3 h-3" />
                        Spin Lottery
                      </label>
                    </div>
                  )}
                </div>
              </div>
              {isSuperAdmin && (
                <button
                  onClick={() => promptDeleteUser(m.user.id, m.user.name)}
                  disabled={actionLoading === `delete-${m.user.id}`}
                  className="btn-danger p-2 h-auto ml-2"
                  title="Delete User"
                >
                  {actionLoading === `delete-${m.user.id}` ? <Loader2 size={14} className="animate-spin" /> : <UserX size={14} />}
                </button>
              )}
            </div>
          ))}
          {members.length === 0 && <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>No members found</p>}
        </div>
      </div>

      {/* System Reset Section & Branding */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck size={18} style={{ color: 'var(--accent-primary)' }} />
              App Branding
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Upload Logo (max 40px height recommended)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  disabled={savingSettings}
                  className="input-field py-1" 
                />
                {settings?.logoBase64 && (
                  <img src={settings.logoBase64} alt="Logo" className="h-10 mt-2 rounded object-contain" />
                )}
              </div>
            </div>
          </div>

          <div className="glass-card p-5" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2" style={{ color: 'var(--danger)' }}>
              <AlertTriangle size={18} />
              Danger Zone: Factory Reset
            </h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              This will permanently erase all data (Users, Contributions, Lottery) and start fresh. Only Super Admin will remain.
            </p>
            <form onSubmit={handleFactoryReset} className="flex flex-col gap-3">
              <div className="w-full">
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--danger)' }}>Confirm Super Admin Password</label>
                <input 
                  type="password" 
                  value={resetPassword} 
                  onChange={e => setResetPassword(e.target.value)} 
                  className="input-field" 
                  required 
                  placeholder="Enter password to confirm"
                  style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}
                />
              </div>
              <button type="submit" disabled={resetting || !resetPassword} className="btn-danger w-full h-[42px] px-6">
                {resetting ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Clear All Data'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Info */}
      <div className="glass-card p-5">
        <h3 className="text-lg font-bold text-white mb-4">System Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl" style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.12)',
          }}>
            <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Your Role
            </p>
            <p className="text-lg font-bold capitalize" style={{ color: 'var(--accent-secondary)' }}>
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.12)',
          }}>
            <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Monthly Contribution
            </p>
            <p className="text-lg font-bold" style={{ color: '#4ade80' }}>
              ৳2,000 / member
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.12)',
          }}>
            <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Lottery Prize Pool
            </p>
            <p className="text-lg font-bold" style={{ color: '#fbbf24' }}>
              ৳10,000
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.12)',
          }}>
            <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Debt Installment
            </p>
            <p className="text-lg font-bold" style={{ color: '#f87171' }}>
              ৳2,000 / month
            </p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteUserConfirm}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone and will permanently remove their records.`}
        confirmText="Delete"
        isDestructive={true}
        isLoading={actionLoading === `delete-${userToDelete?.id}`}
      />
    </div>
  );
}
