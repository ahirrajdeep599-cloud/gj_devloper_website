import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

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
    db.prepare("DELETE FROM products WHERE id = ?").run(id);
    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
