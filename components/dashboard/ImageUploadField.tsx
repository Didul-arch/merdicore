"use client";

import { useEffect, useState } from "react";
import { FileInput } from "@/components/dashboard/Field";
import FocalPointPicker from "@/components/dashboard/FocalPointPicker";

interface Props {
  gambar: string | null;
  file: File | null;
  onFileChange: (file: File | null) => void;
  fokus: string;
  onFokusChange: (value: string) => void;
  boxClassName?: string;
}

/** Input file + preview yang bisa diatur titik fokusnya, dipakai berulang di form berita/UMKM/lembaga/perangkat. */
export default function ImageUploadField({ gambar, file, onFileChange, fokus, onFokusChange, boxClassName }: Props) {
  const [preview, setPreview] = useState<{ file: File | null; url: string | null }>({ file: null, url: null });

  // Foto yang BARU dipilih (belum diupload) juga langsung bisa diatur titik
  // fokusnya, pakai URL sementara di browser. Dibandingkan di render (pola
  // "derive state dari props berubah"), bukan useEffect, supaya blob URL
  // lama langsung dilepas begitu file baru dipilih.
  if (file !== preview.file) {
    if (preview.url) URL.revokeObjectURL(preview.url);
    setPreview({ file, url: file ? URL.createObjectURL(file) : null });
  }

  // Lepas blob URL kalau formnya ditinggal (unmount) selagi masih pegang
  // satu. Revoke ganda (kalau url ini sudah dilepas di atas) aman — cuma no-op.
  useEffect(() => () => { if (preview.url) URL.revokeObjectURL(preview.url); }, [preview.url]);

  const tampilkan = preview.url || gambar;

  return (
    <div className="space-y-3">
      <FileInput accept="image/*" onChange={(e) => onFileChange(e.target.files?.[0] || null)} />
      {tampilkan && (
        <FocalPointPicker src={tampilkan} value={fokus} onChange={onFokusChange} className={boxClassName} />
      )}
    </div>
  );
}
