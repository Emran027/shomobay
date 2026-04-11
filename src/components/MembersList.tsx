'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Users, Mail, Phone, Calendar, CheckCircle, AlertTriangle, Trophy, Trash2, Loader2 } from 'lucide-react';
import Modal from './Modal';

export default function MembersList() {
  const { user, members, fetchMembers } = useAppStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string, name: string } | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  async function handleDeleteConfirm() {
    if (!memberToDelete) return;
    setLoadingDelete(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', userId: memberToDelete.id })
      });
      const data = await res.json();
      if (data.success) {
        fetchMembers();
      } else {
        alert(data.error || 'Failed to delete member');
      }
    } catch {
      alert('Error deleting user');
    } finally {
      setLoadingDelete(false);
      setDeleteModalOpen(false);
      setMemberToDelete(null);
    }
  }

  function promptDelete(id: string, name: string) {
    setMemberToDelete({ id, name });
    setDeleteModalOpen(true);
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-white">All Members</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Complete member directory with financial details
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {members.map((m, i) => (
          <div key={m.user.id} className="glass-card p-5 fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
            {/* Member Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="avatar" style={{
                background: m.user.avatarColor,
                width: '48px',
                height: '48px',
                fontSize: '20px',
                borderRadius: '14px',
              }}>
                {m.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white truncate">{m.user.name}</h3>
                <span className="badge badge-info text-[10px] capitalize mt-0.5">
                  {m.user.role === 'superadmin' ? 'Super Admin' : m.user.role}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {m.isEligibleForLottery ? (
                  <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                ) : (
                  <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
                )}
                {user?.role === 'superadmin' && m.user.role !== 'superadmin' && (
                  <button
                    onClick={() => promptDelete(m.user.id, m.user.name)}
                    className="p-2 ml-1 text-red-500 hover:text-red-400 opacity-60 hover:opacity-100 transition-opacity"
                    title="Delete Member"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-secondary)' }} className="truncate">{m.user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{m.user.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>
                  Joined {new Date(m.user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Financial Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl" style={{
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.12)',
              }}>
                <p className="text-xs font-semibold uppercase mb-0.5" style={{ color: 'var(--text-muted)' }}>
                  Contributed
                </p>
                <p className="text-lg font-bold" style={{ color: '#4ade80' }}>
                  ৳{m.totalContributed.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{
                background: m.totalDebt > 0
                  ? 'rgba(239, 68, 68, 0.08)'
                  : 'rgba(99, 102, 241, 0.08)',
                border: `1px solid ${m.totalDebt > 0
                  ? 'rgba(239, 68, 68, 0.12)'
                  : 'rgba(99, 102, 241, 0.12)'}`,
              }}>
                <p className="text-xs font-semibold uppercase mb-0.5" style={{ color: 'var(--text-muted)' }}>
                  {m.totalDebt > 0 ? 'Debt' : 'Status'}
                </p>
                <p className="text-lg font-bold" style={{
                  color: m.totalDebt > 0 ? '#f87171' : 'var(--accent-secondary)',
                }}>
                  {m.totalDebt > 0 ? `৳${m.totalDebt.toLocaleString()}` : 'Clear'}
                </p>
              </div>
            </div>

            {/* Lottery Wins */}
            {m.lotteryWins.length > 0 && (
              <div className="mt-3 p-3 rounded-xl" style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.15)',
              }}>
                <div className="flex items-center gap-2">
                  <Trophy size={14} style={{ color: '#fbbf24' }} />
                  <span className="text-xs font-semibold" style={{ color: '#fbbf24' }}>
                    Won {m.lotteryWins.length} time{m.lotteryWins.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Users size={48} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
          <p className="text-lg font-semibold text-white">No Members Yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Members will appear here once approved by an admin.
          </p>
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Member"
        message={`Are you sure you want to delete ${memberToDelete?.name}? This action cannot be undone and will remove all their financial records.`}
        confirmText="Delete"
        isDestructive={true}
        isLoading={loadingDelete}
      />
    </div>
  );
}
