import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import {
  getSupabaseServices,
  saveSupabaseServices,
  StoredServiceItem,
} from "@/lib/supabaseCatalog";

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

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("all") === "true" && !!admin;

    const sbServices = await getSupabaseServices();
    if (sbServices) {
      const sorted = [...sbServices].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      const filtered = includeInactive ? sorted : sorted.filter((s) => s.is_active !== false);
      return NextResponse.json(
        { success: true, services: filtered },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const query = includeInactive
      ? "SELECT * FROM services ORDER BY sort_order ASC, number ASC"
      : "SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC, number ASC";

    const rows = db.prepare(query).all() as DBServiceRow[];
    const services = rows.map((r) => ({
      ...r,
      deliverables: typeof r.deliverables === "string" ? JSON.parse(r.deliverables) : r.deliverables,
      is_active: Boolean(r.is_active),
    }));

    return NextResponse.json(
      { success: true, services },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    console.error("[Services GET Error]:", err);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
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
      title,
      number,
      category,
      short_description,
      deliverables,
      starting_price,
      icon_type,
      badge,
      whatsapp_preset,
      gradient,
      sort_order,
    } = body;

    if (!title || !short_description) {
      return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
    }

    const id = body.id || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const delivArray = Array.isArray(deliverables) ? deliverables : [];

    const sbServices = await getSupabaseServices();
    if (sbServices) {
      const count = sbServices.length;
      const num = number || String(count + 1).padStart(2, "0");
      const created: StoredServiceItem = {
        id,
        number: num,
        title: title.trim(),
        category: category || "Websites",
        short_description: short_description.trim(),
        deliverables: delivArray,
        starting_price: starting_price || "Quote on Request",
        icon_type: icon_type || "Briefcase",
        badge: badge || "Popular",
        whatsapp_preset:
          whatsapp_preset || `Hi GJ Devloper, I'm interested in ${title}. Please share a quote.`,
        gradient: gradient || "from-blue-600 via-indigo-600 to-sky-500",
        is_active: true,
        sort_order: Number(sort_order) || count + 1,
      };
      await saveSupabaseServices([...sbServices, created]);
      return NextResponse.json({ success: true, service: created });
    }

    const countRow = db.prepare("SELECT COUNT(*) as count FROM services").get() as { count: number };
    const count = countRow.count || 0;
    const num = number || String(count + 1).padStart(2, "0");

    db.prepare(`
      INSERT INTO services (
        id, number, title, category, short_description, deliverables, starting_price,
        icon_type, badge, whatsapp_preset, gradient, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      id,
      num,
      title.trim(),
      category || "Websites",
      short_description.trim(),
      JSON.stringify(delivArray),
      starting_price || "Quote on Request",
      icon_type || "Briefcase",
      badge || "Popular",
      whatsapp_preset || `Hi GJ Devloper, I'm interested in ${title}. Please share a quote.`,
      gradient || "from-blue-600 via-indigo-600 to-sky-500",
      sort_order || count + 1
    );

    const created = db.prepare("SELECT * FROM services WHERE id = ?").get(id) as DBServiceRow | undefined;
    const formatted = created
      ? { ...created, deliverables: JSON.parse(created.deliverables) }
      : null;

    return NextResponse.json({ success: true, service: formatted });
  } catch (err: unknown) {
    console.error("[Services POST Error]:", err);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
