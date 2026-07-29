import { notFound } from "next/navigation";
import sql from "@/lib/db";
import BeritaForm, { type BeritaAwal } from "@/components/dashboard/BeritaForm";

// Data diambil di server, jadi form langsung terisi saat halaman dibuka —
// gak ada kedipan kosong dulu seperti waktu masih pakai modal.
export default async function EditBeritaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const beritaId = parseInt(id);
  if (isNaN(beritaId)) notFound();

  const rows = await sql`
    SELECT id, judul, slug, konten, gambar, status FROM berita WHERE id = ${beritaId}
  `;
  if (rows.length === 0) notFound();

  return <BeritaForm awal={rows[0] as unknown as BeritaAwal} />;
}
