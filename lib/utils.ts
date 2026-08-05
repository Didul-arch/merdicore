/** Format tanggal ke format Indonesia. Contoh: "28 Juli 2026" */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Format angka ke format Rupiah. Contoh: 15000 → "Rp15.000" */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Warna badge berdasarkan kategori berita. */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Budaya: 'bg-emerald-100 text-emerald-800',
    Pemerintahan: 'bg-sky-100 text-sky-800',
    Sejarah: 'bg-amber-100 text-amber-800',
    Infrastruktur: 'bg-indigo-100 text-indigo-800',
    Pengumuman: 'bg-gray-100 text-gray-800',
  };
  return colors[category] ?? 'bg-gray-100 text-gray-800';
}

/**
 * Generate link WhatsApp dengan pesan pre-filled.
 * Otomatis convert prefix "0" → "62" (kode negara Indonesia).
 */
export function generateWhatsAppUrl(phone: string, message: string): string {
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.slice(1);
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

const ENTITAS: Record<string, string> = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
};

/** Ubah entitas HTML (&amp; dkk) balik ke karakter aslinya. */
function nyahEntitas(s: string): string {
  return s.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (e) => ENTITAS[e]);
}

/**
 * Admin nempel potongan HTML <iframe> dari Google Maps (Bagikan → Sematkan
 * peta) atau langsung URL src-nya. Ambil URL-nya saja, dan pastikan memang
 * mengarah ke google.com/maps — dipakai sebagai src <iframe> di halaman
 * publik, jadi harus disaring supaya admin (atau akunnya yang kebobol) gak
 * bisa nyematkan situs sembarangan ke halaman UMKM.
 */
export function ambilSrcMapsEmbed(input: string): string | null {
  const teks = (input || '').trim();
  if (!teks) return null;
  // \1 wajib ketemu kutip PENUTUP yang sama dengan kutip pembuka atribut.
  // Kalau cuma [^"']+ (kutip apa saja), nama tempat yang punya apostrof
  // ("Ern's Jahit") bikin regex-nya berhenti duluan di situ — URL kepotong
  // di tengah, bukan di penutup atribut src yang sebenarnya.
  const cocok = teks.match(/<iframe[^>]*\ssrc=(["'])(.*?)\1/i);
  // Atribut src di HTML yang di-copy dari Google memang berisi "&amp;"
  // apa adanya (bukan "&"), bukan bug typo — itu memang cara "&" ditulis
  // valid di dalam HTML. Kalau gak di-decode balik, karakter "&amp;" itu
  // ikut jadi bagian dari nilai parameter pb=... dan Google nolak URL-nya
  // ("Invalid 'pb' parameter"), soalnya bukan "&" asli yang motong ke
  // parameter berikutnya.
  const url = nyahEntitas(cocok ? cocok[2] : teks);
  try {
    const u = new URL(url);
    const hostOk = u.hostname === 'www.google.com' || u.hostname === 'maps.google.com';
    if (hostOk && u.pathname.startsWith('/maps')) return url;
  } catch {
    // bukan URL valid, jatuh ke return null di bawah
  }
  return null;
}

/* ── Bantuan untuk konten dari editor teks kaya ──
   Ditaruh di sini, BUKAN di lib/sanitize.ts, karena file itu meng-import
   sanitize-html yang khusus Node. Kalau helper ini ikut di sana, paket berat
   itu akan terseret ke bundle browser. lib/utils.ts sudah terbukti aman
   dipakai client component. */

/** Buang tag HTML, sisakan teksnya saja. Dipakai ringkasan kartu & pencarian. */
export function teksPolos(html: string | null): string {
  return nyahEntitas((html || '').replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Editor yang kosong tetap menghasilkan "<p></p>" — panjangnya 7, bukan 0.
 * Jadi validasi "wajib diisi" harus melihat teksnya, bukan panjang stringnya.
 */
export function adaIsinya(html: string | null): boolean {
  return /<img\b/i.test(html || '') || teksPolos(html).length > 0;
}

function lolos(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);
}

/**
 * Data lama tersimpan sebagai teks biasa ber-"\n". Begitu kolomnya dirender
 * sebagai HTML, semua paragraf akan nempel jadi satu blok. Fungsi ini
 * membungkusnya jadi <p> pada saat DIBACA — jadi isi database tidak perlu
 * diutak-atik sama sekali, dan tidak ada risiko data rusak.
 */
export function keHtml(nilai: string | null): string {
  const teks = nilai || '';
  if (!teks.trim()) return '';
  // Editor selalu mengeluarkan tag blok di level teratas. Kalau ketemu salah
  // satunya, berarti ini sudah HTML dan tidak perlu diapa-apakan.
  if (/<(p|h[2-4]|ul|ol|blockquote|pre|img|hr)\b/i.test(teks)) return teks;
  return teks
    .split(/\n{2,}/)
    .map((p) => `<p>${lolos(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}
