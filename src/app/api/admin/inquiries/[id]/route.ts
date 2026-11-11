import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { getSupabaseInquiries, saveSupabaseInquiries } from "@/lib/supabaseCatalog";

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
    }

    const sbInquiries = await getSupabaseInquiries();
    if (sbInquiries) {
      const idx = sbInquiries.findIndex((i) => String(i.id) === String(id));
      if (idx === -1) {
        return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
      }
      const existing = sbInquiries[idx];
      const updated = {
        ...existing,
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
        updated_at: new Date().toISOString(),
      };
      const nextList = [...sbInquiries];
      nextList[idx] = updated;
      await saveSupabaseInquiries(nextList);
      return NextResponse.json({ success: true, inquiry: updated });
    }

    if (status) {
      db.prepare("UPDATE inquiries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
        status,
        id
      );
    }

    if (notes !== undefined) {
      db.prepare("UPDATE inquiries SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
        notes,
        id
      );
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
    const sbInquiries = await getSupabaseInquiries();
    if (sbInquiries) {
      await saveSupabaseInquiries(sbInquiries.filter((i) => String(i.id) !== String(id)));
      return NextResponse.json({ success: true, message: "Inquiry deleted" });
    }

    db.prepare("DELETE FROM inquiries WHERE id = ?").run(id);
    return NextResponse.json({ success: true, message: "Inquiry deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}
