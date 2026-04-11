// ==========================================
// POST /api/contributions - Record a contribution
// GET /api/contributions - Get all contributions
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import { addContribution, getContributions, findUserById } from '@/lib/db';

export async function GET() {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const contributions = await getContributions();
    return NextResponse.json({ success: true, data: contributions });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const currentUser = await findUserById(auth.userId);
    const hasDataEntryAuth = currentUser?.canDataEntry || auth.role === 'admin' || auth.role === 'superadmin';

    if (!hasDataEntryAuth) {
      return NextResponse.json(
        { success: false, error: 'You do not have data entry permission' },
        { status: 403 }
      );
    }

    const { action, userId, month, amount } = await request.json();

    if (action === 'delete') {
      if (auth.role !== 'superadmin' && auth.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Only admins can delete records' }, { status: 403 });
      }
      const db = await import('@/lib/db');
      await db.deleteContribution(userId, month);
      return NextResponse.json({ success: true });
    }

    if (!userId || !month || !amount) {
      return NextResponse.json(
        { success: false, error: 'userId, month, and amount are required' },
        { status: 400 }
      );
    }

    // Verify user exists and is approved
    const user = await findUserById(userId);
    if (!user || user.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'User not found or not approved' },
        { status: 400 }
      );
    }

    const contribution = await addContribution(userId, month, Number(amount), auth.userId);

    return NextResponse.json({ success: true, data: contribution });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record contribution';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
