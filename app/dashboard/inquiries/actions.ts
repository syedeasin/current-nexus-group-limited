"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type InquiryStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";

export type InquiryActionResult = { ok: true } | { ok: false; error: string };

const STATUSES: InquiryStatus[] = ["NEW", "READ", "ARCHIVED"];

function revalidateInquiries() {
  // The sidebar badge lives in the dashboard layout.
  revalidatePath("/dashboard", "layout");
}

export async function setInquiryStatus(id: string, status: InquiryStatus): Promise<InquiryActionResult> {
  await requirePermission("inquiry.manage");
  if (!STATUSES.includes(status)) return { ok: false, error: "Unknown status." };
  try {
    await prisma.inquiry.update({ where: { id }, data: { status } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { ok: false, error: "This message no longer exists." };
    }
    throw error;
  }
  revalidateInquiries();
  return { ok: true };
}

export async function deleteInquiry(id: string): Promise<InquiryActionResult> {
  await requirePermission("inquiry.manage");
  await prisma.inquiry.deleteMany({ where: { id } });
  revalidateInquiries();
  return { ok: true };
}
