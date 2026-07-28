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
    return null;
  }
  return session;
}

// GET: Ambil UMKM dengan pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let umkm;
    let countResult;

    if (search) {
      const searchPattern = `%${search}%`;
      umkm = await sql`
        SELECT um.id, um.nama_usaha, um.deskripsi, um.no_whatsapp, um.alamat, um.gambar, um.galeri_foto, um.created_at,
               u.nama AS pemilik_nama
        FROM umkm um
        LEFT JOIN users u ON um.pemilik_id = u.id
        WHERE um.nama_usaha ILIKE ${searchPattern} OR um.alamat ILIKE ${searchPattern} OR u.nama ILIKE ${searchPattern}
        ORDER BY um.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*)::int AS total FROM umkm um
        LEFT JOIN users u ON um.pemilik_id = u.id
        WHERE um.nama_usaha ILIKE ${searchPattern} OR um.alamat ILIKE ${searchPattern} OR u.nama ILIKE ${searchPattern}
      `;
    } else {
      umkm = await sql`
        SELECT um.id, um.nama_usaha, um.deskripsi, um.no_whatsapp, um.alamat, um.gambar, um.galeri_foto, um.created_at,
               u.nama AS pemilik_nama
        FROM umkm um
        LEFT JOIN users u ON um.pemilik_id = u.id
        ORDER BY um.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`SELECT COUNT(*)::int AS total FROM umkm`;
    }

    const total = countResult[0].total;

    return NextResponse.json({
      success: true,
      data: umkm,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data UMKM' }, { status: 500 });
  }
}

// POST: Tambah UMKM baru (harus admin)
export async function POST(request: Request) {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.nama_usaha) {
      return NextResponse.json({ success: false, message: 'Nama usaha wajib diisi' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO umkm (nama_usaha, pemilik_id, deskripsi, no_whatsapp, alamat, gambar, galeri_foto)
      VALUES (${body.nama_usaha}, ${body.pemilik_id || null}, ${body.deskripsi || null}, ${body.no_whatsapp || null}, ${body.alamat || null}, ${body.gambar || null}, ${body.galeri_foto || []})
      RETURNING id, nama_usaha, deskripsi, no_whatsapp, alamat, gambar, galeri_foto, created_at
    `;

    return NextResponse.json({
      success: true,
      message: 'UMKM berhasil ditambahkan',
      data: result[0],
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal menyimpan data UMKM' }, { status: 500 });
  }
}
