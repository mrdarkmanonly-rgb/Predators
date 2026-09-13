import { getMyCases } from "@/lib/inspector/get-my-cases";
import MyCasesClient from "@/components/inspector/MyCasesClient";

export default async function MyCasesPage() {
  const cases = await getMyCases();

  return <MyCasesClient cases={cases} />;
}