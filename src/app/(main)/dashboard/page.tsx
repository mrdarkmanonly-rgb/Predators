import { redirect } from "next/navigation";

import { syncUserWithDatabase } from "@/actions/user/user.actions";
import { ROLE_ROUTES } from "@/lib/types/role.type";

const page = async () => {
  const result = await syncUserWithDatabase();

  if (!result.success || !result.user) {
    return redirect("/login");
  }

  redirect(ROLE_ROUTES[result.user.role]);
};

export default page;