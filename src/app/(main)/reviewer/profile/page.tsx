import { requireRole } from "@/lib/auth-guard";

const ROLE_LABEL: Record<string, string> = {
  CONSUMER: "Consumer",
  REVIEWER: "Reviewer",
  INSPECTOR: "Inspector",
  ADMIN: "Admin",
};

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function ReviewerProfilePage() {
  const user = await requireRole(["REVIEWER", "ADMIN"]);
  const displayName = user.name ?? user.email.split("@")[0];
  const initials = initialsFrom(displayName);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#102A43]">Profile</h2>
        <p className="mt-1 text-sm text-[#627D98]">
          Your account information.
        </p>
      </div>

      <div className="rounded-xl border border-[#D9E2EC] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4 border-b border-[#EAF0F6] pb-6">
          {user.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt={displayName}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1769AA] to-[#0B1F33] text-xl font-semibold text-white">
              {initials}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-[#102A43]">
              {displayName}
            </p>
            <p className="truncate text-sm text-[#627D98]">{user.email}</p>
            <span className="mt-2 inline-flex rounded-full bg-[#EAF4FF] px-2.5 py-1 text-[11px] font-bold text-[#1769AA]">
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
          </div>
        </div>

        <dl className="mt-6 space-y-4">
          <Row
            label="Role"
            value={ROLE_LABEL[user.role] ?? user.role}
          />
          <Row
            label="Status"
            value={user.status === "ACTIVE" ? "Active" : "Inactive"}
          />
          <Row label="Member since" value={fmtDate(user.createdAt.toISOString())} />
          <Row
            label="User ID"
            value={<span className="font-mono text-xs">{user.id}</span>}
          />
        </dl>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-sm text-[#627D98]">{label}</dt>
      <dd className="text-right text-sm font-medium text-[#102A43]">
        {value}
      </dd>
    </div>
  );
}