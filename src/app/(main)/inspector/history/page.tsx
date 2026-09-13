import { getInspectionHistory } from "@/lib/inspector/get-inspection-history";
import InspectionHistoryClient from "@/components/inspector/InspectionHistoryClient";

export default async function InspectionHistoryPage() {
  const items = await getInspectionHistory();

  return <InspectionHistoryClient items={items} />;
}