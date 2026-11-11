import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import {
  formatSupabaseProduct,
  resolveSupabaseCategoryId,
  SupabaseProductRow,
} from "@/lib/supabaseCatalog";

export const dynamic = "force-dynamic";

interface DBProductRow {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  original_price: number | null;
  image_url: string;
  in_stock: number;
  stock_quantity: number;
  badge: string;
  features: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sb = getSupabaseAdmin();
    if (sb) {
      const { data, error } = await sb
        .from("products")
        .select("*, categories(name, slug)")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return NextResponse.json(
          {
            success: true,
            products: data.map((p) => formatSupabaseProduct(p as SupabaseProductRow)),
          },
          { headers: { "Cache-Control": "no-store, max-age=0" } }
        );
      }
    }

    const products = db
      .prepare("SELECT * FROM products ORDER BY sort_order ASC, id DESC")
      .all() as DBProductRow[];
    const formatted = products.map((p) => ({
      ...p,
      features: typeof p.features === "string" ? JSON.parse(p.features) : p.features || [],
    }));

    return NextResponse.json({ success: true, products: formatted });
  } catch (error) {
    console.error("Admin products fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
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
      category,
      description,
      price,
      original_price,
      image_url,
      in_stock = 1,
      stock_quantity = 10,
      badge = "",
      features = [],
      sort_order = 0,
    } = body;

    if (!name || !price || !image_url) {
      return NextResponse.json(
        { error: "Product name, price, and image URL are required." },
        { status: 400 }
      );
    }

    const slug =
      (body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")) +
      `-${Date.now().toString().slice(-4)}`;

    const sb = getSupabaseAdmin();
    if (sb) {
      const categoryId = await resolveSupabaseCategoryId(category);
      const { data, error } = await sb
        .from("products")
        .insert({
          name: name.trim(),
          slug,
          category_id: categoryId,
          description: description?.trim() || name.trim(),
          price: Number(price) || 0,
          original_price: original_price ? Number(original_price) : null,
          image_url: image_url.trim(),
          in_stock: Boolean(in_stock),
          stock_quantity: Number(stock_quantity) || 0,
          badge: badge?.trim() || "",
          features: Array.isArray(features) ? features : [],
          sort_order: Number(sort_order) || 0,
          is_active: true,
        })
        .select("*, categories(name, slug)")
        .single();

      if (error) {
        console.error("[Supabase Admin Product Create Error]:", error);
        return NextResponse.json({ error: "Failed to create product in Supabase" }, { status: 500 });
      }

      return NextResponse.json(
        { success: true, product: formatSupabaseProduct(data as SupabaseProductRow) },
        { status: 201 }
      );
    }

    const stmt = db.prepare(`
      INSERT INTO products (
        name, slug, category, description, price, original_price, image_url, in_stock, stock_quantity, badge, features, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      slug,
      category?.trim() || "Web Systems",
      description?.trim() || "",
      Number(price) || 0,
      original_price ? Number(original_price) : null,
      image_url.trim(),
      in_stock ? 1 : 0,
      Number(stock_quantity) || 0,
      badge?.trim() || "",
      JSON.stringify(Array.isArray(features) ? features : []),
      Number(sort_order) || 0
    );

    const created = db.prepare("SELECT * FROM products WHERE id = ?").get(result.lastInsertRowid);
    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch (error) {
    console.error("Admin product create error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
