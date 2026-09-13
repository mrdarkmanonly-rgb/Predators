import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  subtitle?: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  positive?: boolean;
}

export default function StatCard({
  title,
  value,
  change,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  positive = true,
}: StatCardProps) {
  const showDelta = change || subtitle;

  return (
    <div className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#627D98]">
            {title}
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[#102A43]">
            {value}
          </h2>

          {showDelta && (
            <div className="mt-2 flex items-center gap-2">
              {change && (
                <span
                  className={`text-xs font-semibold ${
                    positive ? "text-[#16A34A]" : "text-[#DC2626]"
                  }`}
                >
                  {change}
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-[#829AB1]">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg}`}
        >
          <Icon size={22} className={iconColor} />
        </div>
      </div>
    </div>
  );
}