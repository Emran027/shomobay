// ==========================================
// JWT Authentication Utilities
// ==========================================

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { AuthPayload } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'somiti-super-secret-key-2026-change-in-production';
const TOKEN_EXPIRY = '7d';
const COOKIE_NAME = 'somiti_auth_token';

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export async function getAuthFromCookies(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function getTokenCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}

export { COOKIE_NAME };
