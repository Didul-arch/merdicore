import { notFound } from "next/navigation";
import sql from "@/lib/db";
import PerangkatForm, { type PerangkatAwal } from "@/components/dashboard/PerangkatForm";

export default async function EditPerangkatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pdId = parseInt(id);
  if (isNaN(pdId)) notFound();

  const rows = await sql`
    SELECT id, nama, no_hp, jabatan, nip, pendidikan_terakhir, masa_jabatan, foto, foto_fokus, user_id
    FROM perangkat_desa WHERE id = ${pdId}
  `;
  if (rows.length === 0) notFound();

  return <PerangkatForm awal={rows[0] as unknown as PerangkatAwal} />;
}
