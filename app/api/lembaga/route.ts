import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper: cek session admin
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const role = session?.user?.role;
  if (!session || !['super_admin', 'perangkat_desa'].includes(role)) {
    return false;
  }
  return true;
}

// GET: Ambil daftar lembaga dengan pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let data;
    let countResult;

    if (search) {
      const searchPattern = `%${search}%`;
      data = await sql`
        SELECT *
        FROM lembaga
        WHERE nama_lengkap ILIKE ${searchPattern} 
           OR singkatan ILIKE ${searchPattern} 
           OR nama_ketua ILIKE ${searchPattern}
        ORDER BY id ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*)::int AS total FROM lembaga
        WHERE nama_lengkap ILIKE ${searchPattern} 
           OR singkatan ILIKE ${searchPattern} 
           OR nama_ketua ILIKE ${searchPattern}
      `;
    } else {
      data = await sql`
        SELECT *
        FROM lembaga
        ORDER BY id ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`SELECT COUNT(*)::int AS total FROM lembaga`;
    }

    const total = countResult[0].total;

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data lembaga' }, { status: 500 });
  }
}

// POST: Tambah lembaga (harus admin)
export async function POST(request: Request) {
  try {
    const isAuthorized = await checkAdmin();
    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.nama_lengkap) {
      return NextResponse.json({ success: false, message: 'Nama lengkap lembaga wajib diisi' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO lembaga (nama_lengkap, singkatan, nama_ketua, jumlah_anggota, deskripsi, gambar)
      VALUES (
        ${body.nama_lengkap}, 
        ${body.singkatan || null}, 
        ${body.nama_ketua || null}, 
        ${body.jumlah_anggota || 0}, 
        ${body.deskripsi || null}, 
        ${body.gambar || null}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      message: 'Lembaga berhasil ditambahkan',
      data: result[0],
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal menyimpan data lembaga' }, { status: 500 });
  }
}
