import { notFound } from "next/navigation";
import sql from "@/lib/db";
import LembagaForm, { type LembagaAwal } from "@/components/dashboard/LembagaForm";

export default async function EditLembagaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lembagaId = parseInt(id);
  if (isNaN(lembagaId)) notFound();

  const rows = await sql`SELECT * FROM lembaga WHERE id = ${lembagaId}`;
  if (rows.length === 0) notFound();

  return <LembagaForm awal={rows[0] as unknown as LembagaAwal} />;
}
