import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

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

interface CountResult {
  count: number;
}

interface SumResult {
  total: number | null;
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

    // Calculate metrics
    const totalOrders = (db.prepare("SELECT COUNT(*) as count FROM orders").get() as CountResult | undefined)?.count || 0;
    const newOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'New'").get() as CountResult | undefined)?.count || 0;
    const confirmedOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Confirmed'").get() as CountResult | undefined)?.count || 0;
    const processingOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Processing'").get() as CountResult | undefined)?.count || 0;
    const deliveredOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Delivered'").get() as CountResult | undefined)?.count || 0;
    const totalRevenue = (db.prepare("SELECT SUM(total_amount) as total FROM orders WHERE status IN ('Confirmed', 'Processing', 'Shipped', 'Delivered')").get() as SumResult | undefined)?.total || 0;

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
