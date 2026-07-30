import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const search = searchParams.get('search') || '';

    let data;
    let countResult;

    if (search) {
      const searchPattern = `%${search}%`;
      data = await sql`
        SELECT pd.id, pd.user_id, pd.nama, pd.no_hp, pd.jabatan, pd.nip, pd.pendidikan_terakhir, pd.foto, pd.foto_fokus, pd.masa_jabatan,
               u.nama AS nama_user, u.email AS email_user
        FROM perangkat_desa pd
        LEFT JOIN users u ON pd.user_id = u.id
        WHERE pd.nama ILIKE ${searchPattern} OR pd.jabatan ILIKE ${searchPattern} OR pd.nip ILIKE ${searchPattern}
        ORDER BY pd.id ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*)::int AS total FROM perangkat_desa pd
        LEFT JOIN users u ON pd.user_id = u.id
        WHERE pd.nama ILIKE ${searchPattern} OR pd.jabatan ILIKE ${searchPattern} OR pd.nip ILIKE ${searchPattern}
      `;
    } else {
      data = await sql`
        SELECT pd.id, pd.user_id, pd.nama, pd.no_hp, pd.jabatan, pd.nip, pd.pendidikan_terakhir, pd.foto, pd.foto_fokus, pd.masa_jabatan,
               u.nama AS nama_user, u.email AS email_user
        FROM perangkat_desa pd
        LEFT JOIN users u ON pd.user_id = u.id
        ORDER BY pd.id ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`SELECT COUNT(*)::int AS total FROM perangkat_desa`;
    }

    const total = countResult[0].total;

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data perangkat desa' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const noHp = typeof body.no_hp === 'string' ? body.no_hp.trim() : '';

    if (!body.nama || !noHp || !body.jabatan) {
      return NextResponse.json({ success: false, message: 'Nama, no. HP, dan jabatan wajib diisi' }, { status: 400 });
    }

    // Akun login OPSIONAL: perangkat desa boleh tampil di halaman publik
    // tanpa bisa login ke dashboard sama sekali.
    const userId = body.user_id ? Number(body.user_id) : null;
    if (userId !== null && (!Number.isInteger(userId) || userId <= 0)) {
      return NextResponse.json({ success: false, message: 'Akun yang dipilih tidak valid' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO perangkat_desa (user_id, nama, no_hp, jabatan, nip, pendidikan_terakhir, foto, foto_fokus, masa_jabatan)
      VALUES (${userId}, ${body.nama}, ${noHp}, ${body.jabatan}, ${body.nip || null}, ${body.pendidikan_terakhir || null}, ${body.foto || null}, ${body.foto_fokus || null}, ${body.masa_jabatan || null})
      RETURNING id, user_id, nama, no_hp, jabatan, nip, pendidikan_terakhir, foto, foto_fokus, masa_jabatan
    `;

    return NextResponse.json({
      success: true,
      message: 'Perangkat desa berhasil ditambahkan',
      data: result[0],
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json({ success: false, message: 'User tersebut sudah terdaftar sebagai perangkat desa' }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: 'Gagal menyimpan data' }, { status: 500 });
  }
}
