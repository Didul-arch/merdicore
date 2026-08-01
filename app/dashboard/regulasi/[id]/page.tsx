import { notFound } from "next/navigation";
import sql from "@/lib/db";
import RegulasiForm, { type RegulasiAwal } from "@/components/dashboard/RegulasiForm";

export default async function EditRegulasiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const regulasiId = parseInt(id);
  if (isNaN(regulasiId)) notFound();

  const rows = await sql`SELECT * FROM regulasi WHERE id = ${regulasiId}`;
  if (rows.length === 0) notFound();

  return <RegulasiForm awal={rows[0] as unknown as RegulasiAwal} />;
}
