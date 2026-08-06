import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';
import { bersihkanHtml } from '@/lib/sanitize';
import { adaIsinya, ambilSrcMapsEmbed } from '@/lib/utils';

export async function GET() {
  const session = await requireRole(ADMIN_ROLES);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const rows = await sql`SELECT * FROM pengaturan_desa WHERE id = 1`;
  return NextResponse.json({ success: true, data: rows[0] }, { status: 200 });
}

export async function PUT(request: Request) {
  const session = await requireRole(ADMIN_ROLES);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const sejarahBersih = bersihkanHtml(body.sejarah || '');
  const sejarah = adaIsinya(sejarahBersih) ? sejarahBersih : null;
  const misi: string[] = Array.isArray(body.misi)
    ? body.misi.map((m: unknown) => String(m).trim()).filter(Boolean)
    : [];
  const petaEmbedUrl = body.peta_embed_url ? ambilSrcMapsEmbed(body.peta_embed_url) : null;

  const result = await sql`
    UPDATE pengaturan_desa
    SET sejarah = ${sejarah},
        visi = ${body.visi || null},
        misi = ${misi},
        alamat_kantor = ${body.alamat_kantor || null},
        jam_pelayanan = ${body.jam_pelayanan || null},
        jam_pelayanan_catatan = ${body.jam_pelayanan_catatan || null},
        telepon = ${body.telepon || null},
        email = ${body.email || null},
        peta_embed_url = ${petaEmbedUrl},
        updated_at = now()
    WHERE id = 1
    RETURNING *
  `;

  return NextResponse.json({
    success: true,
    message: 'Pengaturan berhasil disimpan',
    data: result[0],
  }, { status: 200 });
}
