import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import { updateUserPermission } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromCookies();
    // Only superadmin can assign permissions
    if (!auth || auth.role !== 'superadmin') {
      return NextResponse.json({ success: false, error: 'Unauthorized. Only Super Admin can modify permissions.' }, { status: 403 });
    }

    const { userId, permissionType, value } = await request.json();
    
    if (!userId || !permissionType || value === undefined) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    if (permissionType !== 'dataEntry' && permissionType !== 'spinLottery') {
      return NextResponse.json({ success: false, error: 'Invalid permission type' }, { status: 400 });
    }

    const updatedUser = await updateUserPermission(userId, permissionType, value);
    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
