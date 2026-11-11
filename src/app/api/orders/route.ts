import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

interface SubmittedOrderItem {
  id?: string | number;
  product_id?: string | number;
  name?: string;
  price?: number;
  quantity?: number;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  // Rate limit public order submissions by client IP (max 10 orders per 15 minutes per IP)
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rateCheck = checkRateLimit({
    key: `order:${clientIp}`,
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many order requests. Please try again shortly or contact us directly on WhatsApp." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const {
      customer_name,
      customer_phone,
      delivery_address,
      city,
      pincode,
      order_notes,
      items,
    } = body;

    if (!customer_name || typeof customer_name !== "string" || customer_name.trim().length < 2) {
      return NextResponse.json({ error: "Please enter your full name (at least 2 characters)." }, { status: 400 });
    }
    if (!customer_phone || typeof customer_phone !== "string" || customer_phone.trim().length < 7) {
      return NextResponse.json({ error: "Please enter a valid phone or WhatsApp number." }, { status: 400 });
    }
    if (!delivery_address || typeof delivery_address !== "string" || delivery_address.trim().length < 5) {
      return NextResponse.json({ error: "Please enter a valid delivery address (at least 5 characters)." }, { status: 400 });
    }
    if (!city || typeof city !== "string" || city.trim().length < 2) {
      return NextResponse.json({ error: "Please enter your city." }, { status: 400 });
    }
    if (!pincode || typeof pincode !== "string" || pincode.trim().length < 3) {
      return NextResponse.json({ error: "Please enter a valid postal pincode." }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty. Please add at least one product." }, { status: 400 });
    }

    const sb = getSupabaseAdmin();
    if (sb) {
      const resolvedItems: { product_id: string; quantity: number }[] = [];

      for (const rawItem of items as SubmittedOrderItem[]) {
        const rawId = String(rawItem.product_id ?? rawItem.id ?? "").trim();
        const quantity = Math.max(1, Math.floor(Number(rawItem.quantity) || 1));

        if (UUID_REGEX.test(rawId)) {
          resolvedItems.push({ product_id: rawId, quantity });
        } else if (rawItem.name) {
          // Graceful fallback if client cart had a legacy numeric ID: look up by name
          const { data: prod } = await sb
            .from("products")
            .select("id")
            .ilike("name", rawItem.name.trim())
            .limit(1)
            .maybeSingle();

          if (prod?.id) {
            resolvedItems.push({ product_id: prod.id, quantity });
          }
        }
      }

      if (resolvedItems.length === 0) {
        return NextResponse.json(
          { error: "Unable to verify selected products. Please refresh the store page and re-add items." },
          { status: 400 }
        );
      }

      const { data: rpcResult, error: rpcError } = await sb.rpc("place_order_secure", {
        p_customer_name: customer_name.trim().slice(0, 100),
        p_customer_phone: customer_phone.trim().slice(0, 30),
        p_delivery_address: delivery_address.trim().slice(0, 300),
        p_city: city.trim().slice(0, 100),
        p_pincode: pincode.trim().slice(0, 20),
        p_order_notes: (order_notes || "").trim().slice(0, 500) || null,
        p_items: resolvedItems,
      });

      if (rpcError) {
        console.error("[Supabase place_order_secure Error]:", rpcError);
        return NextResponse.json(
          { error: rpcError.message || "Order validation failed." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        order_id: rpcResult?.order_id,
        order_number: rpcResult?.order_number,
        total_amount: rpcResult?.total_amount,
        message: "Order placed successfully for WhatsApp dispatch.",
      });
    }

    // Fallback to SQLite when Supabase is not configured
    const sanitizedItems = (items as SubmittedOrderItem[]).map((item) => {
      const price = Number(item.price) || 0;
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      return {
        id: item.id || 0,
        name: String(item.name || "Product").trim().slice(0, 150),
        price,
        quantity,
        subtotal: price * quantity,
      };
    });

    const calculatedSubtotal = sanitizedItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    const calculatedTotal = calculatedSubtotal;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `GJ-ORD-${Date.now().toString().slice(-4)}${randomSuffix}`;

    const insertStmt = db.prepare(`
      INSERT INTO orders (
        order_number, customer_name, customer_phone, delivery_address, city, pincode,
        order_notes, items, subtotal, total_amount, status, whatsapp_sent_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', 'Sent')
    `);

    const result = insertStmt.run(
      orderNumber,
      customer_name.trim().slice(0, 100),
      customer_phone.trim().slice(0, 30),
      delivery_address.trim().slice(0, 300),
      city.trim().slice(0, 100),
      pincode.trim().slice(0, 20),
      (order_notes || "").trim().slice(0, 500),
      JSON.stringify(sanitizedItems),
      calculatedSubtotal,
      calculatedTotal
    );

    return NextResponse.json({
      success: true,
      order_id: result.lastInsertRowid,
      order_number: orderNumber,
      total_amount: calculatedTotal,
      message: "Order placed successfully for WhatsApp dispatch.",
    });
  } catch (error) {
    console.error("Order intake error:", error);
    return NextResponse.json({ error: "Failed to process order. Please try again." }, { status: 500 });
  }
}
