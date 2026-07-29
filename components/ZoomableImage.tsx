"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  fotos: string[];
  mulai?: number;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  tombolClassName?: string;
}

/**
 * Gambar yang bisa diklik untuk dilihat besar.
 *
 * `fotos` diisi SELURUH foto milik halaman itu dan `mulai` menunjuk foto mana
 * yang diwakili thumbnail ini — jadi setelah modal terbuka, pengunjung bisa
 * geser kiri-kanan ke foto lain meskipun thumbnail-nya terpisah-pisah di
 * halaman.
 *
 * Sengaja TIDAK pakai pola render-prop: komponen ini dipanggil dari Server
 * Component, dan fungsi tidak bisa dikirim melewati batas server-client.
 */
export default function ZoomableImage({
  fotos,
  mulai = 0,
  alt,
  sizes,
  priority,
  className = "object-cover",
  tombolClassName = "absolute inset-0 w-full h-full cursor-zoom-in",
}: Props) {
  const [aktif, setAktif] = useState<number | null>(null);
  const terbuka = aktif !== null;

  useEffect(() => {
    if (!terbuka) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAktif(null);
      if (e.key === "ArrowRight") setAktif((i) => (i === null ? null : (i + 1) % fotos.length));
      if (e.key === "ArrowLeft") setAktif((i) => (i === null ? null : (i - 1 + fotos.length) % fotos.length));
    };
    window.addEventListener("keydown", onKey);
    const overflowAwal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowAwal;
    };
  }, [terbuka, fotos.length]);

  return (
    <>
      <button onClick={() => setAktif(mulai)} className={tombolClassName} aria-label="Perbesar gambar">
        <Image src={fotos[mulai]} alt={alt} fill sizes={sizes} priority={priority} className={className} referrerPolicy="no-referrer" />
      </button>

      {terbuka && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={() => setAktif(null)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            onClick={() => setAktif(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer z-10"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          {fotos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setAktif((i) => (i! - 1 + fotos.length) % fotos.length); }}
                className="absolute left-3 sm:left-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer z-10"
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setAktif((i) => (i! + 1) % fotos.length); }}
                className="absolute right-3 sm:right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer z-10"
                aria-label="Foto berikutnya"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="relative w-full h-full max-w-5xl max-h-[85vh] m-4" onClick={(e) => e.stopPropagation()}>
            {/* Wadahnya dibatasi max-w-5xl (1024px), jadi sizes harus ikut segitu.
                Kalau ditulis 100vw, browser ngunduh gambar lebih besar dari perlu. */}
            <Image
              src={fotos[aktif]}
              alt={`${alt} — foto ${aktif + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {fotos.length > 1 && (
            <span className="absolute bottom-5 text-white/70 text-xs font-medium">{aktif + 1} / {fotos.length}</span>
          )}
        </div>
      )}
    </>
  );
}
