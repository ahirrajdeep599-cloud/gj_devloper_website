import { NextResponse } from "next/server";
import db from "@/lib/db";

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
  try {
    const products = db
      .prepare("SELECT * FROM products ORDER BY sort_order ASC, id ASC")
      .all() as DBProductRow[];

    const formatted = products.map((p) => ({
      ...p,
      features: typeof p.features === "string" ? JSON.parse(p.features) : p.features || [],
    }));

    return NextResponse.json({ success: true, products: formatted });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
