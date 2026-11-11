import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    rows.forEach((row) => {
      settings[row.key] = row.value;
    });

    return NextResponse.json({ success: true, settings });
  } catch (err: unknown) {
    console.error("[Settings API GET Error]:", err);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Invalid settings object." }, { status: 400 });
    }

    const updateStmt = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    const updateTransaction = db.transaction((entries: [string, string][]) => {
      for (const [key, value] of entries) {
        updateStmt.run(key, String(value));
      }
    });

    updateTransaction(Object.entries(settings));

    // Return updated settings
    const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
    const updated: Record<string, string> = {};
    rows.forEach((row) => {
      updated[row.key] = row.value;
    });

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully.",
      settings: updated,
    });
  } catch (err: unknown) {
    console.error("[Settings API PATCH Error]:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
