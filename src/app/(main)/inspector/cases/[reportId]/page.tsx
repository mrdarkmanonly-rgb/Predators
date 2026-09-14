import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  MapPin,
  Store,
  User,
  FileText,
  MessageSquare,
} from "lucide-react";
import { fmtDateTime } from "@/lib/format";
import { getAvailableCaseDetail } from "@/lib/inspector/get-available-case-detail";
import TakeCaseButton from "./TakeCaseButton"
const IMAGE_TYPE_LABEL: Record<string, string> = {
  FRONT: "Front",
  BACK: "Back",
  SIDE: "Side",
  ADDITIONAL: "Additional",
};

export default async function InspectorCaseDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const c = await getAvailableCaseDetail(reportId);
  if (!c) notFound();

  const addressLine = [c.shopAddress, c.city, c.state, c.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-5">
      <Link
        href="/inspector/available"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1769AA] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Available Cases
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-[#D9E2EC] bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-mono text-[#829AB1]">{c.code}</p>
            <h2 className="mt-1 text-xl font-bold text-[#102A43]">
              {c.product?.productName ??
                c.product?.brandName ??
                "Unknown product"}
            </h2>
            <p className="mt-1 text-sm text-[#627D98]">
              Forwarded {fmtDateTime(c.forwardedAt)}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[#DBEAFE] px-3 py-1.5 text-xs font-semibold text-[#1D4ED8]">
            {c.statusLabel}
          </span>
        </div>
      </div>

      {/* Reviewer note */}
      {c.reviewerRemark && (
        <div className="space-y-2 rounded-xl border border-[#DBEAFE] bg-[#EAF4FF] p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#102A43]">
            <MessageSquare className="h-4 w-4 text-[#1769AA]" />
            Reviewer&apos;s forwarding note
          </h3>
          <p className="text-sm italic text-[#486581]">
            &ldquo;{c.reviewerRemark}&rdquo;
          </p>
          {c.reviewerName && (
            <p className="text-[11px] text-[#829AB1]">
              — {c.reviewerName}, {fmtDateTime(c.forwardedAt)}
            </p>
          )}
        </div>
      )}

      {/* People */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PersonCard
          title="Reported by"
          name={c.submitter.name}
          email={c.submitter.email}
          icon={<User className="h-3.5 w-3.5" />}
        />
        <PersonCard
          title="Forwarded by"
          name={c.reviewerName ?? "—"}
          email={c.reviewerName ? "Reviewer" : "Not yet forwarded"}
          icon={<User className="h-3.5 w-3.5" />}
          muted={!c.reviewerName}
        />
      </div>

      {/* Issue */}
      <div className="space-y-4 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#102A43]">Reported issue</h3>

        {c.issueType && (
          <Field label="Type">
            <span className="inline-flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-[#627D98]" />
              {c.issueType}
            </span>
          </Field>
        )}

        {c.description && (
          <Field label="Description">
            <span className="whitespace-pre-line">{c.description}</span>
          </Field>
        )}
      </div>

      {/* Shop + Address */}
      {(c.shopName ||
        c.shopAddress ||
        c.city ||
        c.state ||
        c.pincode ||
        c.locationText) && (
        <div className="space-y-4 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#102A43]">
            Shop &amp; location
          </h3>

          {c.shopName && (
            <Field label="Shop / Seller">
              <span className="inline-flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5 text-[#627D98]" />
                {c.shopName}
              </span>
            </Field>
          )}

          {addressLine && (
            <Field label="Address">
              <span className="whitespace-pre-line">{addressLine}</span>
            </Field>
          )}

          {c.locationText && (
            <Field label="Location note">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#627D98]" />
                {c.locationText}
              </span>
            </Field>
          )}

          {c.latitude != null && c.longitude != null && (
            <Field label="Coordinates">
              <a
                href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#1769AA] hover:underline"
              >
                {c.latitude.toFixed(5)}, {c.longitude.toFixed(5)} →
              </a>
            </Field>
          )}
        </div>
      )}

      {/* Product */}
      {c.product && (
        <div className="space-y-2 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#102A43]">Product</h3>
          <p className="text-sm text-[#102A43]">
            {c.product.productName ?? "Unnamed"}
          </p>
          <p className="text-xs text-[#627D98]">
            {[c.product.brandName, c.product.category]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-[#829AB1]">
            {c.product.manufacturer && (
              <span>Mfr: {c.product.manufacturer}</span>
            )}
            {c.product.mrp && <span>MRP {c.product.mrp}</span>}
            {c.product.netQuantity && <span>{c.product.netQuantity}</span>}
          </div>
        </div>
      )}

      {/* Evidence */}
      <div className="space-y-3 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#102A43]">Evidence photos</h3>
        {c.evidence.length === 0 ? (
          <p className="text-xs text-[#829AB1]">
            No evidence photos attached.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {c.evidence.map((img) => (
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

      {/* Scan metadata */}
      {c.scan && (
        <div className="space-y-3 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#102A43]">
            <FileText className="h-4 w-4 text-[#1769AA]" />
            Scan metadata
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            {c.scan.ocrConfidence !== null && (
              <Field label="OCR confidence">
                {(c.scan.ocrConfidence * 100).toFixed(0)}%
              </Field>
            )}
            {c.scan.ocrEngine && (
              <Field label="Engine">
                {c.scan.ocrEngine}
                {c.scan.ocrVersion ? ` ${c.scan.ocrVersion}` : ""}
              </Field>
            )}
          </div>
        </div>
      )}

      {/* Take Case */}
      <TakeCaseButton reportId={c.reportId} reportCode={c.code} />
    </div>
  );
}

function PersonCard({
  title,
  name,
  email,
  icon,
  muted,
}: {
  title: string;
  name: string;
  email: string;
  icon: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#D9E2EC] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#829AB1]">
        {icon}
        {title}
      </div>
      <p
        className={`mt-2 text-sm font-semibold ${
          muted ? "text-[#829AB1]" : "text-[#102A43]"
        }`}
      >
        {name}
      </p>
      <p className="text-xs text-[#829AB1]">{email}</p>
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