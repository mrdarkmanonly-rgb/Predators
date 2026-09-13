import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  UserRound,
} from "lucide-react";

const reports = [
  {
    id: "#CR-2025-0842",
    product: "Packaged Food",
    date: "15 Sep 2025, 10:24 AM",
    status: "Pending Review",
  },
  {
    id: "#CR-2025-0841",
    product: "Beverage",
    date: "15 Sep 2025, 09:18 AM",
    status: "Under Review",
  },
  {
    id: "#CR-2025-0840",
    product: "Personal Care",
    date: "15 Sep 2025, 08:45 AM",
    status: "Assigned",
  },
  {
    id: "#CR-2025-0839",
    product: "Dairy Product",
    date: "14 Sep 2025, 06:32 PM",
    status: "Completed",
  },
];

const inspections = [
  {
    id: "#INSP-2025-0123",
    location: "Delhi, Connaught Place",
    inspector: "Rajesh Kumar",
    status: "In Progress",
  },
  {
    id: "#INSP-2025-0122",
    location: "Mumbai, Andheri",
    inspector: "Priya Sharma",
    status: "Assigned",
  },
  {
    id: "#INSP-2025-0121",
    location: "Bengaluru, Koramangala",
    inspector: "Arjun Nair",
    status: "In Progress",
  },
  {
    id: "#INSP-2025-0120",
    location: "Chennai, T. Nagar",
    inspector: "Meena Iyer",
    status: "Completed",
  },
];

const activities = [
  {
    title: "New report submitted",
    description: "#CR-2025-0842",
    time: "10 minutes ago",
    type: "report",
  },
  {
    title: "User role updated",
    description: "Rahul Verma → Reviewer",
    time: "25 minutes ago",
    type: "user",
  },
  {
    title: "Inspection completed",
    description: "#INSP-2025-0119",
    time: "1 hour ago",
    type: "inspection",
  },
  {
    title: "Product added",
    description: "Parle-G Biscuits (100g)",
    time: "2 hours ago",
    type: "product",
  },
];

function statusStyle(status: string) {
  switch (status) {
    case "Pending Review":
      return "bg-[#FEF3C7] text-[#B45309]";

    case "Under Review":
      return "bg-[#DBEAFE] text-[#1D4ED8]";

    case "Assigned":
      return "bg-[#EDE9FE] text-[#6D28D9]";

    case "In Progress":
      return "bg-[#DBEAFE] text-[#1D4ED8]";

    case "Completed":
      return "bg-[#DCFCE7] text-[#15803D]";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function DashboardLists() {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      
      {/* Recent Reports */}
      <div className="rounded-xl border border-[#D9E2EC] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#D9E2EC] px-5 py-4">
          <h2 className="font-bold text-[#102A43]">
            Recent Reports
          </h2>

          <button className="flex items-center gap-1 text-xs font-semibold text-[#1769AA] hover:underline">
            View all
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="divide-y divide-[#D9E2EC]">
          {reports.map((report) => (
            <div key={report.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF]">
                    <FileText size={18} className="text-[#1769AA]" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#102A43]">
                      {report.id}
                    </p>

                    <p className="mt-1 text-xs text-[#627D98]">
                      {report.product}
                    </p>

                    <p className="mt-1 text-[11px] text-[#829AB1]">
                      {report.date}
                    </p>
                  </div>
                </div>

                <span
                  className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyle(
                    report.status
                  )}`}
                >
                  {report.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Inspections */}
      <div className="rounded-xl border border-[#D9E2EC] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#D9E2EC] px-5 py-4">
          <h2 className="font-bold text-[#102A43]">
            Active Inspections
          </h2>

          <button className="flex items-center gap-1 text-xs font-semibold text-[#1769AA] hover:underline">
            View all
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="divide-y divide-[#D9E2EC]">
          {inspections.map((inspection) => (
            <div key={inspection.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#102A43]">
                    {inspection.id}
                  </p>

                  <div className="mt-1 flex items-center gap-1 text-xs text-[#627D98]">
                    <MapPin size={13} />
                    {inspection.location}
                  </div>

                  <div className="mt-1 flex items-center gap-1 text-[11px] text-[#829AB1]">
                    <UserRound size={12} />
                    Inspector: {inspection.inspector}
                  </div>
                </div>

                <span
                  className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyle(
                    inspection.status
                  )}`}
                >
                  {inspection.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="rounded-xl border border-[#D9E2EC] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#D9E2EC] px-5 py-4">
          <h2 className="font-bold text-[#102A43]">
            Recent Activities
          </h2>

          <button className="flex items-center gap-1 text-xs font-semibold text-[#1769AA] hover:underline">
            View all
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="divide-y divide-[#D9E2EC]">
          {activities.map((activity, index) => (
            <div key={index} className="flex gap-3 px-5 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
                {activity.type === "report" && (
                  <FileText size={17} className="text-[#1769AA]" />
                )}

                {activity.type === "user" && (
                  <UserRound size={17} className="text-[#1769AA]" />
                )}

                {activity.type === "inspection" && (
                  <CheckCircle2 size={17} className="text-[#16A34A]" />
                )}

                {activity.type === "product" && (
                  <Clock size={17} className="text-[#F59E0B]" />
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-[#102A43]">
                  {activity.title}
                </p>

                <p className="mt-1 text-xs text-[#627D98]">
                  {activity.description}
                </p>

                <p className="mt-1 text-[11px] text-[#829AB1]">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}