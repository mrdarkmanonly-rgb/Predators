"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Bell, Mail, Info } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "cir_inspector_preferences";

type Prefs = {
  emailNotifications: boolean;
  inAppNotifications: boolean;
};

const DEFAULT_PREFS: Prefs = {
  emailNotifications: true,
  inAppNotifications: true,
};

export default function InspectorSettingsClient() {
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
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#102A43]">Settings</h1>
        <p className="text-sm text-[#627D98] mt-1">
          Manage your account and preferences.
        </p>
      </div>

      {/* Account */}
      <Section title="Account">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[#D9E2EC] hover:border-red-300 hover:bg-red-50/40 transition text-left"
        >
          <span className="flex items-center gap-3 text-sm font-medium text-[#102A43]">
            <LogOut className="w-4 h-4 text-red-600" />
            Sign out of your account
          </span>
          <span className="text-xs text-[#627D98]">→</span>
        </button>
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        <ToggleRow
          icon={<Mail className="w-4 h-4 text-[#1769AA]" />}
          label="Email notifications"
          description="Receive updates about your cases by email."
          checked={prefs.emailNotifications}
          onChange={() => toggle("emailNotifications")}
        />
        <ToggleRow
          icon={<Bell className="w-4 h-4 text-[#1769AA]" />}
          label="In-app notifications"
          description="Show notifications in the app for case activity."
          checked={prefs.inAppNotifications}
          onChange={() => toggle("inAppNotifications")}
        />
      </Section>

      {/* About */}
      <Section title="About">
        <Row
          icon={<Info className="w-4 h-4 text-[#1769AA]" />}
          label="Version"
          value="1.0.0"
        />
        <Row
          icon={<Info className="w-4 h-4 text-[#1769AA]" />}
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
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#627D98] px-1 mb-2">
        {title}
      </h2>
      <div className="bg-white rounded-2xl border border-[#D9E2EC] divide-y divide-[#EAF0F6] overflow-hidden">
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
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-8 h-8 shrink-0 rounded-lg bg-[#EAF4FF] flex items-center justify-center">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#102A43]">{label}</p>
          <p className="text-xs text-[#627D98] mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-[#1769AA]" : "bg-[#CBD5E0]"
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow ${
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
        <div className="w-8 h-8 shrink-0 rounded-lg bg-[#EAF4FF] flex items-center justify-center">
          {icon}
        </div>
        <p className="text-sm font-medium text-[#102A43]">{label}</p>
      </div>
      <p className="text-xs text-[#627D98]">{value}</p>
    </div>
  );
}