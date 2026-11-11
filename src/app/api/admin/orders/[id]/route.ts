import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

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
    const { status, admin_notes } = await req.json();

    if (status) {
      const allowed = [
        "New",
        "Contacted",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];
      if (!allowed.includes(status)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
    }

    const sb = getSupabaseAdmin();
    if (sb) {
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (status) updates.status = status;
      if (admin_notes !== undefined) updates.admin_notes = admin_notes;

      const { data: updated, error } = await sb
        .from("orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("[Supabase Order PATCH Error]:", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
      }
      return NextResponse.json({ success: true, order: updated });
    }

    if (status) {
      db.prepare("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
        status,
        id
      );
    }

    if (admin_notes !== undefined) {
      db.prepare(
        "UPDATE orders SET admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      ).run(admin_notes, id);
    }

    const updated = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
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
    const sb = getSupabaseAdmin();
    if (sb) {
      const { error } = await sb.from("orders").delete().eq("id", id);
      if (error) {
        return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Order deleted successfully" });
    }

    db.prepare("DELETE FROM orders WHERE id = ?").run(id);
    return NextResponse.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Failed to delete order:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
