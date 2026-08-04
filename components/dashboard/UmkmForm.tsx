"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Toast from "@/components/dashboard/Toast";
import FormPage from "@/components/dashboard/FormPage";
import { Field, TextInput, TextArea, FileInput } from "@/components/dashboard/Field";
import ImageUploadField from "@/components/dashboard/ImageUploadField";
import { uploadImage } from "@/lib/upload-image";

export interface UmkmAwal {
  id?: number;
  nama_usaha: string;
  deskripsi: string | null;
  no_whatsapp: string | null;
  alamat: string | null;
  gambar: string | null;
  gambar_fokus: string | null;
  galeri_foto: string[] | null;
  latitude: number | null;
  longitude: number | null;
}

const KOSONG: UmkmAwal = {
  nama_usaha: "", deskripsi: "", no_whatsapp: "", alamat: "", gambar: null, gambar_fokus: null, galeri_foto: [],
  latitude: null, longitude: null,
};

export default function UmkmForm({ awal = KOSONG }: { awal?: UmkmAwal }) {
  const router = useRouter();
  const mode = awal.id ? "edit" : "create";

  const [namaUsaha, setNamaUsaha] = useState(awal.nama_usaha);
  const [deskripsi, setDeskripsi] = useState(awal.deskripsi ?? "");
  const [noWa, setNoWa] = useState(awal.no_whatsapp ?? "");
  const [alamat, setAlamat] = useState(awal.alamat ?? "");
  const [latitude, setLatitude] = useState(awal.latitude != null ? String(awal.latitude) : "");
  const [longitude, setLongitude] = useState(awal.longitude != null ? String(awal.longitude) : "");
  const gambar = awal.gambar ?? "";
  const [gambarFokus, setGambarFokus] = useState(awal.gambar_fokus || "50% 50%");
  const [file, setFile] = useState<File | null>(null);
  const [galeri, setGaleri] = useState<string[]>(awal.galeri_foto ?? []);
  const [galeriFiles, setGaleriFiles] = useState<File[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl = gambar;
      if (file) imageUrl = await uploadImage(file, "umkm");

      let galeriUrls = [...galeri];
      if (galeriFiles.length > 0) {
        const baru = await Promise.all(galeriFiles.map((f) => uploadImage(f, "umkm/galeri")));
        galeriUrls = [...galeriUrls, ...baru];
      }

      const payload = {
        nama_usaha: namaUsaha,
        deskripsi: deskripsi || null,
        no_whatsapp: noWa || null,
        alamat: alamat || null,
        gambar: imageUrl || null,
        gambar_fokus: gambarFokus,
        galeri_foto: galeriUrls,
        latitude: latitude.trim() || null,
        longitude: longitude.trim() || null,
      };

      const res = await fetch(mode === "create" ? "/api/umkm" : `/api/umkm/${awal.id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan UMKM");

      router.push("/dashboard/umkm");
      router.refresh();
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Terjadi kesalahan", type: "error" });
      setSubmitting(false);
    }
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <FormPage
        judul={mode === "create" ? "Tambah UMKM" : "Edit UMKM"}
        keterangan={mode === "create" ? "Daftarkan usaha warga ke etalase desa." : awal.nama_usaha}
        kembaliKe="/dashboard/umkm"
        onSubmit={handleSubmit}
        submitting={submitting}
        labelSimpan={mode === "create" ? "Simpan UMKM" : "Perbarui UMKM"}
      >
        <Field label="Nama Usaha" wajib>
          <TextInput required value={namaUsaha} onChange={(e) => setNamaUsaha(e.target.value)} placeholder="Contoh: Keripik Tempe Bu Siti" />
        </Field>

        <Field label="Deskripsi Usaha" petunjuk={`${deskripsi.length} karakter`}>
          <TextArea rows={8} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Ceritakan tentang usaha ini..." />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="No. WhatsApp" petunjuk="Dipakai tombol 'Hubungi WA' di situs publik.">
            <TextInput value={noWa} onChange={(e) => setNoWa(e.target.value)} placeholder="08xxxxxxxxxx" />
          </Field>
          <Field label="Alamat">
            <TextInput value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Alamat usaha" />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Latitude"
            petunjuk="Buka lokasi usaha di Google Maps, klik kanan titiknya, salin angka pertama."
          >
            <TextInput
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="-7.8643"
            />
          </Field>
          <Field label="Longitude" petunjuk="Angka kedua dari koordinat yang sama.">
            <TextInput
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="111.6421"
            />
          </Field>
        </div>

        <Field label="Gambar Utama" petunjuk="Otomatis diperkecil dan dikompres saat diunggah.">
          <ImageUploadField
            gambar={gambar || null}
            file={file}
            onFileChange={setFile}
            fokus={gambarFokus}
            onFokusChange={setGambarFokus}
          />
        </Field>

        <Field label="Galeri Produk" petunjuk="Bisa pilih beberapa sekaligus. Klik ✕ untuk membuang foto lama.">
          <FileInput
            multiple
            accept="image/*"
            onChange={(e) => setGaleriFiles(e.target.files ? Array.from(e.target.files) : [])}
          />
          {galeri.length > 0 && (
            <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-3">
              {galeri.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Galeri ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setGaleri((prev) => prev.filter((_, idx) => idx !== i))}
                    // Sengaja selalu terlihat, bukan cuma pas hover: di HP gak
                    // ada hover, jadi tombolnya bakal mustahil ditemukan.
                    className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-600 border border-gray-200 shadow-sm transition hover:bg-red-50 hover:border-red-200 cursor-pointer"
                    title="Buang foto ini"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {galeriFiles.length > 0 && (
            <p className="text-[11px] text-teal-600 mt-2">{galeriFiles.length} foto baru siap diunggah.</p>
          )}
        </Field>
      </FormPage>
    </>
  );
}
