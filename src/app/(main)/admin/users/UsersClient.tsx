"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";
import type { AdminUser } from "@/lib/admin/get-admin-users";

type RoleFilter = "all" | AdminUser["role"];
type StatusFilter = "all" | AdminUser["status"];
type SortKey = "newest" | "oldest" | "name";

const ROLE_CHIPS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "CONSUMER", label: "Consumers" },
  { value: "REVIEWER", label: "Reviewers" },
  { value: "INSPECTOR", label: "Inspectors" },
  { value: "ADMIN", label: "Admins" },
];

const ROLE_LABEL: Record<AdminUser["role"], string> = {
  CONSUMER: "Consumer",
  REVIEWER: "Reviewer",
  INSPECTOR: "Inspector",
  ADMIN: "Admin",
};

const ROLE_COLOR: Record<AdminUser["role"], string> = {
  CONSUMER: "bg-[#E8F1FB] text-[#1769AA]",
  REVIEWER: "bg-[#EDE9FE] text-[#6D28D9]",
  INSPECTOR: "bg-[#FEF3C7] text-[#B45309]",
  ADMIN: "bg-[#DCFCE7] text-[#15803D]",
};

function initialsFrom(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function UsersClient({ users }: { users: AdminUser[] }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = users;

    if (role !== "all") result = result.filter((u) => u.role === role);
    if (status !== "all") result = result.filter((u) => u.status === status);

    if (q) {
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }

    const sorted = [...result];
    switch (sort) {
      case "newest":
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case "oldest":
        sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return sorted;
  }, [users, query, role, status, sort]);

  const activeSortLabel =
    sort === "newest" ? "Newest" : sort === "oldest" ? "Oldest" : "Name A–Z";

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#102A43]">Users</h2>
          <p className="mt-1 text-sm text-[#627D98]">
            All registered accounts in the system.
          </p>
        </div>
        <span className="mt-2 text-xs font-semibold text-[#627D98]">
          {filtered.length} of {users.length}
        </span>
      </div>

      {/* Role chips */}
      <div className="flex flex-wrap gap-2">
        {ROLE_CHIPS.map((c) => {
          const active = role === c.value;
          return (
            <button
              key={c.value}
              onClick={() => setRole(c.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-[#1769AA] bg-[#1769AA] text-white"
                  : "border-[#D9E2EC] bg-white text-[#627D98] hover:border-[#1769AA]/40 hover:text-[#1769AA]"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#627D98]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-xl border border-[#D9E2EC] bg-white py-2.5 pl-9 pr-3 text-sm text-[#102A43] placeholder:text-[#9FB3C8] focus:border-[#1769AA] focus:outline-none focus:ring-2 focus:ring-[#1769AA]/10"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="rounded-xl border border-[#D9E2EC] bg-white px-3 py-2.5 text-sm text-[#102A43] focus:border-[#1769AA] focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <div className="relative">
          <button
            onClick={() => setSortOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl border border-[#D9E2EC] bg-white px-3 py-2.5 text-sm text-[#102A43] transition hover:border-[#1769AA]/40"
          >
            <span>{activeSortLabel}</span>
            <ChevronDown
              className={`h-4 w-4 text-[#627D98] transition-transform ${
                sortOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-[#D9E2EC] bg-white shadow-lg"
              >
                {(
                  [
                    { v: "newest", l: "Newest" },
                    { v: "oldest", l: "Oldest" },
                    { v: "name", l: "Name A–Z" },
                  ] as { v: SortKey; l: string }[]
                ).map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => {
                      setSort(opt.v);
                      setSortOpen(false);
                    }}
                    className={`block w-full px-3 py-2.5 text-left text-sm transition ${
                      sort === opt.v
                        ? "bg-[#EAF4FF] font-semibold text-[#1769AA]"
                        : "text-[#102A43] hover:bg-[#F7FAFC]"
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* List */}
      {users.length === 0 ? (
        <div className="rounded-xl border border-[#D9E2EC] bg-white p-12 text-center">
          <p className="text-sm text-[#627D98]">No users yet.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[#D9E2EC] bg-white p-12 text-center">
          <p className="text-sm text-[#627D98]">No users match your filters.</p>
          <button
            onClick={() => {
              setQuery("");
              setRole("all");
              setStatus("all");
            }}
            className="mt-3 text-xs font-semibold text-[#1769AA] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <Link key={u.id} href={`/admin/users/${u.id}`} className="block">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className="flex items-center gap-4 rounded-xl border border-[#D9E2EC] bg-white p-4 transition hover:border-[#1769AA]/40"
              >
                {u.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={u.imageUrl}
                    alt={u.name}
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1769AA] to-[#0B1F33] text-sm font-bold text-white">
                    {initialsFrom(u.name)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[#102A43]">
                      {u.name}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        ROLE_COLOR[u.role]
                      }`}
                    >
                      {ROLE_LABEL[u.role]}
                    </span>
                    {u.status === "INACTIVE" && (
                      <span className="rounded-full bg-[#FEECEC] px-2 py-0.5 text-[10px] font-semibold text-[#DC2626]">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#627D98]">
                    {u.email}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#829AB1]">
                    Joined {fmtDate(u.createdAt)} · {u.scansCount} scans ·{" "}
                    {u.reportsCount} reports · {u.inspectionsCount} inspections
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}