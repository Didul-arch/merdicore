import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';

// GET: Ambil daftar pesan dengan pagination (Admin Only)
export async function GET(request: Request) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // Construct conditions
    const conditions = [];
    if (search) conditions.push(sql`(nama_pengirim ILIKE ${'%' + search + '%'} OR email ILIKE ${'%' + search + '%'} OR isi_pesan ILIKE ${'%' + search + '%'})`);
    if (status) conditions.push(sql`status = ${status}`);

    let whereClause = sql``;
    if (conditions.length > 0) {
      whereClause = sql`WHERE ${conditions[0]}`;
      for (let i = 1; i < conditions.length; i++) {
        whereClause = sql`${whereClause} AND ${conditions[i]}`;
      }
    }

    const data = await sql`
      SELECT * FROM pesan
      ${whereClause}
      ORDER BY id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*)::int AS total FROM pesan
      ${whereClause}
    `;

    const total = countResult[0].total;

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data pesan' }, { status: 500 });
  }
}

// POST: Kirim pesan baru (Public)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const nama_pengirim = typeof body.nama_pengirim === 'string' ? body.nama_pengirim.trim() : '';
    const isi_pesan = typeof body.isi_pesan === 'string' ? body.isi_pesan.trim() : '';
    const email = typeof body.email === 'string' && body.email.trim() ? body.email.trim() : null;
    const no_hp = typeof body.no_hp === 'string' && body.no_hp.trim() ? body.no_hp.trim() : null;

    if (!nama_pengirim || !isi_pesan) {
      return NextResponse.json({ success: false, message: 'Nama dan isi pesan wajib diisi' }, { status: 400 });
    }
    if (nama_pengirim.length > 150) {
      return NextResponse.json({ success: false, message: 'Nama maksimal 150 karakter' }, { status: 400 });
    }
    if (isi_pesan.length > 1000) {
      return NextResponse.json({ success: false, message: 'Isi pesan maksimal 1000 karakter' }, { status: 400 });
    }
    if (email && email.length > 255) {
      return NextResponse.json({ success: false, message: 'Email maksimal 255 karakter' }, { status: 400 });
    }
    if (no_hp && no_hp.length > 20) {
      return NextResponse.json({ success: false, message: 'Nomor HP maksimal 20 karakter' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO pesan (nama_pengirim, email, no_hp, isi_pesan)
      VALUES (${nama_pengirim}, ${email}, ${no_hp}, ${isi_pesan})
      RETURNING id, nama_pengirim, created_at
    `;

    return NextResponse.json({
      success: true,
      message: 'Pesan berhasil dikirim',
      data: result[0],
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengirim pesan' }, { status: 500 });
  }
}
