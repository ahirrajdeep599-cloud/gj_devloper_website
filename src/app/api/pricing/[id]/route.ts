import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface DBPricingRow {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  price_label: string;
  category: string;
  badge: string;
  description: string;
  features: string;
  whatsapp_preset: string;
  is_popular: number;
  is_active: number;
  sort_order: number;
  created_at: string;
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
    const existing = db.prepare("SELECT * FROM pricing_plans WHERE id = ?").get(id) as DBPricingRow | undefined;

    if (!existing) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const name = body.name !== undefined ? body.name.trim() : existing.name;
    const subtitle = body.subtitle !== undefined ? body.subtitle.trim() : existing.subtitle;
    const price = body.price !== undefined ? body.price.trim() : existing.price;
    const price_label = body.price_label !== undefined ? body.price_label : existing.price_label;
    const category = body.category !== undefined ? body.category : existing.category;
    const badge = body.badge !== undefined ? body.badge : existing.badge;
    const description = body.description !== undefined ? body.description.trim() : existing.description;
    const features = body.features !== undefined ? JSON.stringify(body.features) : existing.features;
    const whatsapp_preset = body.whatsapp_preset !== undefined ? body.whatsapp_preset : existing.whatsapp_preset;
    const is_popular = body.is_popular !== undefined ? (body.is_popular ? 1 : 0) : existing.is_popular;
    const is_active = body.is_active !== undefined ? (body.is_active ? 1 : 0) : existing.is_active;
    const sort_order = body.sort_order !== undefined ? Number(body.sort_order) : existing.sort_order;

    db.prepare(`
      UPDATE pricing_plans SET
        name = ?,
        subtitle = ?,
        price = ?,
        price_label = ?,
        category = ?,
        badge = ?,
        description = ?,
        features = ?,
        whatsapp_preset = ?,
        is_popular = ?,
        is_active = ?,
        sort_order = ?
      WHERE id = ?
    `).run(
      name,
      subtitle,
      price,
      price_label,
      category,
      badge,
      description,
      features,
      whatsapp_preset,
      is_popular,
      is_active,
      sort_order,
      id
    );

    const updated = db.prepare("SELECT * FROM pricing_plans WHERE id = ?").get(id) as DBPricingRow | undefined;
    const formatted = updated
      ? {
          ...updated,
          features: JSON.parse(updated.features),
          is_popular: Boolean(updated.is_popular),
          is_active: Boolean(updated.is_active),
        }
      : null;

    return NextResponse.json({ success: true, plan: formatted });
  } catch (err: unknown) {
    console.error("[Pricing PATCH Error]:", err);
    return NextResponse.json({ error: "Failed to update pricing plan" }, { status: 500 });
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
    db.prepare("DELETE FROM pricing_plans WHERE id = ?").run(id);
    return NextResponse.json({ success: true, message: "Plan deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
  }
}
