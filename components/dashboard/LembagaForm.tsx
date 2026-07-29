"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/dashboard/Toast";
import FormPage from "@/components/dashboard/FormPage";
import { Field, TextInput, TextArea, FileInput } from "@/components/dashboard/Field";
import { uploadImage } from "@/lib/upload-image";

export interface LembagaAwal {
  id?: number;
  nama_lengkap: string;
  singkatan: string | null;
  nama_ketua: string | null;
  jumlah_anggota: number;
  deskripsi: string | null;
  gambar: string | null;
}

const KOSONG: LembagaAwal = {
  nama_lengkap: "", singkatan: "", nama_ketua: "", jumlah_anggota: 0, deskripsi: "", gambar: null,
};

export default function LembagaForm({ awal = KOSONG }: { awal?: LembagaAwal }) {
  const router = useRouter();
  const mode = awal.id ? "edit" : "create";

  const [namaLengkap, setNamaLengkap] = useState(awal.nama_lengkap);
  const [singkatan, setSingkatan] = useState(awal.singkatan ?? "");
  const [namaKetua, setNamaKetua] = useState(awal.nama_ketua ?? "");
  const [jumlahAnggota, setJumlahAnggota] = useState<number | "">(awal.jumlah_anggota || "");
  const [deskripsi, setDeskripsi] = useState(awal.deskripsi ?? "");
  const [gambar, setGambar] = useState(awal.gambar ?? "");
  const [file, setFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl = gambar;
      if (file) imageUrl = await uploadImage(file, "umkm");

      const payload = {
        nama_lengkap: namaLengkap,
        singkatan: singkatan || null,
        nama_ketua: namaKetua || null,
        jumlah_anggota: jumlahAnggota === "" ? 0 : Number(jumlahAnggota),
        deskripsi: deskripsi || null,
        gambar: imageUrl || null,
      };

      const res = await fetch(mode === "create" ? "/api/lembaga" : `/api/lembaga/${awal.id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan lembaga");

      router.push("/dashboard/lembaga");
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
        judul={mode === "create" ? "Tambah Lembaga" : "Edit Lembaga"}
        keterangan={mode === "create" ? "Daftarkan organisasi atau paguyuban desa." : awal.nama_lengkap}
        kembaliKe="/dashboard/lembaga"
        onSubmit={handleSubmit}
        submitting={submitting}
        labelSimpan={mode === "create" ? "Simpan Lembaga" : "Perbarui Lembaga"}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="sm:col-span-2">
            <Field label="Nama Lengkap Lembaga" wajib>
              <TextInput required value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} placeholder="Contoh: Pemberdayaan Kesejahteraan Keluarga" />
            </Field>
          </div>
          <Field label="Singkatan">
            <TextInput value={singkatan} onChange={(e) => setSingkatan(e.target.value)} placeholder="PKK" className="uppercase" />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Nama Ketua">
            <TextInput value={namaKetua} onChange={(e) => setNamaKetua(e.target.value)} placeholder="Nama ketua lembaga" />
          </Field>
          <Field label="Jumlah Anggota">
            <TextInput
              type="number"
              min={0}
              value={jumlahAnggota}
              onChange={(e) => setJumlahAnggota(e.target.value ? Number(e.target.value) : "")}
              placeholder="0"
            />
          </Field>
        </div>

        <Field label="Deskripsi" petunjuk={`${deskripsi.length} karakter — tampil di halaman publik Lembaga Desa.`}>
          <TextArea rows={8} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Penjelasan mengenai lembaga ini..." />
        </Field>

        <Field label="Logo / Gambar" petunjuk="Otomatis diperkecil dan dikompres saat diunggah.">
          <FileInput accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          {gambar && !file && (
            <div className="mt-3 relative w-full max-w-sm h-44 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gambar} alt="Gambar saat ini" className="w-full h-full object-cover" />
            </div>
          )}
        </Field>
      </FormPage>
    </>
  );
}
