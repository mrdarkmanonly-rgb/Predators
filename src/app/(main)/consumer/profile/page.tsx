import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/consumer/get-user-profile";

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
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function ProfilePage() {
  const profile = await getUserProfile();
  if (!profile) redirect("/login");

  const initials = initialsFrom(profile.name);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#102A43]">Profile</h1>
        <p className="text-sm text-[#627D98] mt-1">
          Your account information.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#D9E2EC] p-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 pb-6 border-b border-[#EAF0F6]">
          {profile.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.imageUrl}
              alt={profile.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1769AA] to-[#0B1F33] flex items-center justify-center text-white text-xl font-semibold">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-lg font-bold text-[#102A43] truncate">
              {profile.name}
            </p>
            <p className="text-sm text-[#627D98] truncate">
              {profile.email}
            </p>
            <span className="inline-flex mt-2 items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EAF4FF] text-[#1769AA]">
              {ROLE_LABEL[profile.role] ?? profile.role}
            </span>
          </div>
        </div>

        {/* Details */}
        <dl className="mt-6 space-y-4">
          <Row label="Role" value={ROLE_LABEL[profile.role] ?? profile.role} />
          <Row
            label="Status"
            value={
              profile.status === "ACTIVE" ? "Active" : "Inactive"
            }
          />
          <Row label="Member since" value={fmtDate(profile.createdAt)} />
          <Row
            label="User ID"
            value={<span className="font-mono text-xs">{profile.id}</span>}
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
      <dd className="text-sm font-medium text-[#102A43] text-right">
        {value}
      </dd>
    </div>
  );
}