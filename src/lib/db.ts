// ==========================================
// In-Memory Database with JSON File Persistence
// ==========================================

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Contribution, LotteryResult } from './types';

const DB_PATH = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DB_PATH, 'users.json');
const CONTRIBUTIONS_FILE = path.join(DB_PATH, 'contributions.json');
const LOTTERY_FILE = path.join(DB_PATH, 'lottery.json');
const SETTINGS_FILE = path.join(DB_PATH, 'settings.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
  }
}

// Avatar color palette
const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#eab308', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#2563eb',
];

function getRandomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// Load data from file
function loadJSON<T>(filepath: string, defaultValue: T[]): T[] {
  ensureDataDir();
  try {
    if (fs.existsSync(filepath)) {
      const data = fs.readFileSync(filepath, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    console.error(`Error loading ${filepath}`);
  }
  return defaultValue;
}

// Save data to file
function saveJSON<T>(filepath: string, data: T | T[]): void {
  ensureDataDir();
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// ==========================================
// Database Access Functions
// ==========================================

export function getUsers(): User[] {
  return loadJSON<User>(USERS_FILE, []);
}

function saveUsers(users: User[]): void {
  saveJSON(USERS_FILE, users);
}

export function getContributions(): Contribution[] {
  return loadJSON<Contribution>(CONTRIBUTIONS_FILE, []);
}

function saveContributions(contributions: Contribution[]): void {
  saveJSON(CONTRIBUTIONS_FILE, contributions);
}

export function getLotteryResults(): LotteryResult[] {
  return loadJSON<LotteryResult>(LOTTERY_FILE, []);
}

function saveLotteryResults(results: LotteryResult[]): void {
  saveJSON(LOTTERY_FILE, results);
}

export function getSettings(): import('./types').AppSettings {
  const defaultSettings = { logoBase64: '', bannerBase64: '' };
  ensureDataDir();
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error(e);
  }
  return defaultSettings;
}

export function updateSettings(settings: Partial<import('./types').AppSettings>): import('./types').AppSettings {
  const current = getSettings();
  const updated = { ...current, ...settings };
  saveJSON(SETTINGS_FILE, updated); 
  return updated;
}

// ==========================================
// User Operations
// ==========================================

export function createUser(name: string, email: string, password: string, phone: string): User {
  const users = getUsers();

  // Check if email exists
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email already registered');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    phone,
    role: 'member',
    status: 'pending',
    avatarColor: getRandomColor(),
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveUsers(users);
  return user;
}

export function findUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function verifyPassword(user: User, password: string): boolean {
  return bcrypt.compareSync(password, user.password);
}

export function updateUserStatus(userId: string, status: 'approved' | 'rejected'): User | null {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  users[idx].status = status;
  saveUsers(users);
  return users[idx];
}

export function updateUserRole(userId: string, role: 'member' | 'admin' | 'superadmin'): User | null {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  users[idx].role = role;
  saveUsers(users);
  return users[idx];
}

export function updateUserPermission(userId: string, permissionType: 'dataEntry' | 'spinLottery', value: boolean): User | null {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  if (permissionType === 'dataEntry') {
    users[idx].canDataEntry = value;
  } else if (permissionType === 'spinLottery') {
    users[idx].canSpinLottery = value;
  }
  saveUsers(users);
  return users[idx];
}

export function factoryResetData(): void {
  // Clear all contributions and lottery results
  saveContributions([]);
  saveLotteryResults([]);

  // Clear all users EXCEPT superadmin
  const users = getUsers();
  const superadmins = users.filter(u => u.role === 'superadmin');
  saveUsers(superadmins);
}

export function deleteUser(userId: string): boolean {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== userId);
  if (filtered.length === users.length) return false;
  saveUsers(filtered);
  return true;
}

export function adminCreateUser(name: string, email: string, password: string, phone: string): User {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email already registered');
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    phone,
    role: 'member',
    status: 'approved',
    avatarColor: getRandomColor(),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return user;
}

// ==========================================
// Contribution Operations
// ==========================================

export function addContribution(userId: string, month: string, amount: number, recordedBy: string): Contribution {
  const contributions = getContributions();

  // Check if already paid for this month
  const existing = contributions.find(c => c.userId === userId && c.month === month);
  if (existing) {
    throw new Error('Contribution already recorded for this month');
  }

  // Enforce new rules
  if (amount < 500) {
    throw new Error('Minimum deposit is 500 BDT');
  }

  const debt = getUserDebt(userId);
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

  contributions.push(contribution);
  saveContributions(contributions);
  return contribution;
}

export function deleteContribution(userId: string, month: string): boolean {
  const contributions = getContributions();
  const initialLength = contributions.length;
  const filtered = contributions.filter(c => !(c.userId === userId && c.month === month));
  
  if (filtered.length === initialLength) return false;
  
  saveContributions(filtered);
  return true;
}

export function getUserContributions(userId: string): Contribution[] {
  return getContributions().filter(c => c.userId === userId);
}

export function getContributionsForMonth(month: string): Contribution[] {
  return getContributions().filter(c => c.month === month);
}

// ==========================================
// Lottery Operations
// ==========================================

export function addLotteryResult(winnerId: string, winnerName: string, month: string, drawnBy: string): LotteryResult {
  const results = getLotteryResults();

  // Check if lottery already drawn for this month
  const existing = results.find(r => r.month === month);
  if (existing) {
    throw new Error('Lottery already drawn for this month');
  }

  const result: LotteryResult = {
    id: `lottery_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    winnerId,
    winnerName,
    month,
    prizeAmount: 10000,
    drawnAt: new Date().toISOString(),
    drawnBy,
  };

  results.push(result);
  saveLotteryResults(results);
  return result;
}

export function isEligibleForLottery(userId: string, currentMonth: string): boolean {
  // Check outstanding debt
  const debt = getUserDebt(userId);
  if (debt > 0) return false;

  // Check if paid at least 2000 BDT this month
  const contributions = getContributions();
  const currentMonthPaid = contributions
    .filter(c => c.userId === userId && c.month === currentMonth)
    .reduce((sum, c) => sum + c.amount, 0);

  if (currentMonthPaid < 2000) {
    return false;
  }

  return true;
}

export function getUserDebt(userId: string): number {
  const lotteryResults = getLotteryResults();
  const contributions = getContributions();

  const wins = lotteryResults.filter(r => r.winnerId === userId);
  if (wins.length === 0) return 0;

  let totalDebt = 0;
  for (const win of wins) {
    const winDate = new Date(win.drawnAt);
    const paymentsAfterWin = contributions.filter(
      c => c.userId === userId && new Date(c.paidAt) >= winDate
    );
    const totalPaidBack = paymentsAfterWin.reduce((sum, c) => sum + c.amount, 0);
    const debt = win.prizeAmount - totalPaidBack;
    if (debt > 0) totalDebt += debt;
  }

  return totalDebt;
}

// ==========================================
// Seed Super Admin (creates on first run)
// ==========================================

export function seedSuperAdmin(): void {
  const users = getUsers();
  const superAdminExists = users.some(u => u.role === 'superadmin');
  if (!superAdminExists) {
    const hashedPassword = bcrypt.hashSync('super2026', 10);
    const superAdmin: User = {
      id: 'user_superadmin_001',
      name: 'Super Admin',
      email: 'super@shomobay.com',
      password: hashedPassword,
      phone: '+880 1234-567890',
      role: 'superadmin',
      status: 'approved',
      avatarColor: '#6366f1',
      createdAt: new Date().toISOString(),
    };
    users.push(superAdmin);
    saveUsers(users);
    console.log('✅ Super Admin seeded: super@shomobay.com / super2026');
  }
}

// Seed on module load
seedSuperAdmin();
