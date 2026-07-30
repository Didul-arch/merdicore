import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';
import { bersihkanHtml } from '@/lib/sanitize';
import { adaIsinya } from '@/lib/utils';
import { hapusGambar, hapusGambarYangDilepas, kumpulkanGambar } from '@/lib/storage';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Dipakai halaman edit. Query daftar sengaja gak ikut ambil kolom konten
// (isinya panjang, mubazir dikirim buat semua baris), jadi form edit ambil
// satu data lengkap dari sini.
export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const rows = await sql`
      SELECT b.id, b.judul, b.slug, b.konten, b.gambar, b.gambar_fokus, b.status, b.views,
             b.created_at, b.updated_at, u.nama AS penulis_nama
      FROM berita b
      LEFT JOIN users u ON b.penulis_id = u.id
      WHERE b.id = ${parseInt(id)}
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

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const beritaId = parseInt(id);
    const body = await request.json();

    const konten = bersihkanHtml(body.konten || '');

    if (!body.judul || !adaIsinya(konten)) {
      return NextResponse.json({ success: false, message: 'Judul dan konten wajib diisi' }, { status: 400 });
    }

    // Ambil kondisi LAMA dulu, buat dibandingkan setelah update.
    const sebelum = await sql`SELECT gambar, konten FROM berita WHERE id = ${beritaId}`;

    const result = await sql`
      UPDATE berita
      SET judul = ${body.judul},
          slug = ${body.slug || ''},
          konten = ${konten},
          gambar = ${body.gambar || null},
          gambar_fokus = ${body.gambar_fokus || null},
          status = ${body.status || 'draft'},
          updated_at = NOW()
      WHERE id = ${beritaId}
      RETURNING id, judul, slug, gambar, gambar_fokus, status, created_at, updated_at
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Berita tidak ditemukan' }, { status: 404 });
    }

    // Gambar yang tadinya dipakai tapi sekarang sudah tidak, ikut dihapus dari
    // storage. Dijalankan SETELAH update berhasil supaya file tidak hilang
    // percuma kalau update-nya gagal.
    await hapusGambarYangDilepas(
      [sebelum[0]?.gambar as string, sebelum[0]?.konten as string],
      [body.gambar, konten],
    );

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

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const beritaId = parseInt(id);

    // RETURNING sekalian ambil kolom gambarnya, supaya file-nya bisa ikut
    // dihapus tanpa perlu query tambahan.
    const result = await sql`
      DELETE FROM berita WHERE id = ${beritaId}
      RETURNING id, judul, gambar, konten
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Berita tidak ditemukan' }, { status: 404 });
    }

    await hapusGambar(kumpulkanGambar(result[0].gambar as string, result[0].konten as string));

    return NextResponse.json({
      success: true,
      message: 'Berita berhasil dihapus',
      data: { id: result[0].id, judul: result[0].judul },
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus berita' }, { status: 500 });
  }
}
