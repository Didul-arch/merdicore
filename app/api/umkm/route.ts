import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';
import { ambilSrcMapsEmbed } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const search = searchParams.get('search') || '';

    let umkm;
    let countResult;

    if (search) {
      const searchPattern = `%${search}%`;
      umkm = await sql`
        SELECT um.id, um.nama_usaha, um.deskripsi, um.no_whatsapp, um.alamat, um.gambar, um.gambar_fokus, um.galeri_foto, um.peta_embed_url, um.created_at,
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
        SELECT um.id, um.nama_usaha, um.deskripsi, um.no_whatsapp, um.alamat, um.gambar, um.gambar_fokus, um.galeri_foto, um.peta_embed_url, um.created_at,
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

export async function POST(request: Request) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.nama_usaha) {
      return NextResponse.json({ success: false, message: 'Nama usaha wajib diisi' }, { status: 400 });
    }

    const petaEmbedUrl = body.peta_embed_url ? ambilSrcMapsEmbed(body.peta_embed_url) : null;
    if (body.peta_embed_url && !petaEmbedUrl) {
      return NextResponse.json({ success: false, message: 'Link/kode sematan Google Maps tidak valid' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO umkm (nama_usaha, pemilik_id, deskripsi, no_whatsapp, alamat, gambar, gambar_fokus, galeri_foto, peta_embed_url)
      VALUES (${body.nama_usaha}, ${body.pemilik_id || null}, ${body.deskripsi || null}, ${body.no_whatsapp || null}, ${body.alamat || null}, ${body.gambar || null}, ${body.gambar_fokus || null}, ${body.galeri_foto || []}, ${petaEmbedUrl})
      RETURNING id, nama_usaha, deskripsi, no_whatsapp, alamat, gambar, gambar_fokus, galeri_foto, peta_embed_url, created_at
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
