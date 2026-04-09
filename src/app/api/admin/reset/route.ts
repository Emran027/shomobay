import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import { factoryResetData, findUserById, verifyPassword } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromCookies();
    // Only superadmin can reset
    if (!auth || auth.role !== 'superadmin') {
      return NextResponse.json({ success: false, error: 'Unauthorized. Only Super Admin can reset data.' }, { status: 403 });
    }

    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }

    const user = findUserById(auth.userId);
    if (!user || user.role !== 'superadmin' || !verifyPassword(user, password)) {
      return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 403 });
    }

    // Factory Reset
    factoryResetData();

    return NextResponse.json({ success: true, message: 'System has been reset' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
