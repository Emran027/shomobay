// ==========================================
// GET /api/admin/pending - Get pending users
// ==========================================

import { NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import { getUsers } from '@/lib/db';

export async function GET() {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (auth.role !== 'admin' && auth.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const pendingUsers = (await getUsers())
      .filter(u => u.status === 'pending')
      .map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        avatarColor: u.avatarColor,
        createdAt: u.createdAt,
      }));

    return NextResponse.json({ success: true, data: pendingUsers });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending users' },
      { status: 500 }
    );
  }
}
