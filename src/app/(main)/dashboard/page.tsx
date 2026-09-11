import { getCurrentUserFromDatabase } from "@/actions/user/user.actions";
import { ROLE_ROUTES } from "@/lib/types/role.type";
import { redirect } from "next/navigation";

const page = async () => {
  const user = await getCurrentUserFromDatabase();
  if (!user) {
    return redirect("/login");
  }
  redirect(ROLE_ROUTES[user.role]);
};

export default page;
