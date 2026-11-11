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

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("all") === "true" && !!admin;

    const sb = getSupabaseAdmin();
    if (sb) {
      let query = sb
        .from("pricing_packages")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return NextResponse.json(
          { success: true, plans: data.map((r) => formatPlan(r as DBPricingRow)) },
          { headers: { "Cache-Control": "no-store, max-age=0" } }
        );
      }
    }

    const sqlQuery = includeInactive
      ? "SELECT * FROM pricing_plans ORDER BY sort_order ASC, created_at ASC"
      : "SELECT * FROM pricing_plans WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC";

    const rows = db.prepare(sqlQuery).all() as DBPricingRow[];
    return NextResponse.json(
      { success: true, plans: rows.map(formatPlan) },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    console.error("[Pricing GET Error]:", err);
    return NextResponse.json({ error: "Failed to fetch pricing plans" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
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
    } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Plan name and price are required." }, { status: 400 });
    }

    const id = body.id || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const cleanFeatures = Array.isArray(features) ? features : [];
    const payload = {
      id,
      name: name.trim(),
      subtitle: subtitle ? subtitle.trim() : "",
      price: price.trim(),
      price_label: price_label || "Starting price",
      category: category || "Custom Package",
      badge: badge ? badge.trim() : "",
      description: description ? description.trim() : "",
      features: cleanFeatures,
      whatsapp_preset:
        whatsapp_preset ||
        `Hi GJ Devloper, I'm interested in the ${name} package (${price}). Can you share more details?`,
      is_popular: Boolean(is_popular),
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      sort_order: Number(sort_order) || 99,
    };

    const sb = getSupabaseAdmin();
    if (sb) {
      const { data, error } = await sb
        .from("pricing_packages")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("[Pricing Supabase POST Error]:", error);
        return NextResponse.json({ error: "Failed to create plan in Supabase" }, { status: 500 });
      }

      return NextResponse.json({ success: true, plan: formatPlan(data as DBPricingRow) });
    }

    db.prepare(`
      INSERT INTO pricing_plans (
        id, name, subtitle, price, price_label, category, badge, description, features, whatsapp_preset, is_popular, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      payload.id,
      payload.name,
      payload.subtitle,
      payload.price,
      payload.price_label,
      payload.category,
      payload.badge,
      payload.description,
      JSON.stringify(payload.features),
      payload.whatsapp_preset,
      payload.is_popular ? 1 : 0,
      payload.is_active ? 1 : 0,
      payload.sort_order
    );

    const created = db.prepare("SELECT * FROM pricing_plans WHERE id = ?").get(id) as DBPricingRow | undefined;
    return NextResponse.json({ success: true, plan: created ? formatPlan(created) : null });
  } catch (err: unknown) {
    console.error("[Pricing POST Error]:", err);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}
