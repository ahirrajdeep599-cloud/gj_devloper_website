import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { getSupabaseServices, saveSupabaseServices } from "@/lib/supabaseCatalog";

export const dynamic = "force-dynamic";

interface DBServiceRow {
  id: string;
  number: string;
  title: string;
  category: string;
  short_description: string;
  deliverables: string;
  starting_price: string;
  icon_type: string;
  badge: string;
  whatsapp_preset: string;
  gradient: string;
  is_active: number;
  sort_order: number;
}

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
    const body = await req.json();

    const sbServices = await getSupabaseServices();
    if (sbServices) {
      const idx = sbServices.findIndex((s) => s.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: "Service not found" }, { status: 404 });
      }
      const existing = sbServices[idx];
      const updated = {
        ...existing,
        title: body.title !== undefined ? body.title.trim() : existing.title,
        category: body.category !== undefined ? body.category : existing.category,
        short_description:
          body.short_description !== undefined
            ? body.short_description.trim()
            : existing.short_description,
        starting_price:
          body.starting_price !== undefined ? body.starting_price : existing.starting_price,
        icon_type: body.icon_type !== undefined ? body.icon_type : existing.icon_type,
        badge: body.badge !== undefined ? body.badge : existing.badge,
        deliverables:
          body.deliverables !== undefined ? body.deliverables : existing.deliverables,
        whatsapp_preset:
          body.whatsapp_preset !== undefined ? body.whatsapp_preset : existing.whatsapp_preset,
        is_active: body.is_active !== undefined ? Boolean(body.is_active) : existing.is_active,
        sort_order:
          body.sort_order !== undefined ? Number(body.sort_order) : existing.sort_order,
      };
      const nextList = [...sbServices];
      nextList[idx] = updated;
      await saveSupabaseServices(nextList);
      return NextResponse.json({ success: true, service: updated });
    }

    const existing = db.prepare("SELECT * FROM services WHERE id = ?").get(id) as DBServiceRow | undefined;
    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const title = body.title !== undefined ? body.title.trim() : existing.title;
    const category = body.category !== undefined ? body.category : existing.category;
    const short_description =
      body.short_description !== undefined ? body.short_description.trim() : existing.short_description;
    const starting_price =
      body.starting_price !== undefined ? body.starting_price : existing.starting_price;
    const icon_type = body.icon_type !== undefined ? body.icon_type : existing.icon_type;
    const badge = body.badge !== undefined ? body.badge : existing.badge;
    const deliverables =
      body.deliverables !== undefined ? JSON.stringify(body.deliverables) : existing.deliverables;
    const whatsapp_preset =
      body.whatsapp_preset !== undefined ? body.whatsapp_preset : existing.whatsapp_preset;
    const is_active =
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : existing.is_active;
    const sort_order =
      body.sort_order !== undefined ? Number(body.sort_order) : existing.sort_order;

    db.prepare(`
      UPDATE services SET
        title = ?, category = ?, short_description = ?, starting_price = ?,
        icon_type = ?, badge = ?, deliverables = ?, whatsapp_preset = ?,
        is_active = ?, sort_order = ?
      WHERE id = ?
    `).run(title, category, short_description, starting_price, icon_type, badge, deliverables, whatsapp_preset, is_active, sort_order, id);

    const updated = db.prepare("SELECT * FROM services WHERE id = ?").get(id) as DBServiceRow | undefined;
    const formatted = updated
      ? { ...updated, deliverables: JSON.parse(updated.deliverables), is_active: Boolean(updated.is_active) }
      : null;

    return NextResponse.json({ success: true, service: formatted });
  } catch (err: unknown) {
    console.error("[Services PATCH Error]:", err);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
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
    const sbServices = await getSupabaseServices();
    if (sbServices) {
      await saveSupabaseServices(sbServices.filter((s) => s.id !== id));
      return NextResponse.json({ success: true, message: "Service deleted successfully" });
    }

    db.prepare("DELETE FROM services WHERE id = ?").run(id);
    return NextResponse.json({ success: true, message: "Service deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
