import { notFound } from "next/navigation";
import sql from "@/lib/db";
import UmkmForm, { type UmkmAwal } from "@/components/dashboard/UmkmForm";

export default async function EditUmkmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const umkmId = parseInt(id);
  if (isNaN(umkmId)) notFound();

  const rows = await sql`
    SELECT id, nama_usaha, deskripsi, no_whatsapp, alamat, gambar, galeri_foto
    FROM umkm WHERE id = ${umkmId}
  `;
  if (rows.length === 0) notFound();

  return <UmkmForm awal={rows[0] as unknown as UmkmAwal} />;
}
