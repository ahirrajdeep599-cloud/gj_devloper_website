import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Load defaults from SQLite first as baseline
    const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    rows.forEach((row) => {
      settings[row.key] = row.value;
    });

    // Overlay persistent settings from Supabase website_settings
    const sb = getSupabaseAdmin();
    if (sb) {
      const { data, error } = await sb
        .from("website_settings")
        .select("key, value")
        .eq("is_public", true);

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          if (row.key && !row.key.startsWith("cms_")) {
            settings[row.key] = row.value;
          }
        }
      }
    }

    return NextResponse.json(
      { success: true, settings },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
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

    // Filter out internal cms_ keys so public settings endpoint never overwrites internal JSON blobs
    const safeEntries = Object.entries(settings).filter(
      ([key]) => typeof key === "string" && !key.startsWith("cms_")
    );

    // 1. Update Supabase persistently
    const sb = getSupabaseAdmin();
    if (sb && safeEntries.length > 0) {
      const now = new Date().toISOString();
      const upsertRows = safeEntries.map(([key, value]) => ({
        key,
        value: String(value ?? ""),
        is_public: true,
        updated_at: now,
      }));

      const { error } = await sb
        .from("website_settings")
        .upsert(upsertRows, { onConflict: "key" });

      if (error) {
        console.error("[Settings Supabase PATCH Error]:", error);
        return NextResponse.json({ error: "Failed to persist settings to Supabase" }, { status: 500 });
      }
    }

    // 2. Also keep local SQLite synced
    const updateStmt = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    const updateTransaction = db.transaction((entries: [string, unknown][]) => {
      for (const [key, value] of entries) {
        updateStmt.run(key, String(value ?? ""));
      }
    });
    updateTransaction(safeEntries);

    // Return latest merged settings
    const updated: Record<string, string> = {};
    const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
    rows.forEach((row) => {
      updated[row.key] = row.value;
    });

    if (sb) {
      const { data } = await sb
        .from("website_settings")
        .select("key, value")
        .eq("is_public", true);
      if (Array.isArray(data)) {
        for (const row of data) {
          if (row.key && !row.key.startsWith("cms_")) {
            updated[row.key] = row.value;
          }
        }
      }
    }

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
