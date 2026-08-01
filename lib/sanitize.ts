import sanitizeHtml from 'sanitize-html';

export function bersihkanHtml(kotor: string): string {
  return sanitizeHtml(kotor, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 's',
      'h2', 'h3', 'h4',
      'ul', 'ol', 'li',
      'blockquote', 'code', 'pre',
      'a', 'img', 'hr',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
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
