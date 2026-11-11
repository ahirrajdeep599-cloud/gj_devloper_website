import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

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
    const products = db.prepare("SELECT * FROM products ORDER BY sort_order ASC, id DESC").all() as DBProductRow[];
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
      return NextResponse.json({ error: "Product name, price, and image URL are required." }, { status: 400 });
    }

    const slug = (body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")) + `-${Date.now().toString().slice(-4)}`;

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
