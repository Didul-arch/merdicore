import { NextResponse } from 'next/server';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// S3 Configuration from environment variables
const endpoint = process.env.PUBLIC_BUCKET_ENDPOINT || '';
const region = 'auto'; // Supabase S3 usually uses 'auto' or 'ap-southeast-1' but S3 API accepts 'auto'
const accessKeyId = process.env.S3_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || '';

// Initialize S3 Client for Supabase Storage
const s3Client = new S3Client({
  forcePathStyle: true,
  region,
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

// Bucket name in Supabase Storage
const BUCKET = 'public-assets';

// Allowed folders inside the bucket
const ALLOWED_FOLDERS = ['berita', 'umkm', 'avatar', 'umkm/galeri'] as const;
type Folder = typeof ALLOWED_FOLDERS[number];

// Max file size: 5MB
const MAX_SIZE = 5 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

// POST: Upload gambar ke Supabase Storage via S3 API
export async function POST(request: Request) {
  try {
    // Auth check
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized — hanya admin yang bisa upload gambar' },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    // Validation
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
        { success: false, message: 'Ukuran file terlalu besar (maks 5MB)' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Tipe file tidak didukung. Gunakan JPG, PNG, WebP, GIF, atau SVG' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${folder}/${timestamp}-${randomStr}.${ext}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage via S3 API
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Construct public URL
    // S3 Endpoint is usually https://[project].storage.supabase.co/storage/v1/s3
    // Public URL pattern is https://[project].supabase.co/storage/v1/object/public/[bucket]/[key]
    const baseUrl = endpoint.replace('.storage.supabase.co/storage/v1/s3', '.supabase.co');
    const publicUrl = `${baseUrl}/storage/v1/object/public/${BUCKET}/${fileName}`;

    return NextResponse.json({
      success: true,
      message: 'Gambar berhasil diupload via S3',
      data: {
        path: fileName,
        url: publicUrl,
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('S3 Upload error:', error);
    return NextResponse.json(
      { success: false, message: `Gagal mengupload gambar: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
