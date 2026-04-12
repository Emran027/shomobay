// ==========================================
// GET /api/lottery - Get lottery results
// POST /api/lottery - Record lottery result
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import { addLotteryResult, getLotteryResults, getUsers, isEligibleForLottery, findUserById } from '@/lib/db';

export async function GET() {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const results = await getLotteryResults();
    return NextResponse.json({ success: true, data: results });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lottery results' },
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
    const hasSpinAuth = currentUser?.canSpinLottery || auth.role === 'superadmin';

    if (!hasSpinAuth) {
      return NextResponse.json(
        { success: false, error: 'Only the authorized spinner can record lottery results' },
        { status: 403 }
      );
    }

    const { winnerId, month, prizeAmount } = await request.json();
    if (!winnerId || !month) {
      return NextResponse.json(
        { success: false, error: 'winnerId and month are required' },
        { status: 400 }
      );
    }

    // Verify the winner is eligible
    // Using UTC current month for accurate calculation context across requests
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    if (!await isEligibleForLottery(winnerId, currentMonth)) {
      return NextResponse.json(
        { success: false, error: 'This member is not eligible (has outstanding debt or insufficient monthly deposit)' },
        { status: 400 }
      );
    }

    // Get winner's name
    const users = await getUsers();
    const winner = users.find(u => u.id === winnerId);
    if (!winner || winner.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'Winner not found or not approved' },
        { status: 400 }
      );
    }

    const result = await addLotteryResult(winnerId, winner.name, month, auth.userId, prizeAmount);

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record lottery';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
