"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, FileText, ScanLine } from "lucide-react";

type Props = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  imageUrl?: string | null;
};

type Suggestion = {
  scans: { id: string; productName: string; status: string }[];
  reports: { id: string; reportCode: string; productName: string; status: string }[];
};

function displayName(name?: string | null, email?: string | null) {
  if (name && name.trim()) return name.trim();
  if (email) return email.split("@")[0];
  return "there";
}

function initialsFrom(display: string) {
  const parts = display.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function roleLabel(role?: string | null) {
  const map: Record<string, string> = {
    CONSUMER: "Consumer",
    REVIEWER: "Reviewer",
    INSPECTOR: "Inspector",
    ADMIN: "Admin",
  };
  return role ? map[role] ?? role : "";
}

export default function Header({ name, email, role, imageUrl }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Suggestion>({ scans: [], reports: [] });
  const containerRef = useRef<HTMLDivElement>(null);
  const display = displayName(name, email);
  const initials = initialsFrom(display);

  // debounced fetch
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults({ scans: [], reports: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/consumer/search?q=${encodeURIComponent(term)}`,
          { signal: ctrl.signal },
        );
        if (res.ok) {
          const data = (await res.json()) as Suggestion;
          setResults(data);
        }
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  // close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const totalSuggestions = results.scans.length + results.reports.length;

  function goToFullSearch() {
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    router.push(`/consumer/search?q=${encodeURIComponent(term)}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    goToFullSearch();
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 bg-[#F7FAFC]/80 backdrop-blur-lg border-b border-[#D9E2EC] px-4 lg:px-8 py-3 flex items-center gap-4"
    >
      <div ref={containerRef} className="flex-1 relative max-w-md">
        <form onSubmit={onSubmit}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#627D98]" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Search products, scans, reports..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#D9E2EC] text-sm text-[#102A43] placeholder:text-[#627D98] focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] transition"
          />
        </form>

        <AnimatePresence>
          {open && q.trim().length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-[#D9E2EC] bg-white shadow-lg overflow-hidden"
            >
              {loading && totalSuggestions === 0 && (
                <div className="p-4 text-sm text-[#627D98]">Searching…</div>
              )}

              {!loading && totalSuggestions === 0 && (
                <div className="p-4 text-sm text-[#627D98]">
                  No matches for “{q.trim()}”.
                </div>
              )}

              {results.scans.length > 0 && (
                <div className="py-2">
                  <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-[#627D98]">
                    Scans
                  </p>
                  {results.scans.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setOpen(false);
                        router.push("/consumer/scans");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[#F7FAFC] transition"
                    >
                      <ScanLine className="w-4 h-4 text-[#1769AA] shrink-0" />
                      <span className="text-sm text-[#102A43] truncate flex-1">
                        {s.productName}
                      </span>
                      <span className="text-[10px] font-semibold text-[#627D98]">
                        {s.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {results.reports.length > 0 && (
                <div className="py-2 border-t border-[#EAF0F6]">
                  <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-[#627D98]">
                    Reports
                  </p>
                  {results.reports.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setOpen(false);
                        router.push("/consumer/reports");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[#F7FAFC] transition"
                    >
                      <FileText className="w-4 h-4 text-[#1769AA] shrink-0" />
                      <span className="text-sm text-[#102A43] truncate flex-1">
                        {r.productName}
                      </span>
                      <span className="text-[10px] font-mono text-[#627D98]">
                        #{r.reportCode}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {totalSuggestions > 0 && (
                <button
                  onClick={goToFullSearch}
                  className="w-full px-4 py-3 text-left text-xs font-semibold text-[#1769AA] bg-[#F7FAFC] border-t border-[#EAF0F6] hover:bg-[#EAF4FF] transition"
                >
                  See all results for “{q.trim()}” →
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button className="relative p-2 rounded-xl hover:bg-white transition">
        <Bell className="w-5 h-5 text-[#102A43]" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full" />
      </button>

      <div className="flex items-center gap-3 pl-3 border-l border-[#D9E2EC]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={display}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1769AA] to-[#0B1F33] flex items-center justify-center text-white text-sm font-semibold">
            {initials}
          </div>
        )}
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-[#102A43] leading-tight">
            {display}
          </p>
          <p className="text-xs text-[#627D98]">{roleLabel(role)}</p>
        </div>
      </div>
    </motion.header>
  );
}