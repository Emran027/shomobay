'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import {
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Trophy,
  FileDown,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
} from 'lucide-react';

export default function Dashboard() {
  const { user, members, fetchMembers, lotteryResults, fetchLotteryResults, settings } = useAppStore();

  useEffect(() => {
    fetchMembers();
    fetchLotteryResults();
  }, [fetchMembers, fetchLotteryResults]);

  const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const totalMembers = members.length;
  const totalContributed = members.reduce((sum, m) => sum + m.totalContributed, 0);
  const totalDebt = members.reduce((sum, m) => sum + m.totalDebt, 0);
  const totalLotteryPaid = lotteryResults.reduce((sum, r) => sum + r.prizeAmount, 0);
  
  // Find current month's winner if exists
  const currentWinner = lotteryResults.find(r => r.month === currentMonthStr)?.winnerName || 'Pending';

  const stats = [
    {
      label: 'Total Members',
      value: totalMembers.toString(),
      icon: Users,
      color: '#6366f1',
      bgGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.08))',
      borderColor: 'rgba(99, 102, 241, 0.2)',
    },
    {
      label: 'Total Collected',
      value: `৳${totalContributed.toLocaleString()}`,
      icon: Wallet,
      color: '#22c55e',
      bgGradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.08))',
      borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    {
      label: 'Lottery Distributed',
      value: `৳${totalLotteryPaid.toLocaleString()}`,
      icon: Trophy,
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.08))',
      borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    {
      label: 'Outstanding Debt',
      value: `৳${totalDebt.toLocaleString()}`,
      icon: TrendingUp,
      color: '#ef4444',
      bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.08))',
      borderColor: 'rgba(239, 68, 68, 0.2)',
    },
  ];

  const handlePrint = () => {
    window.print();
  };  return (
    <div className="space-y-6 fade-in-up print:space-y-0">
      
      {/* Header */}
      <div className="print:hidden">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Complete overview of your Amader Shomobay finances
        </p>
      </div>

      {/* Compact Winner Banner */}
      {currentWinner !== 'Pending' && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-center justify-between print:hidden shadow-sm">
          <div className="flex items-center gap-3">
            <Trophy size={18} className="text-yellow-500" />
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-indigo-300">Winner of the Month</p>
              <p className="font-bold text-white text-sm">{currentWinner}</p>
            </div>
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="glass-card overflow-hidden print:w-full print:border-none print:shadow-none print:m-0 print:p-0">
        <div className="p-5 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Member Overview</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Contributions and debt status for all members
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="btn-secondary py-1.5 px-4 text-sm flex items-center gap-2 border-indigo-500/30 hover:border-indigo-500"
            >
              <FileDown size={14} />
              Print / Save PDF
            </button>
            <span className="badge badge-info hidden sm:inline-flex">{totalMembers} members</span>
          </div>
        </div>

        {/* Print-Only Header */}
        <div className="hidden print:flex flex-col items-center mb-6 pb-2 border-b-2 border-black w-full text-center">
          {settings?.logoBase64 && (
            <img src={settings.logoBase64} alt="App Logo" className="h-16 w-auto object-contain mb-2" />
          )}
          <h1 className="text-2xl font-bold text-black uppercase tracking-wider leading-none mb-1">
            {settings?.logoBase64 ? 'Amader Shomobay' : 'Amader Shomobay'}
          </h1>
          <p className="text-sm text-gray-800 mb-2">Monthly Report - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          <div className="bg-black text-white px-4 py-1.5 rounded-full inline-block mt-1">
            <p className="text-xs font-semibold uppercase tracking-wider">
              Winner of the Month: <span className="font-bold underline ml-1">{currentWinner}</span>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="data-table w-full text-left print:text-black print:border-collapse whitespace-nowrap">
            <thead>
              <tr>
                <th className="print:border-b-2 print:border-black w-10 text-center">SL No.</th>
                <th className="print:border-b-2 print:border-black">Member Name</th>
                <th className="print:border-b-2 print:border-black">Monthly Payment</th>
                <th className="print:border-b-2 print:border-black">Total Savings</th>
                <th className="print:border-b-2 print:border-black">Debt Status</th>
                <th className="print:border-b-2 print:border-black text-center">Action/Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={m.user.id} className="fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <td className="text-center font-semibold text-gray-400 print:text-black">
                    {i + 1}
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar print:hidden" style={{ background: m.user.avatarColor, width: '32px', height: '32px', fontSize: '14px' }}>
                        {m.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm print:text-black print:text-base">{m.user.name}</p>
                        <p className="text-xs print:hidden" style={{ color: 'var(--text-muted)' }}>{m.user.email}</p>
                      </div>
                      {m.user.role === 'superadmin' && <span className="badge badge-info ml-2 text-[10px] print:hidden">Admin</span>}
                    </div>
                  </td>
                  <td>
                    {m.currentMonthDeposit && m.currentMonthDeposit > 0 ? (
                      <span className="font-semibold" style={{ color: 'var(--success)' }}>
                        ৳{m.currentMonthDeposit.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-sm print:text-black" style={{ color: 'var(--text-muted)' }}>
                        -
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold print:font-normal">
                        ৳{m.totalContributed.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td>
                    {m.totalDebt > 0 ? (
                      <span className="font-semibold" style={{ color: '#f87171' }}>
                        ৳{m.totalDebt.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-sm print:text-black print:italic" style={{ color: 'var(--text-muted)' }}>No Debt</span>
                    )}
                  </td>
                  <td className="text-center">
                    {m.monthsPaid.includes(currentMonthStr) ? (
                      <span className="badge badge-success print:border-black print:text-black print:bg-transparent">
                        Paid
                      </span>
                    ) : (
                      <span className="badge badge-danger print:border-black print:text-black print:bg-transparent">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No approved members yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Lottery Wins */}
      {lotteryResults.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-lg font-bold text-white mb-4">
            <Trophy size={20} className="inline mr-2" style={{ color: '#f59e0b' }} />
            Lottery History
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lotteryResults.slice().reverse().map((r) => (
              <div key={r.id} className="p-4 rounded-xl"
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.15)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Trophy size={24} style={{ color: '#fbbf24' }} />
                  <div>
                    <p className="font-bold text-white">{r.winnerName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {r.month} — ৳{r.prizeAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
