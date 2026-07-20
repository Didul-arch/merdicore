import { NextResponse } from 'next/server';
import sql from '@/lib/db';

// 1. GET: Mengambil semua data users
export async function GET() {
  try {
    const users = await sql`SELECT * FROM users ORDER BY id ASC`;
    
    return NextResponse.json({
      success: true,
      data: users
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 });
  }
}

// 2. POST: Menambahkan user baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validasi sederhana
    if (!body.nama || !body.email || !body.role) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap' }, { status: 400 });
    }

    // Insert menggunakan Raw SQL (Aman dari SQL Injection karena syntax literal `${}`)
    const result = await sql`
      INSERT INTO users (nama, email, role, password_hash) 
      VALUES (${body.nama}, ${body.email}, ${body.role}, 'hash_sementara')
      RETURNING *
    `;

    const newUser = result[0];

    return NextResponse.json({
      success: true,
      message: 'User berhasil ditambahkan',
      data: newUser
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal menyimpan data' }, { status: 500 });
  }
}
