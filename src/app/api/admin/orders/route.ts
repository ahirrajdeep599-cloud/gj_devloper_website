import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

interface DBOrderRow {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  pincode: string;
  order_notes: string;
  items: string;
  subtotal: number;
  total_amount: number;
  status: string;
  whatsapp_sent_status: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

interface SupabaseOrderItemRow {
  id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

interface SupabaseOrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  pincode: string;
  order_notes: string | null;
  subtotal: number;
  total_amount: number;
  status: string;
  whatsapp_sent_status: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: SupabaseOrderItemRow[];
}

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const sb = getSupabaseAdmin();
    if (sb) {
      let query = sb
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (status && status !== "All") {
        query = query.eq("status", status);
      }

      if (search) {
        const safeSearch = search.replace(/[%_,]/g, "");
        query = query.or(
          `order_number.ilike.%${safeSearch}%,customer_name.ilike.%${safeSearch}%,customer_phone.ilike.%${safeSearch}%`
        );
      }

      const { data: ordersData, error } = await query;
      if (error) {
        console.error("[Supabase Admin Orders Error]:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
      }

      const { data: allOrdersMeta } = await sb.from("orders").select("status, total_amount");
      const allList = allOrdersMeta || [];

      const formatted = ((ordersData || []) as SupabaseOrderRow[]).map((o) => ({
        id: o.id,
        order_number: o.order_number,
        customer_name: o.customer_name,
        customer_phone: o.customer_phone,
        delivery_address: o.delivery_address,
        city: o.city,
        pincode: o.pincode,
        order_notes: o.order_notes || "",
        subtotal: Number(o.subtotal) || 0,
        total_amount: Number(o.total_amount) || 0,
        status: o.status,
        whatsapp_sent_status: o.whatsapp_sent_status || "Sent",
        admin_notes: o.admin_notes || "",
        created_at: o.created_at,
        updated_at: o.updated_at,
        items: (o.order_items || []).map((item) => ({
          id: item.product_id || item.id,
          name: item.product_name,
          price: Number(item.unit_price) || 0,
          quantity: Number(item.quantity) || 1,
          subtotal: Number(item.subtotal) || 0,
        })),
      }));

      const totalOrders = allList.length;
      const newOrders = allList.filter((o) => o.status === "New").length;
      const confirmedOrders = allList.filter((o) => o.status === "Confirmed").length;
      const processingOrders = allList.filter((o) => o.status === "Processing").length;
      const deliveredOrders = allList.filter((o) => o.status === "Delivered").length;
      const totalRevenue = allList
        .filter((o) => ["Confirmed", "Processing", "Shipped", "Delivered"].includes(o.status))
        .reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);

      return NextResponse.json(
        {
          success: true,
          orders: formatted,
          metrics: {
            totalOrders,
            newOrders,
            confirmedOrders,
            processingOrders,
            deliveredOrders,
            totalRevenue,
          },
        },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    let query = "SELECT * FROM orders";
    const conditions: string[] = [];
    const params: string[] = [];

    if (status && status !== "All") {
      conditions.push("status = ?");
      params.push(status);
    }

    if (search) {
      conditions.push("(order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY id DESC";

    const orders = db.prepare(query).all(...params) as DBOrderRow[];
    const formatted = orders.map((o) => ({
      ...o,
      items: typeof o.items === "string" ? JSON.parse(o.items) : o.items || [],
    }));

    const totalOrders = (db.prepare("SELECT COUNT(*) as count FROM orders").get() as { count: number } | undefined)?.count || 0;
    const newOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'New'").get() as { count: number } | undefined)?.count || 0;
    const confirmedOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Confirmed'").get() as { count: number } | undefined)?.count || 0;
    const processingOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Processing'").get() as { count: number } | undefined)?.count || 0;
    const deliveredOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Delivered'").get() as { count: number } | undefined)?.count || 0;
    const totalRevenue =
      (
        db
          .prepare("SELECT SUM(total_amount) as total FROM orders WHERE status IN ('Confirmed', 'Processing', 'Shipped', 'Delivered')")
          .get() as { total: number | null } | undefined
      )?.total || 0;

    return NextResponse.json({
      success: true,
      orders: formatted,
      metrics: {
        totalOrders,
        newOrders,
        confirmedOrders,
        processingOrders,
        deliveredOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Admin orders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
