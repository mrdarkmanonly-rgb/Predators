import { getAvailableCases } from "@/lib/inspector/get-available-cases";
import AvailableCasesClient from "@/components/inspector/AvailableCasesClient";

export default async function AvailableCasesPage() {
  const cases = await getAvailableCases();

  return <AvailableCasesClient cases={cases} />;
}