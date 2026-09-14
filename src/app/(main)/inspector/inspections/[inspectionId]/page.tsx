import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  MapPin,
  Store,
  User,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { fmtDateTime } from "@/lib/format";
import { getInspectionDetail } from "@/lib/inspector/get-inspection-detail";
import InspectionActions from "./InspectionActions";

const IMAGE_TYPE_LABEL: Record<string, string> = {
  FRONT: "Front",
  BACK: "Back",
  SIDE: "Side",
  ADDITIONAL: "Additional",
};

export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ inspectionId: string }>;
}) {
  const { inspectionId } = await params;
  const i = await getInspectionDetail(inspectionId);
  if (!i) notFound();

  const addressLine = [i.shopAddress, i.city, i.state, i.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-5">
      <Link
        href="/inspector/my-cases"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1769AA] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Cases
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-[#D9E2EC] bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-mono text-[#829AB1]">
              {i.reportCode}
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#102A43]">
              {i.product?.productName ??
                i.product?.brandName ??
                "Unknown product"}
            </h2>
            <p className="mt-1 text-sm text-[#627D98]">
              Claimed {fmtDateTime(i.claimDate)}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              i.isCompleted
                ? "bg-[#DCFCE7] text-[#15803D]"
                : "bg-[#DBEAFE] text-[#1D4ED8]"
            }`}
          >
            {i.isCompleted ? "Completed" : "In Progress"}
          </span>
        </div>
      </div>

      {/* Reviewer note */}
      {i.reviewerRemark && (
        <div className="space-y-2 rounded-xl border border-[#DBEAFE] bg-[#EAF4FF] p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#102A43]">
            <MessageSquare className="h-4 w-4 text-[#1769AA]" />
            Reviewer&apos;s forwarding note
          </h3>
          <p className="text-sm italic text-[#486581]">
            &ldquo;{i.reviewerRemark}&rdquo;
          </p>
        </div>
      )}

      {/* People */}
      <div className="rounded-xl border border-[#D9E2EC] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#829AB1]">
          <User className="h-3.5 w-3.5" />
          Reported by
        </div>
        <p className="mt-2 text-sm font-semibold text-[#102A43]">
          {i.submitter.name}
        </p>
        <p className="text-xs text-[#829AB1]">{i.submitter.email}</p>
      </div>

      {/* Issue */}
      <div className="space-y-4 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#102A43]">Reported issue</h3>

        {i.issueType && (
          <Field label="Type">
            <span className="inline-flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-[#627D98]" />
              {i.issueType}
            </span>
          </Field>
        )}

        {i.description && (
          <Field label="Description">
            <span className="whitespace-pre-line">{i.description}</span>
          </Field>
        )}
      </div>

      {/* Shop / address */}
      {(i.shopName || addressLine || i.locationText) && (
        <div className="space-y-4 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#102A43]">
            Shop &amp; location
          </h3>

          {i.shopName && (
            <Field label="Shop / Seller">
              <span className="inline-flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5 text-[#627D98]" />
                {i.shopName}
              </span>
            </Field>
          )}

          {addressLine && (
            <Field label="Address">
              <span className="whitespace-pre-line">{addressLine}</span>
            </Field>
          )}

          {i.locationText && (
            <Field label="Location note">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#627D98]" />
                {i.locationText}
              </span>
            </Field>
          )}

          {i.latitude != null && i.longitude != null && (
            <Field label="Map">
              <a
                href={`https://www.google.com/maps?q=${i.latitude},${i.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#1769AA] hover:underline"
              >
                Open in Google Maps →
              </a>
            </Field>
          )}
        </div>
      )}

      {/* Product */}
      {i.product && (
        <div className="space-y-2 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#102A43]">Product</h3>
          <p className="text-sm text-[#102A43]">
            {i.product.productName ?? "Unnamed"}
          </p>
          <p className="text-xs text-[#627D98]">
            {[i.product.brandName, i.product.category]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-[#829AB1]">
            {i.product.manufacturer && (
              <span>Mfr: {i.product.manufacturer}</span>
            )}
            {i.product.mrp && <span>MRP {i.product.mrp}</span>}
            {i.product.netQuantity && <span>{i.product.netQuantity}</span>}
          </div>
        </div>
      )}

      {/* Evidence */}
      <div className="space-y-3 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#102A43]">
          Citizen evidence photos
        </h3>
        {i.evidence.length === 0 ? (
          <p className="text-xs text-[#829AB1]">
            No evidence photos attached.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {i.evidence.map((img) => (
              <a
                key={img.id}
                href={img.secureUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square overflow-hidden rounded-xl border border-[#D9E2EC] bg-[#F7FAFC]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.secureUrl}
                  alt={IMAGE_TYPE_LABEL[img.imageType] ?? "Evidence"}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {IMAGE_TYPE_LABEL[img.imageType] ?? img.imageType}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Findings + actions */}
      {i.isCompleted ? (
        <CompletedSummary inspection={i} />
      ) : (
        <InspectionActions
          inspectionId={i.inspectionId}
          reportCode={i.reportCode}
        />
      )}
    </div>
  );
}

function CompletedSummary({
  inspection,
}: {
  inspection: Awaited<ReturnType<typeof getInspectionDetail>> extends infer T
    ? T extends null
      ? never
      : T
    : never;
}) {
  const isResolved = inspection.remarks != null && inspection.violationFound;
  return (
    <div className="space-y-4 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-[#102A43]">
        Inspection summary
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Claimed">
          {fmtDateTime(inspection.claimDate)}
        </Field>
        <Field label="Completed">
          {inspection.completedAt ? fmtDateTime(inspection.completedAt) : "—"}
        </Field>
      </div>

      <Field label="Finding">
        {inspection.violationFound ? (
          <span className="inline-flex items-center gap-1.5 text-[#DC2626]">
            <CheckCircle2 className="h-4 w-4" />
            Violation found
            {inspection.violationType ? ` · ${inspection.violationType}` : ""}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[#16A34A]">
            <XCircle className="h-4 w-4" />
            No violation found
          </span>
        )}
      </Field>

      {inspection.observation && (
        <Field label="Observation">
          <span className="whitespace-pre-line">
            {inspection.observation}
          </span>
        </Field>
      )}

      {inspection.actionType && (
        <Field label="Action taken">
          <span className="font-semibold">{inspection.actionType}</span>
          {inspection.actionDetails && (
            <span className="mt-1 block whitespace-pre-line font-normal">
              {inspection.actionDetails}
            </span>
          )}
          {inspection.followUpRequired && (
            <span className="mt-1 block font-semibold text-[#DC2626]">
              Follow-up required
            </span>
          )}
        </Field>
      )}

      {inspection.remarks && (
        <Field label="Final remark">
          <span className="italic">&ldquo;{inspection.remarks}&rdquo;</span>
        </Field>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
        {label}
      </p>
      <p className="mt-1 text-sm text-[#102A43]">{children}</p>
    </div>
  );
}