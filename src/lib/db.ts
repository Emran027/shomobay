import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { User, Contribution, LotteryResult, AppSettings } from './types';

// Vercel বা লোকাল .env ফাইল থেকে URL এবং Key সংগ্রহ করা
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

// সুপাবেজ ক্লায়েন্ট তৈরি করা
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#eab308', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#2563eb',
];
function getRandomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// হেল্পার ফাংশন: ডাটাবেজ থেকে সব মেম্বারদের তথ্য আনা
export const fetchMembers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

// হেল্পার ফাংশন: মেম্বার ডিলিট করা
export const deleteMember = async (id: string) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// ==========================================
// User Operations for API Routes
// ==========================================

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*');
  if (error) { console.error('getUsers:', error.message); return []; }
  return data || [];
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const { data } = await supabase.from('users').select('*').ilike('email', email).maybeSingle();
  return data ?? undefined;
}

export async function findUserById(id: string): Promise<User | undefined> {
  const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
  return data ?? undefined;
}

export function verifyPassword(user: User, passwordStr: string): boolean {
  try {
    return bcrypt.compareSync(passwordStr, user.password);
  } catch(e) {
    return false;
  }
}

export async function createUser(
  name: string, email: string, passwordStr: string, phone: string
): Promise<User> {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error('Email already registered');

  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    email: email.toLowerCase(),
    password: bcrypt.hashSync(passwordStr, 10),
    phone,
    role: 'member',
    status: 'pending',
    avatarColor: getRandomColor(),
    createdAt: new Date().toISOString(),
  };

  const { error } = await supabase.from('users').insert(user);
  if (error) throw new Error(error.message);
  return user;
}

export async function adminCreateUser(
  name: string, email: string, passwordStr: string, phone: string
): Promise<User> {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error('Email already registered');

  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    email: email.toLowerCase(),
    password: bcrypt.hashSync(passwordStr, 10),
    phone,
    role: 'member',
    status: 'approved',
    avatarColor: getRandomColor(),
    createdAt: new Date().toISOString(),
  };

  const { error } = await supabase.from('users').insert(user);
  if (error) throw new Error(error.message);
  return user;
}

export async function updateUserStatus(userId: string, status: 'approved' | 'rejected'): Promise<User | null> {
  const { data, error } = await supabase.from('users').update({ status }).eq('id', userId).select().maybeSingle();
  if (error) return null;
  return data;
}

export async function updateUserRole(userId: string, role: 'member' | 'admin' | 'superadmin'): Promise<User | null> {
  const { data, error } = await supabase.from('users').update({ role }).eq('id', userId).select().maybeSingle();
  if (error) return null;
  return data;
}

export async function updateUserPermission(
  userId: string, permissionType: 'dataEntry' | 'spinLottery', value: boolean
): Promise<User | null> {
  const field = permissionType === 'dataEntry' ? 'canDataEntry' : 'canSpinLottery';
  const { data, error } = await supabase.from('users').update({ [field]: value }).eq('id', userId).select().maybeSingle();
  if (error) return null;
  return data;
}

export async function deleteUser(userId: string): Promise<boolean> {
  return deleteMember(userId);
}

// ==========================================
// Contribution Operations
// ==========================================

export async function getContributions(): Promise<Contribution[]> {
  const { data, error } = await supabase.from('contributions').select('*');
  if (error) return [];
  return data || [];
}

export async function addContribution(
  userId: string, month: string, amount: number, recordedBy: string
): Promise<Contribution> {
  const { data: existing } = await supabase
    .from('contributions').select('id').eq('userId', userId).eq('month', month).maybeSingle();
  if (existing) throw new Error('Contribution already recorded for this month');

  if (amount < 500) throw new Error('Minimum deposit is 500 BDT');

  const debt = await getUserDebt(userId);
  if (debt > 0 && amount < 2000) {
    throw new Error('Winner lockdown: You must pay at least 2000 BDT while you have debt from a previous win.');
  }

  const contribution: Contribution = {
    id: `contrib_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    amount,
    month,
    paidAt: new Date().toISOString(),
    recordedBy,
  };

  const { error } = await supabase.from('contributions').insert(contribution);
  if (error) throw new Error(error.message);
  return contribution;
}

export async function deleteContribution(userId: string, month: string): Promise<boolean> {
  const { error } = await supabase.from('contributions').delete().eq('userId', userId).eq('month', month);
  return !error;
}

// ==========================================
// Lottery Operations
// ==========================================

export async function getLotteryResults(): Promise<LotteryResult[]> {
  const { data, error } = await supabase.from('lottery_results').select('*');
  if (error) return [];
  return data || [];
}

export async function addLotteryResult(
  winnerId: string, winnerName: string, month: string, drawnBy: string, prizeAmount?: number
): Promise<LotteryResult> {
  const { data: existing } = await supabase.from('lottery_results').select('id').eq('month', month).maybeSingle();
  if (existing) throw new Error('Lottery already drawn for this month');

  const result: LotteryResult = {
    id: `lottery_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    winnerId,
    winnerName,
    month,
    prizeAmount: prizeAmount ?? 10000,
    drawnAt: new Date().toISOString(),
    drawnBy,
  };

  const { error } = await supabase.from('lottery_results').insert(result);
  if (error) throw new Error(error.message);
  return result;
}

export async function isEligibleForLottery(userId: string, currentMonth: string): Promise<boolean> {
  const debt = await getUserDebt(userId);
  if (debt > 0) return false;

  const { data } = await supabase.from('contributions')
    .select('amount')
    .eq('userId', userId)
    .eq('month', currentMonth);

  const sum = (data || []).reduce((acc, c) => acc + Number(c.amount), 0);
  return sum >= 2000;
}

export async function getUserDebt(userId: string): Promise<number> {
  const { data: wins } = await supabase.from('lottery_results').select('*').eq('winnerId', userId);
  if (!wins || wins.length === 0) return 0;

  let totalDebt = 0;
  for (const win of wins) {
    const winDate = new Date(win.drawnAt);
    const { data: payments } = await supabase
      .from('contributions').select('amount, paidAt').eq('userId', userId);

    const totalPaidBack = (payments || [])
      .filter(c => new Date(c.paidAt) >= winDate)
      .reduce((sum, c) => sum + Number(c.amount), 0);

    const debt = Number(win.prizeAmount) - totalPaidBack;
    if (debt > 0) totalDebt += debt;
  }
  return totalDebt;
}

// ==========================================
// Settings Operations
// ==========================================

export async function getSettings(): Promise<AppSettings> {
  const defaults: AppSettings = { logoBase64: '', bannerBase64: '' };
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
  if (error || !data) return defaults;
  return { ...defaults, ...data };
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };

  const { data: existing } = await supabase.from('settings').select('id').eq('id', 1).maybeSingle();
  if (existing) {
    await supabase.from('settings').update(updated).eq('id', 1);
  } else {
    await supabase.from('settings').insert({ id: 1, ...updated });
  }
  return updated;
}

export async function factoryResetData(): Promise<void> {
  await supabase.from('contributions').delete().not('id', 'is', null);
  await supabase.from('lottery_results').delete().not('id', 'is', null);
  await supabase.from('users').delete().neq('role', 'superadmin');
}