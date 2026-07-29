"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/dashboard/Toast";
import FormPage from "@/components/dashboard/FormPage";
import { Field, TextInput, Select, FileInput } from "@/components/dashboard/Field";
import RichEditor from "@/components/dashboard/RichEditor";
import { uploadImage } from "@/lib/upload-image";
import { adaIsinya, keHtml, teksPolos } from "@/lib/utils";

export interface BeritaAwal {
  id?: number;
  judul: string;
  slug: string;
  konten: string;
  gambar: string | null;
  status: string;
}

const KOSONG: BeritaAwal = { judul: "", slug: "", konten: "", gambar: null, status: "draft" };

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function BeritaForm({ awal = KOSONG }: { awal?: BeritaAwal }) {
  const router = useRouter();
  const mode = awal.id ? "edit" : "create";

  const [judul, setJudul] = useState(awal.judul);
  const [slug, setSlug] = useState(awal.slug);
  const [konten, setKonten] = useState(keHtml(awal.konten));
  const [gambar, setGambar] = useState(awal.gambar ?? "");
  const [status, setStatus] = useState(awal.status);
  const [file, setFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // contenteditable tidak bisa memakai atribut `required` bawaan HTML,
    // jadi dicek manual. Harus SEBELUM setSubmitting — kalau sesudahnya,
    // tombol simpan terkunci selamanya saat validasi gagal.
    if (!adaIsinya(konten)) {
      setToast({ message: "Isi berita tidak boleh kosong", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = gambar;
      if (file) imageUrl = await uploadImage(file, "berita");

      const payload = {
        judul,
        slug: slug || toSlug(judul),
        konten,
        gambar: imageUrl || null,
        status,
      };

      const res = await fetch(mode === "create" ? "/api/berita" : `/api/berita/${awal.id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan berita");

      router.push("/dashboard/berita");
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
        judul={mode === "create" ? "Tambah Berita" : "Edit Berita"}
        keterangan={mode === "create" ? "Tulis berita baru untuk dipublikasikan di situs desa." : awal.judul}
        kembaliKe="/dashboard/berita"
        onSubmit={handleSubmit}
        submitting={submitting}
        labelSimpan={mode === "create" ? "Simpan Berita" : "Perbarui Berita"}
      >
        <Field label="Judul" wajib>
          <TextInput
            required
            value={judul}
            onChange={(e) => {
              setJudul(e.target.value);
              if (mode === "create") setSlug(toSlug(e.target.value));
            }}
            placeholder="Judul berita"
          />
        </Field>

        <Field label="Slug (URL)" wajib petunjuk="Bagian alamat web berita ini. Otomatis dibuat dari judul.">
          <TextInput required value={slug} onChange={(e) => setSlug(e.target.value)} className="font-mono" />
        </Field>

        <Field label="Isi Berita" wajib petunjuk={`${teksPolos(konten).length} karakter`}>
          <RichEditor
            isiAwal={keHtml(awal.konten)}
            onChange={setKonten}
            folder="berita"
            onError={(m) => setToast({ message: m, type: "error" })}
          />
        </Field>

        <Field label="Gambar Sampul" petunjuk="Otomatis diperkecil dan dikompres saat diunggah.">
          <FileInput accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          {gambar && !file && (
            <div className="mt-3 relative w-full max-w-sm h-44 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gambar} alt="Sampul saat ini" className="w-full h-full object-cover" />
            </div>
          )}
        </Field>

        <Field label="Status" petunjuk="Draft tidak tampil di situs publik.">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
        </Field>
      </FormPage>
    </>
  );
}
