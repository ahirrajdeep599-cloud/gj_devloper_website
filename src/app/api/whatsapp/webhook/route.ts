import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Meta WhatsApp Cloud API Webhook Verification (GET)
 * Meta checks hub.mode, hub.verify_token, and hub.challenge
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "gj_devloper_verify_token_2026";

  if (mode === "subscribe" && token === expectedToken) {
    console.log("[Security Audit] WhatsApp webhook verified successfully by Meta.");
    return new Response(challenge, { status: 200 });
  }

  console.warn("[Security Audit] Invalid WhatsApp webhook verification attempt.");
  return new Response("Forbidden", { status: 403 });
}

/**
 * Meta WhatsApp Cloud API Incoming Messages Handler (POST)
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // 1. Webhook Signature Verification (if WHATSAPP_APP_SECRET is configured)
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    if (appSecret) {
      const signature = req.headers.get("x-hub-signature-256");
      if (!signature) {
        console.warn("[Security Audit] Missing x-hub-signature-256 header on WhatsApp webhook.");
        return NextResponse.json({ error: "Missing signature" }, { status: 401 });
      }

      const expectedSignature = `sha256=${crypto
        .createHmac("sha256", appSecret)
        .update(rawBody)
        .digest("hex")}`;

      const sigBuffer = Buffer.from(signature);
      const expectedBuffer = Buffer.from(expectedSignature);

      if (
        sigBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
      ) {
        console.warn("[Security Audit] Invalid webhook HMAC signature mismatch.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);

    // 2. Parse Incoming Payload
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (messages && messages.length > 0) {
      const message = messages[0];
      const from = String(message.from || "").replace(/[^0-9]/g, "");
      const text = String(message.text?.body || "[Non-text message or media]").slice(0, 2000);
      const contactName = String(value?.contacts?.[0]?.profile?.name || "WhatsApp User").slice(0, 100);

      console.log(`[WhatsApp Incoming Lead: ${contactName} (${from})]: ${text}`);

      // Check if lead exists by last 8 digits of phone number
      interface InquiryRow {
        id: number;
        notes: string;
      }

      const existing = db
        .prepare("SELECT * FROM inquiries WHERE whatsapp_number LIKE ?")
        .get(`%${from.slice(-8)}%`) as InquiryRow | undefined;

      if (existing) {
        const updatedNotes = existing.notes
          ? `${existing.notes}\n[${new Date().toISOString()}] Reply: ${text}`
          : `[${new Date().toISOString()}] Reply: ${text}`;

        db.prepare(
          "UPDATE inquiries SET notes = ?, status = 'Contacted', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        ).run(updatedNotes, existing.id);
      } else {
        db.prepare(`
          INSERT INTO inquiries (
            customer_name, 
            whatsapp_number, 
            website_type, 
            budget, 
            project_description, 
            status, 
            source
          ) VALUES (?, ?, 'WhatsApp Direct Inbound', 'TBD', ?, 'New', 'WhatsApp Webhook')
        `).run(contactName, from, text);
      }
    }

    return NextResponse.json({ status: "EVENT_RECEIVED" });
  } catch (err: unknown) {
    console.error("[WhatsApp Webhook Processing Exception]:", err);
    return NextResponse.json({ status: "ERROR_LOGGED" }, { status: 200 });
  }
}
