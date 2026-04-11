import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import { adminCreateUser, deleteUser, findUserById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth || (auth.role !== 'admin' && auth.role !== 'superadmin')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();

    // Check if this is a delete action
    if (body.action === 'delete') {
      const { userId } = body;
      if (!userId) {
        return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
      }

      const user = await findUserById(userId);
      if (user?.role === 'superadmin') {
         return NextResponse.json({ success: false, error: 'Cannot delete superadmin' }, { status: 400 });
      }

      const success = await deleteUser(userId);
      if (!success) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    }

    // Default: Create user
    const { name, email, password, phone } = body;
    if (!name || !email || !password || !phone) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const user = await adminCreateUser(name, email, password, phone);
    return NextResponse.json({ success: true, data: { id: user.id } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
