import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const role = session?.user?.role;
  return session && ['super_admin', 'perangkat_desa'].includes(role);
}

// GET: Ambil daftar pesan dengan pagination (Admin Only)
export async function GET(request: Request) {
  try {
    const isAuthorized = await checkAdmin();
    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const offset = (page - 1) * limit;

    let data;
    let countResult;
    
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

    data = await sql`
      SELECT * FROM pesan
      ${whereClause}
      ORDER BY id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    countResult = await sql`
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

    if (!body.nama_pengirim || !body.isi_pesan) {
      return NextResponse.json({ success: false, message: 'Nama dan isi pesan wajib diisi' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO pesan (nama_pengirim, email, no_hp, isi_pesan)
      VALUES (
        ${body.nama_pengirim}, 
        ${body.email || null}, 
        ${body.no_hp || null}, 
        ${body.isi_pesan}
      )
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
