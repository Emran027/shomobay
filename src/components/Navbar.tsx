'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  LayoutDashboard,
  Trophy,
  Wallet,
  Users,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Book,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const memberTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'contributions', label: 'Contribute', icon: Wallet },
  { id: 'lottery', label: 'Lottery', icon: Trophy },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'rules', label: 'Rules', icon: Book },
];

const adminTabs = [
  { id: 'admin', label: 'Admin Panel', icon: ShieldCheck },
];

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const { user, logout, settings } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const allTabs = [...memberTabs, ...(isAdmin ? adminTabs : [])];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] min-h-screen fixed left-0 top-0 z-40"
        style={{
          background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.95) 0%, rgba(10, 14, 26, 0.98) 100%)',
          borderRight: '1px solid rgba(99, 102, 241, 0.1)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            {settings?.logoBase64 ? (
              <img src={settings.logoBase64} alt="Logo" className="w-10 h-10 rounded-xl object-contain" style={{ background: 'var(--bg-card)' }} />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <span className="text-white font-bold text-lg">AS</span>
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Amader Shomobay</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fund Management</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="mx-4 mb-4 p-3 rounded-xl" style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.12)',
        }}>
          <div className="flex items-center gap-3">
            <div className="avatar" style={{
              background: 'var(--gradient-primary)',
              width: '36px',
              height: '36px',
              fontSize: '14px',
              borderRadius: '10px',
            }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs capitalize" style={{ color: 'var(--accent-secondary)' }}>
                {user?.role === 'superadmin' ? 'Super Admin' : user?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}>Menu</p>
          {allTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200"
                style={{
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isActive ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                }}
              >
                <Icon size={18} style={{ opacity: isActive ? 1 : 0.6 }} />
                <span className="text-sm font-medium flex-1">{tab.label}</span>
                {isActive && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.12)',
            }}
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(10, 14, 26, 0.95)'
            : 'rgba(10, 14, 26, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
        }}
      >
        <div className="flex items-center justify-center px-4 py-3 relative">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              {settings?.logoBase64 ? (
                <img src={settings.logoBase64} alt="Logo" className="w-7 h-7 rounded-lg object-contain" style={{ background: 'var(--bg-card)' }} />
              ) : (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <span className="text-white font-bold text-xs">AS</span>
                </div>
              )}
              <h1 className="text-base font-bold text-white tracking-tight">Amader Shomobay</h1>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="px-3 pb-3 space-y-1 fade-in-up" style={{
            borderTop: '1px solid rgba(99, 102, 241, 0.08)',
          }}>
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="avatar" style={{
                background: 'var(--gradient-primary)',
                width: '32px',
                height: '32px',
                fontSize: '12px',
                borderRadius: '8px',
              }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs capitalize" style={{ color: 'var(--accent-secondary)' }}>
                  {user?.role === 'superadmin' ? 'Super Admin' : user?.role}
                </p>
              </div>
            </div>
            {allTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                  style={{
                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    color: isActive ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                  }}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
              style={{ color: '#f87171' }}
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Bottom Tab Bar (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(10, 14, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(99, 102, 241, 0.1)',
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {allTabs.slice(0, 6).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all"
                style={{
                  color: isActive ? 'var(--accent-secondary)' : 'var(--text-muted)',
                  background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  minWidth: '56px',
                }}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
