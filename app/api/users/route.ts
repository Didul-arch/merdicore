import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';
import bcrypt from 'bcryptjs';

// 1. GET: Mengambil data users dengan pagination
export async function GET(request: Request) {
  try {
    const session = await requireRole(['super_admin']);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Hanya super_admin yang diizinkan.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const search = searchParams.get('search') || '';

    let users;
    let countResult;

    // LEFT JOIN ke perangkat_desa: satu halaman ini sekarang nampilin akun
    // sekaligus jabatannya (kalau dia diangkat jadi perangkat desa).
    // pd_id dipakai frontend buat tau ini nambah jabatan baru (PUT) atau ubah
    // yang sudah ada (POST) di /api/perangkat-desa.
    if (search) {
      const searchPattern = `%${search}%`;
      users = await sql`
        SELECT u.id, u.nama, u.email, u.role, u.no_hp, u.created_at,
               pd.id AS pd_id, pd.jabatan, pd.nip, pd.pendidikan_terakhir,
               pd.foto, pd.masa_jabatan
        FROM users u
        LEFT JOIN perangkat_desa pd ON pd.user_id = u.id
        WHERE u.nama ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern}
           OR u.role::text ILIKE ${searchPattern} OR pd.jabatan ILIKE ${searchPattern}
        ORDER BY u.id ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*)::int AS total FROM users u
        LEFT JOIN perangkat_desa pd ON pd.user_id = u.id
        WHERE u.nama ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern}
           OR u.role::text ILIKE ${searchPattern} OR pd.jabatan ILIKE ${searchPattern}
      `;
    } else {
      users = await sql`
        SELECT u.id, u.nama, u.email, u.role, u.no_hp, u.created_at,
               pd.id AS pd_id, pd.jabatan, pd.nip, pd.pendidikan_terakhir,
               pd.foto, pd.masa_jabatan
        FROM users u
        LEFT JOIN perangkat_desa pd ON pd.user_id = u.id
        ORDER BY u.id ASC
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

    // no_hp wajib buat user BARU. Di database kolomnya nullable supaya user
    // lama (yang dibuat sebelum kolom ini ada) tetap valid.
    const noHp = typeof body.no_hp === 'string' ? body.no_hp.trim() : '';

    if (!body.nama || !body.email || !body.role || !body.password || !noHp) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap (nama, email, no. HP, role, password wajib diisi)' }, { status: 400 });
    }
    if (noHp.length > 20) {
      return NextResponse.json({ success: false, message: 'Nomor HP maksimal 20 karakter' }, { status: 400 });
    }

    // Enkripsi password menggunakan bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(body.password, salt);

    const result = await sql`
      INSERT INTO users (nama, email, role, password_hash, no_hp)
      VALUES (${body.nama}, ${body.email}, ${body.role}, ${passwordHash}, ${noHp})
      RETURNING id, nama, email, role, no_hp, created_at
    `;

    const newUser = result[0];

    return NextResponse.json({
      success: true,
      message: 'User berhasil ditambahkan',
      data: newUser
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    // Tangkap error unique constraint jika email sudah ada
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json({ success: false, message: 'Email sudah terdaftar' }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: 'Gagal menyimpan data' }, { status: 500 });
  }
}
