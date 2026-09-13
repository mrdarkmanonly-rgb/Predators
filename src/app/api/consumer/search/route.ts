import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-guard";
import prisma from "@/utils/prisma.client";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ scans: [], reports: [] }, { status: 401 });

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ scans: [], reports: [] });

  const [scans, reports] = await Promise.all([
    prisma.scan.findMany({
      where: {
        userId: user.id,
        OR: [
          { product: { productName: { contains: q, mode: "insensitive" } } },
          { product: { brandName: { contains: q, mode: "insensitive" } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        product: { select: { productName: true, brandName: true } },
      },
    }),
    prisma.citizenReport.findMany({
      where: {
        submittedById: user.id,
        OR: [
          { reportCode: { contains: q, mode: "insensitive" } },
          { product: { productName: { contains: q, mode: "insensitive" } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        reportCode: true,
        status: true,
        product: { select: { productName: true, brandName: true } },
      },
    }),
  ]);

  return NextResponse.json({
    scans: scans.map((s) => ({
      id: s.id,
      productName: s.product?.productName ?? s.product?.brandName ?? "Unknown product",
      status: s.status,
    })),
    reports: reports.map((r) => ({
      id: r.id,
      reportCode: r.reportCode,
      productName: r.product?.productName ?? r.product?.brandName ?? "Unknown product",
      status: r.status,
    })),
  });
}