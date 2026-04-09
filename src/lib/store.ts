// ==========================================
// Zustand Client-Side Store
// ==========================================

import { create } from 'zustand';
import { PublicUser, MemberSummary, LotteryResult, AuthPayload } from './types';

interface AppState {
  // Auth
  user: AuthPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Data
  members: MemberSummary[];
  lotteryResults: LotteryResult[];
  pendingUsers: PublicUser[];
  settings: { logoBase64: string; bannerBase64: string };

  // Actions
  setUser: (user: AuthPayload | null) => void;
  setLoading: (loading: boolean) => void;
  setMembers: (members: MemberSummary[]) => void;
  setLotteryResults: (results: LotteryResult[]) => void;
  setPendingUsers: (users: PublicUser[]) => void;
  logout: () => void;

  // API actions
  fetchCurrentUser: () => Promise<void>;
  fetchMembers: () => Promise<void>;
  fetchLotteryResults: () => Promise<void>;
  fetchPendingUsers: () => Promise<void>;
  fetchSettings: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  members: [],
  lotteryResults: [],
  pendingUsers: [],
  settings: { logoBase64: '', bannerBase64: '' },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setMembers: (members) => set({ members }),
  setLotteryResults: (lotteryResults) => set({ lotteryResults }),
  setPendingUsers: (pendingUsers) => set({ pendingUsers }),

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    set({ user: null, isAuthenticated: false });
  },

  fetchCurrentUser: async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.data) {
        set({ user: data.data, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  fetchMembers: async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (data.success) {
        set({ members: data.data });
      }
    } catch {
      console.error('Failed to fetch members');
    }
  },

  fetchLotteryResults: async () => {
    try {
      const res = await fetch('/api/lottery');
      const data = await res.json();
      if (data.success) {
        set({ lotteryResults: data.data });
      }
    } catch (e) {
      console.error('Failed to fetch lottery results', e);
    }
  },

  fetchPendingUsers: async () => {
    try {
      const res = await fetch('/api/admin/pending');
      const data = await res.json();
      if (data.success) {
        set({ pendingUsers: data.data });
      }
    } catch {
      console.error('Failed to fetch pending users');
    }
  },

  fetchSettings: async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        set({ settings: data.data });
      }
    } catch (e) {
      console.error('Failed to fetch settings', e);
    }
  },
}));
