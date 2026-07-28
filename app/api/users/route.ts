import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireRole } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// 1. GET: Mengambil data users dengan pagination
export async function GET(request: Request) {
  try {
    const session = await requireRole(['super_admin']);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Hanya super_admin yang diizinkan.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let users;
    let countResult;

    if (search) {
      const searchPattern = `%${search}%`;
      users = await sql`
        SELECT id, nama, email, role, created_at FROM users
        WHERE nama ILIKE ${searchPattern} OR email ILIKE ${searchPattern} OR role::text ILIKE ${searchPattern}
        ORDER BY id ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*)::int AS total FROM users
        WHERE nama ILIKE ${searchPattern} OR email ILIKE ${searchPattern} OR role::text ILIKE ${searchPattern}
      `;
    } else {
      users = await sql`
        SELECT id, nama, email, role, created_at FROM users
        ORDER BY id ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`SELECT COUNT(*)::int AS total FROM users`;
    }

    const total = countResult[0].total;

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 });
  }
}

// 2. POST: Menambahkan user baru
export async function POST(request: Request) {
  try {
    const session = await requireRole(['super_admin']);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Hanya super_admin yang diizinkan menambahkan user.' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.nama || !body.email || !body.role || !body.password) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap (nama, email, role, password wajib diisi)' }, { status: 400 });
    }

    // Enkripsi password menggunakan bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(body.password, salt);

    const result = await sql`
      INSERT INTO users (nama, email, role, password_hash) 
      VALUES (${body.nama}, ${body.email}, ${body.role}, ${passwordHash})
      RETURNING id, nama, email, role, created_at
    `;

    const newUser = result[0];

    return NextResponse.json({
      success: true,
      message: 'User berhasil ditambahkan',
      data: newUser
    }, { status: 201 });

  } catch (error: any) {
    console.error(error);
    // Tangkap error unique constraint jika email sudah ada
    if (error.code === '23505') {
      return NextResponse.json({ success: false, message: 'Email sudah terdaftar' }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: 'Gagal menyimpan data' }, { status: 500 });
  }
}
