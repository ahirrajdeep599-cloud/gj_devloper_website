import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { formatSupabaseProduct, SupabaseProductRow } from "@/lib/supabaseCatalog";

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
    const sb = getSupabaseAdmin();
    if (sb) {
      const { data, error } = await sb
        .from("products")
        .select("*, categories(name, slug)")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

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
      .prepare("SELECT * FROM products ORDER BY sort_order ASC, id ASC")
      .all() as DBProductRow[];

    const formatted = products.map((p) => ({
      ...p,
      features: typeof p.features === "string" ? JSON.parse(p.features) : p.features || [],
    }));

    return NextResponse.json(
      { success: true, products: formatted },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
