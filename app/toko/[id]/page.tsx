import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import sql from "@/lib/db";
import UmkmForm, { type UmkmAwal } from "@/components/dashboard/UmkmForm";

export default async function EditUsahaSayaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const umkmId = parseInt(id);
  if (isNaN(umkmId)) notFound();

  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  const rows = await sql`
    SELECT id, nama_usaha, deskripsi, no_whatsapp, alamat, gambar, gambar_fokus, galeri_foto, peta_embed_url, pemilik_id
    FROM umkm WHERE id = ${umkmId}
  `;
  // notFound() sengaja dipakai juga buat "bukan usaha Anda" (bukan pesan
  // "akses ditolak") — biar gak kasih tahu ke orang lain bahwa id ini valid
  // tapi bukan miliknya.
  if (rows.length === 0 || rows[0].pemilik_id !== userId) notFound();

  return <UmkmForm awal={rows[0] as unknown as UmkmAwal} kembaliKe="/toko" sembunyikanPeta />;
}
