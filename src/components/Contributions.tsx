'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Wallet, CheckCircle, Loader2, Calendar, User, X } from 'lucide-react';

export default function Contributions() {
  const { user, members, fetchMembers } = useAppStore();
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [amount, setAmount] = useState('2000');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const hasDataEntryAuth = !!user?.canDataEntry || user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    fetchMembers();
    // Set current month as default
    const now = new Date();
    setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  }, [fetchMembers]);

  async function handleRecordContribution(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !selectedMonth) return;
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser, month: selectedMonth, amount: Number(amount) }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage('Contribution recorded successfully!');
        fetchMembers();
        setSelectedUser('');
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to record contribution');
    } finally {
      setLoading(false);
    }
  }

  // Generate month options for the last 12 months
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  });

  async function handleDeleteRecord(userId: string, month: string) {
    if (!window.confirm(`Are you sure you want to delete the payment record for ${month}? This action cannot be undone.`)) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', userId, month }),
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage('Payment record deleted successfully');
        fetchMembers();
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to delete payment record');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-white">Monthly Contributions</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Record deposits (Minimum ৳500)
        </p>
      </div>

      {/* Record Contribution Form */}
      {hasDataEntryAuth && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Wallet size={20} style={{ color: 'var(--accent-secondary)' }} />
            Record New Contribution
          </h3>

          {message && (
            <div className="mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 fade-in-up"
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                color: '#4ade80',
              }}>
              <CheckCircle size={16} />
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm font-medium fade-in-up"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
              }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRecordContribution} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}>
                <User size={12} className="inline mr-1" /> Member
              </label>
              <select
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                className="input-field"
                required
                id="contrib-member-select"
              >
                <option value="">Select member...</option>
                {members.map(m => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}>
                <Calendar size={12} className="inline mr-1" /> Month
              </label>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="input-field"
                required
                id="contrib-month-select"
              >
                {monthOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}>
                Amount (BDT)
              </label>
              <input
                type="number"
                min="500"
                step="100"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="input-field"
                required
                id="contrib-amount-input"
              />
            </div>

            <div className="flex items-end">
              <button type="submit" disabled={loading} className="btn-primary w-full" id="contrib-submit">
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>Record {amount} BDT</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contribution Status Grid */}
      <div className="glass-card p-5">
        <h3 className="text-lg font-bold text-white mb-4">Payment Status</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => {
            const paidCurrentMonth = m.monthsPaid.includes(selectedMonth);
            return (
              <div key={m.user.id} className="p-4 rounded-xl transition-all"
                style={{
                  background: paidCurrentMonth
                    ? 'rgba(34, 197, 94, 0.08)'
                    : 'rgba(239, 68, 68, 0.06)',
                  border: `1px solid ${paidCurrentMonth
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(239, 68, 68, 0.12)'}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="avatar" style={{
                      background: m.user.avatarColor,
                      width: '36px',
                      height: '36px',
                      fontSize: '14px',
                      borderRadius: '10px',
                    }}>
                      {m.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{m.user.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Total: ৳{m.totalContributed.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {paidCurrentMonth ? (
                    <span className="badge badge-success">
                      <CheckCircle size={12} className="mr-1" /> Paid
                    </span>
                  ) : (
                    <span className="badge badge-danger">Unpaid</span>
                  )}
                </div>

                {/* Months paid badges */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.monthsPaid.slice(-6).map(month => (
                    <div key={month} className="relative group">
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-medium inline-block"
                        style={{
                          background: 'rgba(99, 102, 241, 0.12)',
                          color: 'var(--accent-secondary)',
                          border: '1px solid rgba(99, 102, 241, 0.15)',
                        }}>
                        {month}
                      </span>
                      {(user?.role === 'superadmin' || user?.role === 'admin') && (
                        <button 
                          onClick={() => handleDeleteRecord(m.user.id, month)} 
                          className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-white p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600 shadow-sm"
                          title={`Delete ${month} record`}
                        >
                          <X size={10} strokeWidth={3} />
                        </button>
                      )}
                    </div>
                  ))}
                  {m.monthsPaid.length === 0 && (
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      No payments recorded
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {members.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <Wallet size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No members found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
