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

// GET: Ambil perangkat desa dengan pagination
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
        SELECT pd.id, pd.user_id, pd.jabatan, pd.nip, pd.pendidikan_terakhir, pd.foto, pd.masa_jabatan,
               u.nama AS nama_user, u.email AS email_user
        FROM perangkat_desa pd
        LEFT JOIN users u ON pd.user_id = u.id
        WHERE pd.jabatan ILIKE ${searchPattern} OR u.nama ILIKE ${searchPattern} OR pd.nip ILIKE ${searchPattern}
        ORDER BY pd.id ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*)::int AS total FROM perangkat_desa pd
        LEFT JOIN users u ON pd.user_id = u.id
        WHERE pd.jabatan ILIKE ${searchPattern} OR u.nama ILIKE ${searchPattern} OR pd.nip ILIKE ${searchPattern}
      `;
    } else {
      data = await sql`
        SELECT pd.id, pd.user_id, pd.jabatan, pd.nip, pd.pendidikan_terakhir, pd.foto, pd.masa_jabatan,
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

// POST: Tambah perangkat desa (harus admin)
export async function POST(request: Request) {
  try {
    const isAuthorized = await checkAdmin();
    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.jabatan) {
      return NextResponse.json({ success: false, message: 'Jabatan wajib diisi' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO perangkat_desa (user_id, jabatan, nip, pendidikan_terakhir, foto, masa_jabatan)
      VALUES (${body.user_id || null}, ${body.jabatan}, ${body.nip || null}, ${body.pendidikan_terakhir || null}, ${body.foto || null}, ${body.masa_jabatan || null})
      RETURNING id, user_id, jabatan, nip, pendidikan_terakhir, foto, masa_jabatan
    `;

    return NextResponse.json({
      success: true,
      message: 'Perangkat desa berhasil ditambahkan',
      data: result[0],
    }, { status: 201 });

  } catch (error: any) {
    console.error(error);
    if (error.code === '23505') {
      return NextResponse.json({ success: false, message: 'User tersebut sudah terdaftar sebagai perangkat desa' }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: 'Gagal menyimpan data' }, { status: 500 });
  }
}
