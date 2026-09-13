import { getAdminInspections } from "@/lib/admin/get-admin-inspections";
import InspectionsClient from "./InspectionsClient";

export default async function AdminInspectionsPage() {
  const data = await getAdminInspections();

  return (
    <InspectionsClient
      active={data.active}
      completed={data.completed}
      total={data.total}
    />
  );
}