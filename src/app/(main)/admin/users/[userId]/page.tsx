import { notFound } from "next/navigation";
import { getAdminUserDetail } from "@/lib/admin/get-admin-users";
import UserDetailClient from "./UserDetailClient";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await getAdminUserDetail(userId);
  if (!user) notFound();

  return <UserDetailClient user={user} />;
}