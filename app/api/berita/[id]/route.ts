import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET: Ambil satu berita berdasarkan ID
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const beritaId = parseInt(id);

    const rows = await sql`
      SELECT b.*, u.nama AS penulis_nama
      FROM berita b
      LEFT JOIN users u ON b.penulis_id = u.id
      WHERE b.id = ${beritaId}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Berita tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 });
  }
}

// PUT: Update berita
export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const beritaId = parseInt(id);
    const body = await request.json();

    if (!body.judul || !body.konten) {
      return NextResponse.json({ success: false, message: 'Judul dan konten wajib diisi' }, { status: 400 });
    }

    const result = await sql`
      UPDATE berita
      SET judul = ${body.judul},
          slug = ${body.slug || ''},
          konten = ${body.konten},
          gambar = ${body.gambar || null},
          status = ${body.status || 'draft'},
          updated_at = NOW()
      WHERE id = ${beritaId}
      RETURNING id, judul, slug, gambar, status, created_at, updated_at
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Berita tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Berita berhasil diperbarui',
      data: result[0],
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengubah berita' }, { status: 500 });
  }
}

// DELETE: Hapus berita
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const beritaId = parseInt(id);

    const result = await sql`DELETE FROM berita WHERE id = ${beritaId} RETURNING id, judul`;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Berita tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Berita berhasil dihapus',
      data: result[0],
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus berita' }, { status: 500 });
  }
}

// PATCH: Increment views (public — no auth needed)
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const beritaId = parseInt(id);

    const result = await sql`
      UPDATE berita
      SET views = views + 1
      WHERE id = ${beritaId}
      RETURNING id, views
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Berita tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengupdate views' }, { status: 500 });
  }
}
