import { NextResponse } from 'next/server';
import sql from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// 3. GET (Satu User)
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const userId = parseInt(id);

    const users = await sql`SELECT * FROM users WHERE id = ${userId}`;
    const user = users[0];

    if (!user) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 });
  }
}

// 4. PUT: Mengubah data user (Update)
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const userId = parseInt(id);
    const body = await request.json();

    const result = await sql`
      UPDATE users 
      SET nama = ${body.nama}, role = ${body.role} 
      WHERE id = ${userId}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User berhasil diubah',
      data: result[0] 
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengubah data' }, { status: 500 });
  }
}

// 5. DELETE: Menghapus user
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const userId = parseInt(id);

    const result = await sql`DELETE FROM users WHERE id = ${userId} RETURNING *`;
    
    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User berhasil dihapus',
      data: result[0]
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus data' }, { status: 500 });
  }
}
