import { requireRole } from "@/lib/auth-guard";
import ReviewerShell from "./components/ReviewerShell";

export default async function ReviewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["REVIEWER", "ADMIN"]);

  return (
    <ReviewerShell
      user={{
        name: user.name ?? user.email.split("@")[0],
        email: user.email,
        role: user.role,
        imageUrl: user.imageUrl,
      }}
    >
      {children}
    </ReviewerShell>
  );
}