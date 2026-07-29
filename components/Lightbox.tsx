"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  fotos: string[];
  alt: string;
  children: (buka: (i: number) => void) => React.ReactNode;
}

// Bungkus gambar apa pun supaya bisa diklik untuk dilihat besar.
// Cara pakai: <Lightbox fotos={[...]}>{(buka) => <img onClick={() => buka(0)} .../>}</Lightbox>
export default function Lightbox({ fotos, alt, children }: Props) {
  const [aktif, setAktif] = useState<number | null>(null);
  const terbuka = aktif !== null;

  const tutup = () => setAktif(null);
  const geser = (arah: number) =>
    setAktif((i) => (i === null ? null : (i + arah + fotos.length) % fotos.length));

  useEffect(() => {
    if (!terbuka) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") tutup();
      if (e.key === "ArrowRight") geser(1);
      if (e.key === "ArrowLeft") geser(-1);
    };
    window.addEventListener("keydown", onKey);
    // Cegah halaman di belakang ikut ter-scroll saat modal terbuka
    const overflowAwal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowAwal;
    };
  }, [terbuka, fotos.length]);

  return (
    <>
      {children(setAktif)}

      {terbuka && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 animate-in fade-in duration-200"
          onClick={tutup}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            onClick={tutup}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          {fotos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); geser(-1); }}
                className="absolute left-3 sm:left-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); geser(1); }}
                className="absolute right-3 sm:right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                aria-label="Foto berikutnya"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="relative w-full h-full max-w-5xl max-h-[85vh] m-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={fotos[aktif]}
              alt={`${alt} — foto ${aktif + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {fotos.length > 1 && (
            <span className="absolute bottom-5 text-white/70 text-xs font-medium">
              {aktif + 1} / {fotos.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}
