import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";

/** Newsletter list as CSV (Dashboard → Inquiries → Newsletter → Export). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "inquiry.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await prisma.inquiry.findMany({
    where: { kind: "NEWSLETTER" },
    orderBy: { createdAt: "desc" },
    select: { email: true, locale: true, createdAt: true, sourcePath: true },
  });

  // Quote every cell; a leading = + - @ is neutralised so a spreadsheet never
  // evaluates a submitted value as a formula.
  const cell = (value: string) => `"${value.replace(/^[=+\-@\t\r]/, "'$&").replace(/"/g, '""')}"`;
  const lines = [
    ["Email", "Language", "Signed up", "Page"].map(cell).join(","),
    ...rows.map((r) => [r.email, r.locale, r.createdAt.toISOString(), r.sourcePath ?? ""].map(cell).join(",")),
  ];

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(`﻿${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cnx-newsletter-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
