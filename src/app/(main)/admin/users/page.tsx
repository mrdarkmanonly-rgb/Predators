import { getAdminUsers } from "@/lib/admin/get-admin-users";
import UsersClient from "./UsersClient";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return <UsersClient users={users} />;
}