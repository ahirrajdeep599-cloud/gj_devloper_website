import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

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
  features: string | string[];
  whatsapp_preset: string;
  is_popular: number | boolean;
  is_active: number | boolean;
  sort_order: number;
  created_at: string;
}

function formatPlan(r: DBPricingRow) {
  return {
    ...r,
    features: typeof r.features === "string" ? JSON.parse(r.features) : r.features || [],
    is_popular: Boolean(r.is_popular),
    is_active: Boolean(r.is_active),
  };
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

    const sb = getSupabaseAdmin();
    if (sb) {
      const { data: existing, error: findErr } = await sb
        .from("pricing_packages")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (findErr || !existing) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (body.name !== undefined) updates.name = body.name.trim();
      if (body.subtitle !== undefined) updates.subtitle = body.subtitle.trim();
      if (body.price !== undefined) updates.price = body.price.trim();
      if (body.price_label !== undefined) updates.price_label = body.price_label;
      if (body.category !== undefined) updates.category = body.category;
      if (body.badge !== undefined) updates.badge = body.badge;
      if (body.description !== undefined) updates.description = body.description.trim();
      if (body.features !== undefined) updates.features = Array.isArray(body.features) ? body.features : [];
      if (body.whatsapp_preset !== undefined) updates.whatsapp_preset = body.whatsapp_preset;
      if (body.is_popular !== undefined) updates.is_popular = Boolean(body.is_popular);
      if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active);
      if (body.sort_order !== undefined) updates.sort_order = Number(body.sort_order);

      const { data: updated, error: updErr } = await sb
        .from("pricing_packages")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updErr) {
        console.error("[Pricing Supabase PATCH Error]:", updErr);
        return NextResponse.json({ error: "Failed to update pricing plan" }, { status: 500 });
      }

      return NextResponse.json({ success: true, plan: formatPlan(updated as DBPricingRow) });
    }

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
    const features = body.features !== undefined ? JSON.stringify(body.features) : String(existing.features);
    const whatsapp_preset = body.whatsapp_preset !== undefined ? body.whatsapp_preset : existing.whatsapp_preset;
    const is_popular = body.is_popular !== undefined ? (body.is_popular ? 1 : 0) : existing.is_popular;
    const is_active = body.is_active !== undefined ? (body.is_active ? 1 : 0) : existing.is_active;
    const sort_order = body.sort_order !== undefined ? Number(body.sort_order) : existing.sort_order;

    db.prepare(`
      UPDATE pricing_plans SET
        name = ?, subtitle = ?, price = ?, price_label = ?, category = ?,
        badge = ?, description = ?, features = ?, whatsapp_preset = ?,
        is_popular = ?, is_active = ?, sort_order = ?
      WHERE id = ?
    `).run(name, subtitle, price, price_label, category, badge, description, features, whatsapp_preset, is_popular, is_active, sort_order, id);

    const updated = db.prepare("SELECT * FROM pricing_plans WHERE id = ?").get(id) as DBPricingRow | undefined;
    return NextResponse.json({ success: true, plan: updated ? formatPlan(updated) : null });
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
    const sb = getSupabaseAdmin();
    if (sb) {
      const { error } = await sb.from("pricing_packages").delete().eq("id", id);
      if (error) {
        return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Plan deleted successfully" });
    }

    db.prepare("DELETE FROM pricing_plans WHERE id = ?").run(id);
    return NextResponse.json({ success: true, message: "Plan deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
  }
}
