"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Toast from "@/components/dashboard/Toast";
import FormPage from "@/components/dashboard/FormPage";
import { Field, TextInput, Select } from "@/components/dashboard/Field";
import ImageUploadField from "@/components/dashboard/ImageUploadField";
import fetcher from "@/lib/swr-fetcher";
import { uploadImage } from "@/lib/upload-image";

const PENDIDIKAN_OPTIONS = ["SD", "SMP", "SMA/SMK", "D3", "S1", "S2", "S3"];

export interface PerangkatAwal {
  id?: number;
  nama: string;
  no_hp: string;
  jabatan: string;
  nip: string | null;
  pendidikan_terakhir: string | null;
  masa_jabatan: string | null;
  foto: string | null;
  foto_fokus: string | null;
  user_id: number | null;
}

const KOSONG: PerangkatAwal = {
  nama: "", no_hp: "", jabatan: "", nip: "", pendidikan_terakhir: "", masa_jabatan: "",
  foto: null, foto_fokus: null, user_id: null,
};

interface AkunRingkas { id: number; nama: string; email: string }

export default function PerangkatForm({ awal = KOSONG }: { awal?: PerangkatAwal }) {
  const router = useRouter();
  const mode = awal.id ? "edit" : "create";

  const [nama, setNama] = useState(awal.nama);
  const [noHp, setNoHp] = useState(awal.no_hp);
  const [jabatan, setJabatan] = useState(awal.jabatan);
  const [nip, setNip] = useState(awal.nip ?? "");
  const [pendidikan, setPendidikan] = useState(awal.pendidikan_terakhir ?? "");
  const [masaJabatan, setMasaJabatan] = useState(awal.masa_jabatan ?? "");
  const foto = awal.foto ?? "";
  const [fotoFokus, setFotoFokus] = useState(awal.foto_fokus || "50% 50%");
  const [file, setFile] = useState<File | null>(null);
  const [userId, setUserId] = useState(awal.user_id ? String(awal.user_id) : "");

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Buat dropdown "Kaitkan ke Akun" -- daftar akun yang sudah dibuat lewat Manajemen User.
  const { data } = useSWR("/api/users?limit=100", fetcher);
  const akunList: AkunRingkas[] = data?.data ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      let fotoUrl = foto;
      if (file) fotoUrl = await uploadImage(file, "avatar");

      const payload = {
        nama,
        no_hp: noHp,
        jabatan,
        nip: nip || null,
        pendidikan_terakhir: pendidikan || null,
        masa_jabatan: masaJabatan || null,
        foto: fotoUrl || null,
        foto_fokus: fotoFokus,
        user_id: userId ? Number(userId) : null,
      };

      const res = await fetch(mode === "create" ? "/api/perangkat-desa" : `/api/perangkat-desa/${awal.id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan data");

      router.push("/dashboard/perangkat");
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
        judul={mode === "create" ? "Tambah Perangkat Desa" : "Edit Perangkat Desa"}
        keterangan={mode === "create" ? "Data ini tampil di halaman publik Profil Desa." : awal.nama}
        kembaliKe="/dashboard/perangkat"
        onSubmit={handleSubmit}
        submitting={submitting}
        labelSimpan={mode === "create" ? "Simpan" : "Perbarui"}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Nama Lengkap" wajib>
            <TextInput required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap pejabat" />
          </Field>
          <Field label="No. HP / WhatsApp" wajib petunjuk="Kontak publik, terpisah dari no. HP akun login.">
            <TextInput required value={noHp} onChange={(e) => setNoHp(e.target.value)} placeholder="08xxxxxxxxxx" />
          </Field>
        </div>

        <Field label="Jabatan" wajib>
          <TextInput required value={jabatan} onChange={(e) => setJabatan(e.target.value)} placeholder="Contoh: Kepala Desa, Sekretaris Desa" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="NIP">
            <TextInput value={nip} onChange={(e) => setNip(e.target.value)} placeholder="Nomor Induk Pegawai" className="font-mono" />
          </Field>
          <Field label="Pendidikan Terakhir">
            <Select value={pendidikan} onChange={(e) => setPendidikan(e.target.value)}>
              <option value="">— Pilih —</option>
              {PENDIDIKAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </Field>
        </div>

        <Field label="Masa Jabatan" petunjuk="Buat data historis, misalnya kalau nanti jabatan ini diganti orang lain.">
          <TextInput value={masaJabatan} onChange={(e) => setMasaJabatan(e.target.value)} placeholder="Contoh: 2020 – 2026" />
        </Field>

        <Field label="Kaitkan ke Akun (opsional)" petunjuk="Cuma perlu kalau orang ini juga bakal login ke dashboard.">
          <Select value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">— Tidak dikaitkan —</option>
            {akunList.map((u) => (
              <option key={u.id} value={u.id}>{u.nama} ({u.email})</option>
            ))}
          </Select>
        </Field>

        <Field label="Foto Profil" petunjuk="Otomatis diperkecil dan dikompres saat diunggah.">
          <ImageUploadField
            gambar={foto || null}
            file={file}
            onFileChange={setFile}
            fokus={fotoFokus}
            onFokusChange={setFotoFokus}
            boxClassName="w-24 h-24 rounded-full"
          />
        </Field>
      </FormPage>
    </>
  );
}
