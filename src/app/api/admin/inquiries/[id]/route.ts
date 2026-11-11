import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { status, notes } = await req.json();

    if (status) {
      const allowed = ["New", "Contacted", "In Progress", "Completed"];
      if (!allowed.includes(status)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      db.prepare(
        "UPDATE inquiries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      ).run(status, id);
    }

    if (notes !== undefined) {
      db.prepare(
        "UPDATE inquiries SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      ).run(notes, id);
    }

    const updated = db.prepare("SELECT * FROM inquiries WHERE id = ?").get(id);
    return NextResponse.json({ success: true, inquiry: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    db.prepare("DELETE FROM inquiries WHERE id = ?").run(id);
    return NextResponse.json({ success: true, message: "Inquiry deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}
