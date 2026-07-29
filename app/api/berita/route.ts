import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';
import { bersihkanHtml } from '@/lib/sanitize';
import { adaIsinya } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || ''; // 'draft' | 'published' | ''

    let berita;
    let countResult;

    // Build conditions
    const conditions: string[] = [];
    if (search) conditions.push('search');
    if (status) conditions.push('status');

    if (search && status) {
      const searchPattern = `%${search}%`;
      berita = await sql`
        SELECT b.id, b.judul, b.slug, b.gambar, b.status, b.views, b.created_at, b.updated_at,
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
        SELECT b.id, b.judul, b.slug, b.gambar, b.status, b.views, b.created_at, b.updated_at,
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
        SELECT b.id, b.judul, b.slug, b.gambar, b.status, b.views, b.created_at, b.updated_at,
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
        SELECT b.id, b.judul, b.slug, b.gambar, b.status, b.views, b.created_at, b.updated_at,
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

export async function POST(request: Request) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Disaring DULU baru divalidasi: kiriman yang isinya cuma "<script>"
    // akan jadi string kosong setelah disaring, dan itu memang harus ditolak.
    const konten = bersihkanHtml(body.konten || '');

    if (!body.judul || !body.slug || !adaIsinya(konten)) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap (judul, slug, konten wajib diisi)' }, { status: 400 });
    }

    const penulisId = session.user?.id || null;

    const result = await sql`
      INSERT INTO berita (judul, slug, konten, gambar, status, penulis_id)
      VALUES (${body.judul}, ${body.slug}, ${konten}, ${body.gambar || null}, ${body.status || 'draft'}, ${penulisId})
      RETURNING id, judul, slug, gambar, status, created_at
    `;

    return NextResponse.json({
      success: true,
      message: 'Berita berhasil ditambahkan',
      data: result[0],
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json({ success: false, message: 'Slug sudah digunakan' }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: 'Gagal menyimpan berita' }, { status: 500 });
  }
}
