"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ExternalLink } from "lucide-react";
import Toast from "@/components/dashboard/Toast";
import FormPage from "@/components/dashboard/FormPage";
import { Field, TextInput, Select, FileInput } from "@/components/dashboard/Field";
import RichEditor from "@/components/dashboard/RichEditor";
import { uploadImage } from "@/lib/upload-image";
import { keHtml, teksPolos } from "@/lib/utils";

export interface RegulasiAwal {
  id?: number;
  jenis: "peraturan" | "surat";
  judul: string;
  nomor: string | null;
  tahun: number | null;
  kategori: string | null;
  status: string | null;
  deskripsi: string | null;
  file_url: string | null;
}

const KOSONG: RegulasiAwal = {
  jenis: "peraturan", judul: "", nomor: "", tahun: null, kategori: "", status: "Berlaku", deskripsi: "", file_url: null,
};

const KATEGORI_LIST = ["Keuangan", "Ketertiban", "Kelembagaan", "Hukum"];

export default function RegulasiForm({ awal = KOSONG }: { awal?: RegulasiAwal }) {
  const router = useRouter();
  const mode = awal.id ? "edit" : "create";

  const [jenis, setJenis] = useState<"peraturan" | "surat">(awal.jenis);
  const [judul, setJudul] = useState(awal.judul);
  const [nomor, setNomor] = useState(awal.nomor ?? "");
  const [tahun, setTahun] = useState<number | "">(awal.tahun ?? "");
  const [kategori, setKategori] = useState(awal.kategori || "Keuangan");
  const [status, setStatus] = useState(awal.status || "Berlaku");
  const [deskripsi, setDeskripsi] = useState(keHtml(awal.deskripsi));
  const fileUrl = awal.file_url ?? "";
  const [file, setFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const isPeraturan = jenis === "peraturan";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      let url = fileUrl;
      // Dokumennya PDF, tapi endpoint upload udah generik buat semua tipe file
      // yang diizinkan (lihat app/api/upload/route.ts) — bukan cuma gambar.
      if (file) url = await uploadImage(file, "regulasi");

      const payload = {
        jenis,
        judul,
        nomor: isPeraturan ? (nomor || null) : null,
        tahun: isPeraturan ? (tahun === "" ? null : Number(tahun)) : null,
        kategori: isPeraturan ? (kategori || null) : null,
        status: isPeraturan ? (status || null) : null,
        deskripsi: deskripsi || null,
        file_url: url || null,
      };

      const res = await fetch(mode === "create" ? "/api/regulasi" : `/api/regulasi/${awal.id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan regulasi");

      router.push("/dashboard/regulasi");
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
        judul={mode === "create" ? "Tambah Regulasi & Layanan" : "Edit Regulasi & Layanan"}
        keterangan={mode === "create" ? "Peraturan desa (Perdes) atau info persyaratan surat." : awal.judul}
        kembaliKe="/dashboard/regulasi"
        onSubmit={handleSubmit}
        submitting={submitting}
        labelSimpan={mode === "create" ? "Simpan" : "Perbarui"}
      >
        <Field label="Jenis" wajib>
          <Select value={jenis} onChange={(e) => setJenis(e.target.value as "peraturan" | "surat")}>
            <option value="peraturan">Peraturan Desa (Perdes)</option>
            <option value="surat">Persyaratan Surat</option>
          </Select>
        </Field>

        <Field label="Judul" wajib>
          <TextInput
            required
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder={isPeraturan ? "Anggaran Pendapatan dan Belanja Desa (APBDes) 2026" : "Surat Pengantar KTP"}
          />
        </Field>

        {isPeraturan && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Field label="Nomor Perdes">
                <TextInput value={nomor} onChange={(e) => setNomor(e.target.value)} placeholder="Perdes No 02 Tahun 2026" />
              </Field>
              <Field label="Tahun">
                <TextInput type="number" value={tahun} onChange={(e) => setTahun(e.target.value ? Number(e.target.value) : "")} placeholder="2026" />
              </Field>
              <Field label="Kategori">
                <Select value={kategori} onChange={(e) => setKategori(e.target.value)}>
                  {KATEGORI_LIST.map((k) => <option key={k} value={k}>{k}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Berlaku">Berlaku</option>
                <option value="Direvisi">Direvisi</option>
              </Select>
            </Field>
          </>
        )}

        <Field
          label={isPeraturan ? "Ringkasan Ketetapan" : "Syarat & Alur Pengurusan"}
          petunjuk={`${teksPolos(deskripsi).length} karakter — tampil di halaman publik.`}
        >
          <RichEditor
            isiAwal={keHtml(awal.deskripsi)}
            onChange={setDeskripsi}
            folder="regulasi"
            onError={(m) => setToast({ message: m, type: "error" })}
          />
        </Field>

        <Field
          label={isPeraturan ? "Dokumen PDF (Draf Perdes)" : "Template Surat (PDF)"}
          petunjuk="Maks 4 MB, format PDF."
        >
          <div className="space-y-2">
            {fileUrl && !file && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-teal-700 bg-teal-50 border border-teal-100 rounded-lg px-3 py-1.5 hover:bg-teal-100 transition"
              >
                <FileText className="w-3.5 h-3.5" /> Lihat file saat ini <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <FileInput accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
        </Field>
      </FormPage>
    </>
  );
}
