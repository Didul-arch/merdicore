import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const passwordLama = typeof body.passwordLama === 'string' ? body.passwordLama : '';
    const passwordBaru = typeof body.passwordBaru === 'string' ? body.passwordBaru : '';

    if (!passwordLama || !passwordBaru) {
      return NextResponse.json({ success: false, message: 'Password lama dan baru wajib diisi' }, { status: 400 });
    }
    if (passwordBaru.length < 8) {
      return NextResponse.json({ success: false, message: 'Password baru minimal 8 karakter' }, { status: 400 });
    }

    const userId = Number(session.user.id);
    const rows = await sql`SELECT password_hash FROM users WHERE id = ${userId}`;
    const user = rows[0];
    if (!user || !(await bcrypt.compare(passwordLama, user.password_hash))) {
      return NextResponse.json({ success: false, message: 'Password lama salah' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(passwordBaru, 10);
    await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${userId}`;

    return NextResponse.json({ success: true, message: 'Password berhasil diubah' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengubah password' }, { status: 500 });
  }
}
