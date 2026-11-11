"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import {
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, totalItems, subtotal, total, clearCart } = useCart();
  const { whatsappNumber } = useSiteSettings();

  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    deliveryAddress: "",
    city: "",
    pincode: "",
    orderNotes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderPlacedData, setOrderPlacedData] = useState<{
    orderNumber: string;
    whatsappUrl: string;
  } | null>(null);

  // If cart is empty and order hasn't just been placed
  if (items.length === 0 && !orderPlacedData) {
    return (
      <div className="min-h-screen bg-[#02050e] text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 pt-36 pb-24 flex items-center justify-center px-4">
          <div className="text-center py-16 px-8 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl max-w-md w-full">
            <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white font-mono mb-2">Your cart is empty</h2>
            <p className="text-xs text-slate-400 mb-6">
              Please add products to your cart before proceeding to checkout.
            </p>
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 text-slate-950 font-mono text-xs font-bold hover:bg-sky-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Store</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // 1. Client-side Validation
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    const cleanPhone = formData.mobileNumber.replace(/[^\d+]/g, "");
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMessage("Please enter a valid mobile number (minimum 8 digits).");
      return;
    }
    if (!formData.deliveryAddress.trim() || formData.deliveryAddress.trim().length < 5) {
      setErrorMessage("Please enter your complete delivery address.");
      return;
    }
    if (!formData.city.trim() || formData.city.trim().length < 2) {
      setErrorMessage("Please enter your city.");
      return;
    }
    if (!formData.pincode.trim() || formData.pincode.trim().length < 3) {
      setErrorMessage("Please enter a valid postal pincode.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Persist order in SQLite database
      const orderPayload = {
        customer_name: formData.fullName.trim(),
        customer_phone: formData.mobileNumber.trim(),
        delivery_address: formData.deliveryAddress.trim(),
        city: formData.city.trim(),
        pincode: formData.pincode.trim(),
        order_notes: formData.orderNotes.trim(),
        items: items.map(({ product, quantity }) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          subtotal: product.price * quantity,
        })),
        subtotal,
        total_amount: total,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to place order. Please try again.");
      }

      const generatedOrderNumber = data.order_number;

      // 3. Format WhatsApp Message exactly as specified
      // Product items list format
      const itemsListText = items
        .map(
          ({ product, quantity }) =>
            `Product: ${product.name}\nQuantity: ${quantity}\nPrice: ₹${product.price.toLocaleString("en-IN")}\nItem Total: ₹${(product.price * quantity).toLocaleString("en-IN")}`
        )
        .join("\n\n");

      const rawWhatsAppMessage = `Hello! I want to place an order.

Order ID: #${generatedOrderNumber}
Customer Name: ${formData.fullName.trim()}
Phone Number: ${formData.mobileNumber.trim()}

${itemsListText}

Total: ₹${total.toLocaleString("en-IN")}
Delivery Address: ${formData.deliveryAddress.trim()}, ${formData.city.trim()} - ${formData.pincode.trim()}
${formData.orderNotes.trim() ? `Additional Instructions: ${formData.orderNotes.trim()}\n` : ""}
Please confirm my order.`;

      // 4. Construct WhatsApp URL with strict URL-encoding
      const cleanWaNumber = (whatsappNumber || "919876543210").replace(/[^\d]/g, "");
      const encodedMessage = encodeURIComponent(rawWhatsAppMessage);
      const whatsappRedirectUrl = `https://wa.me/${cleanWaNumber}?text=${encodedMessage}`;

      // 5. Open WhatsApp in new tab
      if (typeof window !== "undefined") {
        window.open(whatsappRedirectUrl, "_blank", "noopener,noreferrer");
      }

      // 6. Clear client cart
      clearCart();

      // 7. Save placed state to show order confirmation modal
      setOrderPlacedData({
        orderNumber: generatedOrderNumber,
        whatsappUrl: whatsappRedirectUrl,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while placing your order.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02050e] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="ambient-glow-blue top-24 left-[-15%] pointer-events-none" />
        <div className="ambient-glow-violet top-1/2 right-[-15%] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Order Confirmation Screen (After WhatsApp Dispatch) */}
          {orderPlacedData ? (
            <div className="max-w-2xl mx-auto py-12">
              <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-emerald-500/30 backdrop-blur-2xl text-center shadow-[0_0_50px_rgba(16,185,129,0.15)]">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6 text-emerald-400">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  Order Details Ready
                </span>

                <h1 className="text-2xl sm:text-3xl font-black text-white font-mono mt-4 mb-2">
                  ORDER #{orderPlacedData.orderNumber}
                </h1>

                {/* Explicit Requirement: Exact Confirmation Notice */}
                <div className="my-6 p-5 rounded-2xl bg-black/50 border border-white/10 text-left">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-mono text-sm mb-1">
                        Important Order Notice:
                      </strong>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                        Your order details are ready on WhatsApp. Send the message to complete your order request. Our team will contact you for confirmation and payment details.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                  <a
                    href={orderPlacedData.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open WhatsApp Chat Again</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <Link
                    href="/store"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-all text-center"
                  >
                    Back to Store
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Checkout Form Screen */
            <>
              {/* Header */}
              <div className="mb-10">
                <Link
                  href="/cart"
                  className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Shopping Cart</span>
                </Link>
                <h1 className="text-3xl sm:text-4xl font-black text-white font-mono">
                  WHATSAPP CHECKOUT
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-2">
                  Complete your details below to generate your itemized WhatsApp order message.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Section */}
                <form
                  onSubmit={handleSubmit}
                  className="lg:col-span-7 space-y-5 rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-xl"
                >
                  <div className="border-b border-white/10 pb-4 mb-2">
                    <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                      <span>1. Customer &amp; Delivery Information</span>
                    </h2>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-sm font-sans"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                      Mobile / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-sm font-sans"
                    />
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                      Delivery Address *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                      placeholder="Flat / Office / Street address, Landmark..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-sm font-sans resize-none"
                    />
                  </div>

                  {/* City & Pincode Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Mumbai"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-sm font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        placeholder="e.g. 400001"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-sm font-sans"
                      />
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                      Order Notes / Additional Instructions (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.orderNotes}
                      onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                      placeholder="Any specific delivery instructions, customizations, or preferred contact time..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-sm font-sans resize-none"
                    />
                  </div>

                  {/* Prominent Action Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono text-sm font-black uppercase tracking-wider shadow-[0_0_35px_rgba(16,185,129,0.4)] hover:shadow-[0_0_45px_rgba(16,185,129,0.6)] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>{isSubmitting ? "PREPARING WHATSAPP ORDER..." : "ORDER ON WHATSAPP"}</span>
                    </button>
                    <p className="text-[11px] font-mono text-center text-slate-400 mt-3">
                      * Clicking opens WhatsApp with your prefilled itemized order request.
                    </p>
                  </div>
                </form>

                {/* Order Summary & Notice Sidebar */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Summary Box */}
                  <div className="rounded-3xl bg-slate-900/50 border border-white/10 p-6 sm:p-7 backdrop-blur-2xl">
                    <h2 className="text-base font-bold text-white font-mono mb-4 pb-3 border-b border-white/10 flex items-center justify-between">
                      <span>Order Items ({totalItems})</span>
                      <Link href="/cart" className="text-xs text-sky-400 hover:underline">
                        Edit Cart
                      </Link>
                    </h2>

                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1 mb-4">
                      {items.map(({ product, quantity }) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between text-xs py-1 border-b border-white/5"
                        >
                          <div className="pr-3">
                            <span className="text-white font-medium block line-clamp-1">
                              {product.name}
                            </span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              Qty: {quantity} × ₹{product.price.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <span className="text-white font-mono font-bold shrink-0">
                            ₹{(product.price * quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 text-xs font-mono text-slate-400 pt-3 border-t border-white/10">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="text-white font-bold">₹{subtotal.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400">
                        <span>Gateway Fees:</span>
                        <span>₹0 (Free)</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                        <span className="text-white font-bold">Total Amount:</span>
                        <span className="text-2xl font-black text-white text-gradient-electric">
                          ₹{total.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trust & Safety Card */}
                  <div className="rounded-2xl bg-black/40 border border-white/10 p-5 space-y-3 text-xs text-slate-300">
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-mono text-[11px] mb-0.5">
                          Direct WhatsApp Ordering Only
                        </strong>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          We never ask for credit cards or sensitive bank details on this website. All orders are reviewed directly with our team.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
