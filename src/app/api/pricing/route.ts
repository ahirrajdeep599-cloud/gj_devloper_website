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

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("all") === "true" && !!admin;

    const query = includeInactive
      ? "SELECT * FROM pricing_plans ORDER BY sort_order ASC, created_at ASC"
      : "SELECT * FROM pricing_plans WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC";

    const rows = db.prepare(query).all() as DBPricingRow[];

    const plans = rows.map((r) => ({
      ...r,
      features: typeof r.features === "string" ? JSON.parse(r.features) : r.features,
      is_popular: Boolean(r.is_popular),
      is_active: Boolean(r.is_active),
    }));

    return NextResponse.json({ success: true, plans });
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
    const featuresJson = Array.isArray(features) ? JSON.stringify(features) : JSON.stringify([]);

    const stmt = db.prepare(`
      INSERT INTO pricing_plans (
        id, name, subtitle, price, price_label, category, badge, description, features, whatsapp_preset, is_popular, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      name.trim(),
      subtitle ? subtitle.trim() : "",
      price.trim(),
      price_label || "Starting price",
      category || "Custom Package",
      badge ? badge.trim() : "",
      description ? description.trim() : "",
      featuresJson,
      whatsapp_preset || `Hi GJ Devloper, I'm interested in the ${name} package (${price}). Can you share more details?`,
      is_popular ? 1 : 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      sort_order || 99
    );

    const created = db.prepare("SELECT * FROM pricing_plans WHERE id = ?").get(id) as DBPricingRow | undefined;
    const formatted = created
      ? {
          ...created,
          features: typeof created.features === "string" ? JSON.parse(created.features) : created.features,
        }
      : null;

    return NextResponse.json({ success: true, plan: formatted });
  } catch (err: unknown) {
    console.error("[Pricing POST Error]:", err);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}
