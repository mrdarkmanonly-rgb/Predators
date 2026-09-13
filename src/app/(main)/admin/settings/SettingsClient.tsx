"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Bell, Mail, Info, Eye, ListOrdered } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "cir_admin_preferences";

type Prefs = {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  compactLists: boolean;
  showRelativeTimes: boolean;
};

const DEFAULT_PREFS: Prefs = {
  emailNotifications: true,
  inAppNotifications: true,
  compactLists: false,
  showRelativeTimes: true,
};

export default function SettingsClient() {
  const { signOut } = useClerk();
  const router = useRouter();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs, hydrated]);

  function toggle(key: keyof Prefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#102A43]">Settings</h2>
        <p className="mt-1 text-sm text-[#627D98]">
          Admin preferences and account controls.
        </p>
      </div>

      {/* Account */}
      <Section title="Account">
        <button
          onClick={handleSignOut}
          className="w-full rounded-xl border border-[#D9E2EC] px-4 py-3 text-left transition hover:border-red-300 hover:bg-red-50/40"
        >
          <span className="flex items-center justify-between gap-3 text-sm font-medium text-[#102A43]">
            <span className="flex items-center gap-3">
              <LogOut className="h-4 w-4 text-red-600" />
              Sign out of your account
            </span>
            <span className="text-xs text-[#627D98]">→</span>
          </span>
        </button>
      </Section>

      {/* Display */}
      <Section title="Display">
        <ToggleRow
          icon={<ListOrdered className="h-4 w-4 text-[#1769AA]" />}
          label="Compact lists"
          description="Show more rows with reduced padding."
          checked={prefs.compactLists}
          onChange={() => toggle("compactLists")}
        />
        <ToggleRow
          icon={<Eye className="h-4 w-4 text-[#1769AA]" />}
          label="Show relative times"
          description="Display '2 hours ago' instead of exact timestamps."
          checked={prefs.showRelativeTimes}
          onChange={() => toggle("showRelativeTimes")}
        />
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <ToggleRow
          icon={<Mail className="h-4 w-4 text-[#1769AA]" />}
          label="Email notifications"
          description="Receive system updates by email."
          checked={prefs.emailNotifications}
          onChange={() => toggle("emailNotifications")}
        />
        <ToggleRow
          icon={<Bell className="h-4 w-4 text-[#1769AA]" />}
          label="In-app notifications"
          description="Show notifications in the admin panel."
          checked={prefs.inAppNotifications}
          onChange={() => toggle("inAppNotifications")}
        />
      </Section>

      {/* About */}
      <Section title="About">
        <Row
          icon={<Info className="h-4 w-4 text-[#1769AA]" />}
          label="Version"
          value="1.0.0"
        />
        <Row
          icon={<Info className="h-4 w-4 text-[#1769AA]" />}
          label="Environment"
          value={process.env.NODE_ENV === "production" ? "Production" : "Development"}
        />
        <Row
          icon={<Info className="h-4 w-4 text-[#1769AA]" />}
          label="Preference storage"
          value="Local to this browser"
        />
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-[#627D98]">
        {title}
      </h3>
      <div className="divide-y divide-[#EAF0F6] overflow-hidden rounded-xl border border-[#D9E2EC] bg-white shadow-sm">
        {children}
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF4FF]">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#102A43]">{label}</p>
          <p className="mt-0.5 text-xs text-[#627D98]">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[#1769AA]" : "bg-[#CBD5E0]"
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF4FF]">
          {icon}
        </div>
        <p className="text-sm font-medium text-[#102A43]">{label}</p>
      </div>
      <p className="text-xs text-[#627D98]">{value}</p>
    </div>
  );
}