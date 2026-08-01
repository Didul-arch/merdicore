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

    let data;
    let countResult;

    if (search) {
      const searchPattern = `%${search}%`;
      data = await sql`
        SELECT *
        FROM regulasi
        WHERE judul ILIKE ${searchPattern} OR nomor ILIKE ${searchPattern}
        ORDER BY jenis ASC, created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*)::int AS total FROM regulasi
        WHERE judul ILIKE ${searchPattern} OR nomor ILIKE ${searchPattern}
      `;
    } else {
      data = await sql`
        SELECT *
        FROM regulasi
        ORDER BY jenis ASC, created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`SELECT COUNT(*)::int AS total FROM regulasi`;
    }

    const total = countResult[0].total;

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data regulasi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.judul) {
      return NextResponse.json({ success: false, message: 'Judul wajib diisi' }, { status: 400 });
    }
    if (body.jenis !== 'peraturan' && body.jenis !== 'surat') {
      return NextResponse.json({ success: false, message: 'Jenis harus peraturan atau surat' }, { status: 400 });
    }

    const isPeraturan = body.jenis === 'peraturan';
    const deskripsiBersih = bersihkanHtml(body.deskripsi || '');
    const deskripsi = adaIsinya(deskripsiBersih) ? deskripsiBersih : null;

    const result = await sql`
      INSERT INTO regulasi (jenis, judul, nomor, tahun, kategori, status, deskripsi, file_url)
      VALUES (
        ${body.jenis},
        ${body.judul},
        ${isPeraturan ? (body.nomor || null) : null},
        ${isPeraturan ? (body.tahun || null) : null},
        ${isPeraturan ? (body.kategori || null) : null},
        ${isPeraturan ? (body.status || null) : null},
        ${deskripsi},
        ${body.file_url || null}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      message: 'Regulasi berhasil ditambahkan',
      data: result[0],
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal menyimpan data regulasi' }, { status: 500 });
  }
}
