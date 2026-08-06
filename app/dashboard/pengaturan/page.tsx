import { getPengaturanDesa } from "@/lib/fetchers";
import PengaturanForm from "@/components/dashboard/PengaturanForm";

export default async function PengaturanPage() {
  const data = await getPengaturanDesa();
  return <PengaturanForm awal={data} />;
}
