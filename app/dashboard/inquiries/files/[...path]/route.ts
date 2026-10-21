import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { readInquiryAttachment } from "@/lib/inquiries/attachments";

/**
 * A file a visitor attached to an enquiry (BOQ, specification). Private: only
 * staff who can read enquiries get it, always as a download, never rendered
 * in the site's origin.
 */
export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "inquiry.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { path } = await context.params;
  const file = await readInquiryAttachment(path);
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${path[path.length - 1]}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
