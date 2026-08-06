"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/dashboard/Toast";
import FormPage from "@/components/dashboard/FormPage";
import { Field, TextInput, TextArea } from "@/components/dashboard/Field";
import RichEditor from "@/components/dashboard/RichEditor";
import { keHtml, teksPolos } from "@/lib/utils";
import type { PengaturanDesa } from "@/lib/types";

export default function PengaturanForm({ awal }: { awal: PengaturanDesa }) {
  const router = useRouter();

  const [sejarah, setSejarah] = useState(keHtml(awal.sejarah));
  const [visi, setVisi] = useState(awal.visi ?? "");
  const [misi, setMisi] = useState(awal.misi.join("\n"));
  const [alamatKantor, setAlamatKantor] = useState(awal.alamat_kantor ?? "");
  const [jamPelayanan, setJamPelayanan] = useState(awal.jam_pelayanan ?? "");
  const [jamCatatan, setJamCatatan] = useState(awal.jam_pelayanan_catatan ?? "");
  const [telepon, setTelepon] = useState(awal.telepon ?? "");
  const [email, setEmail] = useState(awal.email ?? "");
  const [petaEmbedUrl, setPetaEmbedUrl] = useState(awal.peta_embed_url ?? "");

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        sejarah,
        visi: visi.trim() || null,
        misi: misi.split("\n").map((m) => m.trim()).filter(Boolean),
        alamat_kantor: alamatKantor.trim() || null,
        jam_pelayanan: jamPelayanan.trim() || null,
        jam_pelayanan_catatan: jamCatatan.trim() || null,
        telepon: telepon.trim() || null,
        email: email.trim() || null,
        peta_embed_url: petaEmbedUrl.trim() || null,
      };

      const res = await fetch("/api/pengaturan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan pengaturan");

      setToast({ message: "Pengaturan berhasil disimpan.", type: "success" });
      router.refresh();
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Terjadi kesalahan", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <FormPage
        judul="Profil & Kontak Desa"
        keterangan="Konten ini tampil di halaman publik Profil Desa dan Hubungi Kami."
        kembaliKe="/dashboard"
        onSubmit={handleSubmit}
        submitting={submitting}
        labelSimpan="Simpan Perubahan"
      >
        <Field label="Sejarah & Asal-Usul" petunjuk={`${teksPolos(sejarah).length} karakter — tampil di halaman Profil Desa.`}>
          <RichEditor
            isiAwal={keHtml(awal.sejarah)}
            onChange={setSejarah}
            folder="umkm"
            onError={(m) => setToast({ message: m, type: "error" })}
          />
        </Field>

        <Field label="Visi Desa" petunjuk="Satu kalimat kutipan visi, tanpa tanda kutip (sudah otomatis ditambahkan).">
          <TextArea rows={3} value={visi} onChange={(e) => setVisi(e.target.value)} placeholder="Mewujudkan Desa..." />
        </Field>

        <Field label="Misi Pembangunan" petunjuk="Satu baris = satu poin misi.">
          <TextArea rows={5} value={misi} onChange={(e) => setMisi(e.target.value)} placeholder={"Meningkatkan...\nMembangun...\nMemberdayakan..."} />
        </Field>

        <Field label="Alamat Kantor Desa">
          <TextArea rows={2} value={alamatKantor} onChange={(e) => setAlamatKantor(e.target.value)} placeholder="Jl. Raya Pulung No. 45, ..." />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Jam Pelayanan">
            <TextInput value={jamPelayanan} onChange={(e) => setJamPelayanan(e.target.value)} placeholder="Senin - Jumat: 08:00 - 15:00 WIB" />
          </Field>
          <Field label="Catatan Jam Pelayanan">
            <TextInput value={jamCatatan} onChange={(e) => setJamCatatan(e.target.value)} placeholder="* Sabtu, Minggu, & Libur Nasional: Tutup" />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Telepon / WhatsApp">
            <TextInput value={telepon} onChange={(e) => setTelepon(e.target.value)} placeholder="+62 812-3456-7890 (Sekretariat Desa)" />
          </Field>
          <Field label="Email Resmi">
            <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pemdes@pulungmerdiko.desa.id" />
          </Field>
        </div>

        <Field label="Lokasi di Google Maps" petunjuk='Buka Google Maps → cari lokasi → Bagikan → Sematkan peta → tempel kodenya di sini.'>
          <TextArea rows={3} value={petaEmbedUrl} onChange={(e) => setPetaEmbedUrl(e.target.value)} placeholder='<iframe src="https://www.google.com/maps/embed?..."></iframe>' />
        </Field>
      </FormPage>
    </>
  );
}
