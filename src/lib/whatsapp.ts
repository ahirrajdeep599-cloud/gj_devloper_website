export interface WhatsAppInquiryPayload {
  customerName: string;
  whatsappNumber: string;
  websiteType: string;
  budget: string;
  projectDescription: string;
  serviceName?: string;
  source?: string;
}

// Default brand WhatsApp number for GJ Devloper (configurable in .env)
export const GJ_WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "919876543210";

/**
 * Format a human-readable, professional WhatsApp inquiry message
 */
export function formatWhatsAppInquiryMessage(data: WhatsAppInquiryPayload): string {
  const serviceLine = data.serviceName
    ? `🎯 *Requested Service:* ${data.serviceName}\n`
    : `🌐 *Website Type:* ${data.websiteType}\n`;

  return `🚀 *NEW PROJECT INQUIRY — GJ DEVLOPER*
────────────────────────
👤 *Client Name:* ${data.customerName}
📱 *WhatsApp Number:* ${data.whatsappNumber}
${serviceLine}💰 *Estimated Budget:* ${data.budget}
────────────────────────
📝 *Project Scope & Goals:*
"${data.projectDescription}"
────────────────────────
⚡ *Brand:* GJ Devloper (Web Development Agency)
🌐 *Sent via:* ${data.source || "Official Website Portal"}`;
}

/**
 * Generate standard wa.me direct link
 */
export function getWhatsAppDirectUrl(
  message: string,
  recipientNumber: string = GJ_WHATSAPP_PHONE
): string {
  // Strip non-numeric characters for WhatsApp international format
  const cleanNumber = recipientNumber.replace(/[^0-9]/g, "");
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

/**
 * Server-side Meta WhatsApp Cloud API integration
 */
export async function sendMetaCloudApiMessage({
  to,
  text,
}: {
  to: string;
  text: string;
}): Promise<{ success: boolean; data?: unknown; error?: string; isFallback?: boolean }> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // If credentials are not configured in environment, safely return fallback indicator
  if (!accessToken || !phoneNumberId) {
    return {
      success: false,
      isFallback: true,
      error:
        "Meta WhatsApp Cloud API credentials not configured in environment. Using wa.me click-to-chat fallback.",
    };
  }

  // Normalize phone number (strip spaces, symbols, plus sign)
  const cleanTo = to.replace(/[^0-9]/g, "");

  try {
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanTo,
        type: "text",
        text: { preview_url: true, body: text },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[WhatsApp Cloud API Error]:", result);
      return {
        success: false,
        error: result.error?.message || "Failed to deliver WhatsApp message via Meta Cloud API",
      };
    }

    return { success: true, data: result };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Network exception communicating with Meta WhatsApp Cloud API";
    console.error("[WhatsApp Cloud API Network Exception]:", err);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
