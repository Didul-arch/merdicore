"use client";

import { useRef } from "react";

interface Props {
  src: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Klik/geser titik di atas foto buat nentuin bagian yang selalu kelihatan
 * kalau foto ini dipasang di kotak yang rasionya beda-beda (kartu, avatar,
 * halaman detail, dst). Fotonya sendiri TIDAK dipotong — cuma titik acuan
 * crop-nya (CSS object-position) yang disimpan, jadi aman diubah ulang
 * kapan saja tanpa upload ulang.
 */
export default function FocalPointPicker({ src, value, onChange, className = "w-full max-w-sm h-44 rounded-xl" }: Props) {
  const kotakRef = useRef<HTMLDivElement>(null);
  const [x, y] = value.split(" ");

  function geser(e: React.PointerEvent) {
    const rect = kotakRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = Math.round(Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)));
    const py = Math.round(Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)));
    onChange(`${px}% ${py}%`);
  }

  function mulai(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    geser(e);
  }

  return (
    <div className="space-y-1.5">
      <div
        ref={kotakRef}
        onPointerDown={mulai}
        onPointerMove={(e) => e.buttons === 1 && geser(e)}
        className={`relative overflow-hidden border border-gray-200 bg-gray-50 cursor-crosshair touch-none select-none ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="w-full h-full object-cover pointer-events-none" style={{ objectPosition: value }} />
        <div
          className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-teal-600 shadow-md pointer-events-none"
          style={{ left: x, top: y }}
        />
      </div>
      <p className="text-[11px] text-gray-400">Klik atau geser titik di foto — itu bagian yang selalu kelihatan di kartu manapun.</p>
    </div>
  );
}
