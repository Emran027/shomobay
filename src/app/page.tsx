'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import AuthForms from '@/components/AuthForms';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import Contributions from '@/components/Contributions';
import LotterySpinner from '@/components/LotterySpinner';
import MembersList from '@/components/MembersList';
import AdminPanel from '@/components/AdminPanel';
import Rules from '@/components/Rules';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading, fetchCurrentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 pulse-glow"
            style={{ background: 'var(--gradient-primary)' }}>
            <span className="text-white font-black text-2xl">AS</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent-secondary)' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading Amader Shomobay...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - show auth forms
  if (!isAuthenticated) {
    return <AuthForms />;
  }

  // Main app
  return (
    <div className="flex min-h-screen">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 lg:ml-[260px] pt-16 pb-20 lg:pt-0 lg:pb-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'contributions' && <Contributions />}
          {activeTab === 'lottery' && <LotterySpinner />}
          {activeTab === 'members' && <MembersList />}
          {activeTab === 'rules' && <Rules />}
          {activeTab === 'admin' && <AdminPanel />}
        </div>
      </main>
    </div>
  );
}
