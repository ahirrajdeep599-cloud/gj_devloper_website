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
        .from("products")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (findErr || !existing) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (body.name !== undefined) updates.name = body.name.trim();
      if (body.description !== undefined) updates.description = body.description.trim();
      if (body.price !== undefined) updates.price = Number(body.price) || 0;
      if (body.original_price !== undefined) {
        updates.original_price = body.original_price !== null && body.original_price !== "" ? Number(body.original_price) : null;
      }
      if (body.image_url !== undefined) updates.image_url = body.image_url.trim();
      if (body.in_stock !== undefined) updates.in_stock = Boolean(body.in_stock);
      if (body.stock_quantity !== undefined) updates.stock_quantity = Number(body.stock_quantity) || 0;
      if (body.badge !== undefined) updates.badge = body.badge?.trim() || "";
      if (body.sort_order !== undefined) updates.sort_order = Number(body.sort_order) || 0;
      if (body.features !== undefined) {
        updates.features = Array.isArray(body.features) ? body.features : [];
      }
      if (body.category !== undefined) {
        updates.category_id = await resolveSupabaseCategoryId(body.category);
      }

      const { data: updated, error: updErr } = await sb
        .from("products")
        .update(updates)
        .eq("id", id)
        .select("*, categories(name, slug)")
        .single();

      if (updErr) {
        console.error("[Supabase Product PATCH Error]:", updErr);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        product: formatSupabaseProduct(updated as SupabaseProductRow),
      });
    }

    const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    const allowedFields = [
      "name",
      "category",
      "description",
      "price",
      "original_price",
      "image_url",
      "in_stock",
      "stock_quantity",
      "badge",
      "sort_order",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        if (field === "in_stock") {
          values.push(body[field] ? 1 : 0);
        } else if (["price", "original_price", "stock_quantity", "sort_order"].includes(field)) {
          values.push(body[field] !== null ? Number(body[field]) : null);
        } else {
          values.push(body[field]);
        }
      }
    }

    if (body.features !== undefined) {
      updates.push("features = ?");
      values.push(JSON.stringify(Array.isArray(body.features) ? body.features : []));
    }

    if (updates.length > 0) {
      updates.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);
      db.prepare(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
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
      const { error } = await sb.from("products").delete().eq("id", id);
      if (error) {
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Product deleted successfully" });
    }

    db.prepare("DELETE FROM products WHERE id = ?").run(id);
    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
