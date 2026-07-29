const MAX_WIDTH = 1600; 
const QUALITY = 0.85;

async function perkecil(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return file;

  // imageOrientation: 'from-image' penting: canvas gak bawa data EXIF, jadi
  // orientasinya harus dibenerin SEKARANG. Tanpa ini foto HP bisa kebalik.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

  const skala = Math.min(1, MAX_WIDTH / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * skala);
  canvas.height = Math.round(bitmap.height * skala);

  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', QUALITY)
  );
  if (!blob) return file; // browser gak dukung webp -> kirim aslinya aja

  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', {
    type: 'image/webp',
  });
}

/** Upload satu file, balikin URL publiknya. Melempar Error dengan pesan yang jelas. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const siap = await perkecil(file);

  const formData = new FormData();
  formData.append('file', siap);
  formData.append('folder', folder);

  const res = await fetch('/api/upload', { method: 'POST', body: formData });

  // Kalau ditolak Vercel karena kegedean, balasannya teks biasa — bukan JSON.
  // Tanpa penjagaan ini, res.json() meledak jadi "Unexpected token 'R'..."
  // yang bikin bingung.
  if (res.status === 413) {
    throw new Error('Ukuran gambar terlalu besar. Coba pakai foto yang lebih kecil.');
  }

  const teks = await res.text();
  let json;
  try {
    json = JSON.parse(teks);
  } catch {
    throw new Error(`Gagal upload gambar (kode ${res.status}). Coba lagi sebentar.`);
  }

  if (!res.ok) throw new Error(json.message || 'Gagal upload gambar');
  return json.data.url;
}
