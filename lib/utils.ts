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
