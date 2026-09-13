"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { changeUserRole, toggleUserStatus } from "@/actions/admin/user.actions";
import type { AdminUserDetail } from "@/lib/admin/get-admin-users";

const ROLE_LABEL: Record<AdminUserDetail["role"], string> = {
  CONSUMER: "Consumer",
  REVIEWER: "Reviewer",
  INSPECTOR: "Inspector",
  ADMIN: "Admin",
};

const ROLES: AdminUserDetail["role"][] = [
  "CONSUMER",
  "REVIEWER",
  "INSPECTOR",
  "ADMIN",
];

function initialsFrom(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UserDetailClient({ user }: { user: AdminUserDetail }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [roleOpen, setRoleOpen] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState(false);

  const isInactive = user.status === "INACTIVE";

  function submitRole(newRole: AdminUserDetail["role"]) {
    if (newRole === user.role) {
      setRoleOpen(false);
      return;
    }
    startTransition(async () => {
      const res = await changeUserRole(user.id, newRole);
      if (res.ok) toast.success("Role updated");
      else toast.error(res.reason);
      setRoleOpen(false);
      router.refresh();
    });
  }

  function submitStatus() {
    const next = isInactive ? "ACTIVE" : "INACTIVE";
    startTransition(async () => {
      const res = await toggleUserStatus(user.id, next);
      if (res.ok) {
        toast.success(
          next === "ACTIVE" ? "Account activated" : "Account deactivated",
        );
      } else {
        toast.error(res.reason);
      }
      setConfirmStatus(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1769AA] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      {/* Header card */}
      <div className="rounded-xl border border-[#D9E2EC] bg-white p-6 shadow-sm">
        <div className="flex flex-col items-start gap-5 sm:flex-row">
          {user.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt={user.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1769AA] to-[#0B1F33] text-xl font-bold text-white">
              {initialsFrom(user.name)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-[#102A43]">{user.name}</h2>
            <p className="mt-0.5 truncate text-sm text-[#627D98]">
              {user.email}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#EAF4FF] px-2.5 py-1 text-[11px] font-semibold text-[#1769AA]">
                {ROLE_LABEL[user.role]}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  isInactive
                    ? "bg-[#FEECEC] text-[#DC2626]"
                    : "bg-[#DCFCE7] text-[#15803D]"
                }`}
              >
                {isInactive ? "Inactive" : "Active"}
              </span>
              <span className="text-xs text-[#829AB1]">
                Joined {fmt(user.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions row */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#EAF0F6] pt-5">
          {/* Role change */}
          <div className="relative">
            <button
              onClick={() => setRoleOpen((o) => !o)}
              disabled={pending}
              className="flex items-center gap-2 rounded-xl border border-[#D9E2EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#102A43] transition hover:border-[#1769AA]/40 disabled:opacity-50"
            >
              Change role
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  roleOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {roleOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-[#D9E2EC] bg-white shadow-lg"
                >
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => submitRole(r)}
                      disabled={r === user.role}
                      className={`block w-full px-3 py-2.5 text-left text-sm transition ${
                        r === user.role
                          ? "cursor-not-allowed bg-[#F7FAFC] text-[#829AB1]"
                          : "text-[#102A43] hover:bg-[#EAF4FF]"
                      }`}
                    >
                      {ROLE_LABEL[r]}
                      {r === user.role && " (current)"}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status toggle */}
          <button
            onClick={() => setConfirmStatus(true)}
            disabled={pending}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
              isInactive
                ? "border border-[#16A34A]/30 bg-[#EAF8F0] text-[#15803D] hover:bg-[#DCFCE7]"
                : "border border-[#DC2626]/30 bg-[#FEECEC] text-[#DC2626] hover:bg-[#FEE2E2]"
            }`}
          >
            {isInactive ? (
              <>
                <ShieldCheck className="h-4 w-4" />
                Activate account
              </>
            ) : (
              <>
                <ShieldOff className="h-4 w-4" />
                Deactivate account
              </>
            )}
          </button>
        </div>

        {/* Confirm modal */}
        <AnimatePresence>
          {confirmStatus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => !pending && setConfirmStatus(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-2xl bg-white p-6"
              >
                <h3 className="text-base font-bold text-[#102A43]">
                  {isInactive ? "Activate account?" : "Deactivate account?"}
                </h3>
                <p className="mt-2 text-sm text-[#627D98]">
                  {isInactive
                    ? `${user.name} will regain full access to CheckItRight.`
                    : `${user.name} will be immediately signed out and blocked from accessing the app.`}
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    onClick={() => setConfirmStatus(false)}
                    disabled={pending}
                    className="rounded-lg border border-[#D9E2EC] px-4 py-2 text-sm font-semibold text-[#627D98] transition hover:bg-[#F7FAFC]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitStatus}
                    disabled={pending}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${
                      isInactive
                        ? "bg-[#16A34A] hover:bg-[#15803D]"
                        : "bg-[#DC2626] hover:bg-[#B91C1C]"
                    }`}
                  >
                    {pending ? "Working…" : isInactive ? "Activate" : "Deactivate"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatBox label="Scans" value={user.scansCount} />
        <StatBox label="Reports" value={user.reportsCount} />
        <StatBox label="Inspections" value={user.inspectionsCount} />
      </div>

      {/* Role change history */}
      <div className="rounded-xl border border-[#D9E2EC] bg-white shadow-sm">
        <div className="border-b border-[#D9E2EC] px-5 py-4">
          <h3 className="text-sm font-bold text-[#102A43]">
            Role change history
          </h3>
        </div>
        {user.recentRoleChanges.length === 0 ? (
          <p className="px-5 py-6 text-center text-xs text-[#829AB1]">
            No role changes yet.
          </p>
        ) : (
          <div className="divide-y divide-[#D9E2EC]">
            {user.recentRoleChanges.map((r) => (
              <div key={r.id} className="px-5 py-4">
                <p className="text-sm text-[#102A43]">
                  <span className="font-semibold">
                    {ROLE_LABEL[r.oldRole as keyof typeof ROLE_LABEL] ?? r.oldRole}
                  </span>
                  {" → "}
                  <span className="font-semibold">
                    {ROLE_LABEL[r.newRole as keyof typeof ROLE_LABEL] ?? r.newRole}
                  </span>
                </p>
                <p className="mt-1 text-xs text-[#829AB1]">
                  by {r.changedBy} · {fmt(r.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#D9E2EC] bg-white p-4 text-center shadow-sm">
      <p className="text-2xl font-bold text-[#102A43]">{value}</p>
      <p className="mt-1 text-xs text-[#627D98]">{label}</p>
    </div>
  );
}