import { NextResponse } from 'next/server';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';
import { unggah, urlPublik } from '@/lib/storage';
import sharp from 'sharp';

const ALLOWED_FOLDERS = ['berita', 'umkm', 'avatar', 'umkm/galeri', 'regulasi'] as const;
type Folder = typeof ALLOWED_FOLDERS[number];

// Harus di bawah batas body Vercel (~4.5 MB) supaya yang kegedean dapat pesan
// error dari kita, bukan 413 mentah yang bukan JSON. Gambar biasanya sudah
// diperkecil di browser (lib/upload-image.ts), ini cuma jaring pengaman.
const MAX_SIZE = 4 * 1024 * 1024;

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  // Dokumen regulasi & template surat diunggah sebagai PDF, bukan gambar.
  'application/pdf',
];

// Area tampil terlebar di situs ~800px, jadi 1600px sudah cukup untuk layar
// retina. Foto HP mentah (4000px) dikecilkan ke sini.
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 80;

export async function POST(request: Request) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized — hanya admin yang bisa upload gambar' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    if (!folder || !ALLOWED_FOLDERS.includes(folder as Folder)) {
      return NextResponse.json(
        { success: false, message: `Folder harus salah satu dari: ${ALLOWED_FOLDERS.join(', ')}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: `Ukuran file terlalu besar (${(file.size / 1048576).toFixed(1)} MB, maks ${MAX_SIZE / 1048576} MB)`,
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Tipe file tidak didukung. Gunakan JPG, PNG, WebP, GIF, SVG, atau PDF' },
        { status: 400 }
      );
    }

    const original = Buffer.from(await file.arrayBuffer());

    // SVG (vektor) dan PDF bukan raster image — sharp gak bisa/gak perlu
    // memprosesnya, jadi keduanya dilewati dan diupload apa adanya.
    const isRasterImage = file.type.startsWith('image/') && file.type !== 'image/svg+xml';

    let body: Buffer<ArrayBufferLike> = original;
    let contentType = file.type;
    let ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';

    if (isRasterImage) {
      body = await sharp(original)
        // .rotate() tanpa argumen = benerin orientasi sesuai EXIF. Wajib, kalau
        // nggak foto dari HP bisa kebalik/miring pas ditampilkan.
        .rotate()
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      contentType = 'image/webp';
      ext = 'webp';
      // Catatan: sharp buang metadata (EXIF) secara default — bonus privasi,
      // karena foto HP sering nyimpen titik koordinat GPS lokasi pemotretan.
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${folder}/${timestamp}-${randomStr}.${ext}`;

    await unggah(fileName, body, contentType);

    return NextResponse.json({
      success: true,
      message: 'Gambar berhasil diupload via S3',
      data: {
        path: fileName,
        url: urlPublik(fileName),
      },
    }, { status: 201 });

  } catch (error) {
    console.error('S3 Upload error:', error);
    return NextResponse.json(
      { success: false, message: `Gagal mengupload gambar: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
