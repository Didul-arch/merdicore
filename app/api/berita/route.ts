import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper: cek session admin (super_admin atau perangkat_desa)
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const role = session?.user?.role;
  if (!session || !['super_admin', 'perangkat_desa'].includes(role)) {
    return null;
  }
  return session;
}

// GET: Ambil berita dengan pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || ''; // 'draft' | 'published' | ''
    const offset = (page - 1) * limit;

    let berita;
    let countResult;

    // Build conditions
    const conditions: string[] = [];
    if (search) conditions.push('search');
    if (status) conditions.push('status');

    if (search && status) {
      const searchPattern = `%${search}%`;
      berita = await sql`
        SELECT b.id, b.judul, b.slug, b.gambar, b.status, b.created_at, b.updated_at,
               u.nama AS penulis_nama
        FROM berita b
        LEFT JOIN users u ON b.penulis_id = u.id
        WHERE (b.judul ILIKE ${searchPattern} OR b.konten ILIKE ${searchPattern})
          AND b.status = ${status}
        ORDER BY b.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*)::int AS total FROM berita
        WHERE (judul ILIKE ${searchPattern} OR konten ILIKE ${searchPattern})
          AND status = ${status}
      `;
    } else if (search) {
      const searchPattern = `%${search}%`;
      berita = await sql`
        SELECT b.id, b.judul, b.slug, b.gambar, b.status, b.created_at, b.updated_at,
               u.nama AS penulis_nama
        FROM berita b
        LEFT JOIN users u ON b.penulis_id = u.id
        WHERE b.judul ILIKE ${searchPattern} OR b.konten ILIKE ${searchPattern}
        ORDER BY b.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*)::int AS total FROM berita
        WHERE judul ILIKE ${searchPattern} OR konten ILIKE ${searchPattern}
      `;
    } else if (status) {
      berita = await sql`
        SELECT b.id, b.judul, b.slug, b.gambar, b.status, b.created_at, b.updated_at,
               u.nama AS penulis_nama
        FROM berita b
        LEFT JOIN users u ON b.penulis_id = u.id
        WHERE b.status = ${status}
        ORDER BY b.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*)::int AS total FROM berita WHERE status = ${status}
      `;
    } else {
      berita = await sql`
        SELECT b.id, b.judul, b.slug, b.gambar, b.status, b.created_at, b.updated_at,
               u.nama AS penulis_nama
        FROM berita b
        LEFT JOIN users u ON b.penulis_id = u.id
        ORDER BY b.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`SELECT COUNT(*)::int AS total FROM berita`;
    }

    const total = countResult[0].total;

    return NextResponse.json({
      success: true,
      data: berita,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data berita' }, { status: 500 });
  }
}

// POST: Tambah berita baru (harus admin)
export async function POST(request: Request) {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.judul || !body.slug || !body.konten) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap (judul, slug, konten wajib diisi)' }, { status: 400 });
    }

    // @ts-ignore
    const penulisId = session.user?.id || null;

    const result = await sql`
      INSERT INTO berita (judul, slug, konten, gambar, status, penulis_id)
      VALUES (${body.judul}, ${body.slug}, ${body.konten}, ${body.gambar || null}, ${body.status || 'draft'}, ${penulisId})
      RETURNING id, judul, slug, gambar, status, created_at
    `;

    return NextResponse.json({
      success: true,
      message: 'Berita berhasil ditambahkan',
      data: result[0],
    }, { status: 201 });

  } catch (error: any) {
    console.error(error);
    if (error.code === '23505') {
      return NextResponse.json({ success: false, message: 'Slug sudah digunakan' }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: 'Gagal menyimpan berita' }, { status: 500 });
  }
}
