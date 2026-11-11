import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { sendMetaCloudApiMessage, formatWhatsAppInquiryMessage } from "@/lib/whatsapp";
import { getCurrentAdmin } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  getSupabaseInquiries,
  saveSupabaseInquiries,
  StoredInquiryItem,
} from "@/lib/supabaseCatalog";

export const dynamic = "force-dynamic";

// Sanitize helper to strip HTML tags to prevent stored XSS
function sanitizeText(input: string): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting for public submissions
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const rateLimit = checkRateLimit({
      key: `inquiry_submit_${ip}`,
      maxAttempts: 10,
      windowMs: 10 * 60 * 1000, // 10 minutes
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many submissions from this connection. Please wait ${rateLimit.retryAfterSec} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { customerName, whatsappNumber, websiteType, budget, projectDescription, honeypot } = body;

    // 2. Honeypot check: If the hidden honeypot field is filled, silently discard bot submission
    if (honeypot) {
      return NextResponse.json({ success: true, message: "Inquiry processed." });
    }

    // 3. Validation
    if (!customerName || !whatsappNumber || !projectDescription) {
      return NextResponse.json(
        { error: "Customer name, WhatsApp number, and project description are required." },
        { status: 400 }
      );
    }

    // 4. Length Limits & Sanitization (preventing payload bloat / stored XSS)
    const cleanName = sanitizeText(customerName).slice(0, 100);
    const cleanPhone = sanitizeText(whatsappNumber).slice(0, 30);
    const cleanType = sanitizeText(websiteType || "General Web Development").slice(0, 100);
    const cleanBudget = sanitizeText(budget || "Not Specified").slice(0, 60);
    const cleanDesc = sanitizeText(projectDescription).slice(0, 2000);

    if (cleanName.length < 2 || cleanPhone.length < 5 || cleanDesc.length < 5) {
      return NextResponse.json(
        { error: "Please provide valid inquiry details." },
        { status: 400 }
      );
    }

    let inquiryId: number | bigint = Date.now();
    let whatsappStatus = "Pending";

    // Optional: Alert notification to agency admin WhatsApp phone
    const adminPhone = process.env.ADMIN_WHATSAPP_PHONE;
    if (adminPhone) {
      const alertText = formatWhatsAppInquiryMessage({
        customerName: cleanName,
        whatsappNumber: cleanPhone,
        websiteType: cleanType,
        budget: cleanBudget,
        projectDescription: cleanDesc,
        source: "Inquiry API",
      });

      const apiResult = await sendMetaCloudApiMessage({
        to: adminPhone,
        text: alertText,
      });

      if (apiResult.success) {
        whatsappStatus = "Sent";
      }
    }

    const sbInquiries = await getSupabaseInquiries();
    if (sbInquiries) {
      const nextId =
        sbInquiries.length > 0 ? Math.max(...sbInquiries.map((i) => Number(i.id) || 0)) + 1 : 1;
      inquiryId = nextId;
      const newInquiry: StoredInquiryItem = {
        id: nextId,
        customer_name: cleanName,
        whatsapp_number: cleanPhone,
        website_type: cleanType,
        budget: cleanBudget,
        project_description: cleanDesc,
        status: "New",
        whatsapp_sent_status: whatsappStatus,
        source: "Web Inquiry",
        created_at: new Date().toISOString(),
      };
      await saveSupabaseInquiries([newInquiry, ...sbInquiries]);
    } else {
      const stmt = db.prepare(`
        INSERT INTO inquiries (
          customer_name, whatsapp_number, website_type, budget, project_description, status, whatsapp_sent_status, source
        ) VALUES (?, ?, ?, ?, ?, 'New', ?, 'Web Inquiry')
      `);
      const result = stmt.run(cleanName, cleanPhone, cleanType, cleanBudget, cleanDesc, whatsappStatus);
      inquiryId = result.lastInsertRowid;
    }

    return NextResponse.json({
      success: true,
      inquiryId,
      message: "Inquiry received and securely logged.",
    });
  } catch (err: unknown) {
    console.error("[Inquiries API Error]:", err);
    return NextResponse.json(
      { error: "Server error processing inquiry." },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Only accessible to authenticated admin
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
  }

  try {
    const sbInquiries = await getSupabaseInquiries();
    if (sbInquiries) {
      return NextResponse.json(
        { success: true, inquiries: sbInquiries },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const inquiries = db.prepare("SELECT * FROM inquiries ORDER BY created_at DESC").all();
    return NextResponse.json({ success: true, inquiries });
  } catch {
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}
