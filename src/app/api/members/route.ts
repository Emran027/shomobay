// ==========================================
// GET /api/members - Get all member summaries
// ==========================================

import { NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import { getUsers, getContributions, getLotteryResults, isEligibleForLottery, getUserDebt } from '@/lib/db';
import { MemberSummary } from '@/lib/types';

export async function GET() {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const users = getUsers().filter(u => u.status === 'approved' && u.role === 'member');
    const contributions = getContributions();
    const lotteryResults = getLotteryResults();
    
    // Using UTC current month for accurate calculation context across requests
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const summaries: MemberSummary[] = users.map(user => {
      const userContribs = contributions.filter(c => c.userId === user.id);
      const userWins = lotteryResults.filter(r => r.winnerId === user.id);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          avatarColor: user.avatarColor,
          createdAt: user.createdAt,
          canDataEntry: user.canDataEntry,
          canSpinLottery: user.canSpinLottery,
        },
        totalContributed: userContribs.reduce((sum, c) => sum + c.amount, 0),
        totalDebt: getUserDebt(user.id),
        monthsPaid: userContribs.map(c => c.month),
        lotteryWins: userWins,
        isEligibleForLottery: isEligibleForLottery(user.id, currentMonth),
        currentMonthDeposit: userContribs.filter(c => c.month === currentMonth).reduce((sum, c) => sum + c.amount, 0),
      };
    });

    return NextResponse.json({ success: true, data: summaries });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}
