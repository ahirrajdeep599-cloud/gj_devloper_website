import { NextRequest, NextResponse } from "next/server";
import { sendMetaCloudApiMessage, getWhatsAppDirectUrl } from "@/lib/whatsapp";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Protect route
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { to, text } = await req.json();

    if (!to || !text) {
      return NextResponse.json(
        { error: "Recipient phone number ('to') and message text are required." },
        { status: 400 }
      );
    }

    const result = await sendMetaCloudApiMessage({ to, text });

    if (result.isFallback) {
      // Return working wa.me link as fallback
      const waUrl = getWhatsAppDirectUrl(text, to);
      return NextResponse.json({
        success: false,
        fallbackRequired: true,
        fallbackUrl: waUrl,
        message: result.error,
      });
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Message dispatched via Meta WhatsApp Cloud API.",
    });
  } catch (err: unknown) {
    console.error("[WhatsApp Send API Error]:", err);
    return NextResponse.json(
      { error: "Failed to dispatch message." },
      { status: 500 }
    );
  }
}
