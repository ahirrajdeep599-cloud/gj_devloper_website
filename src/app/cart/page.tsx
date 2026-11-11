"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Package,
} from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, totalItems, subtotal, total } = useCart();

  return (
    <div className="min-h-screen bg-[#02050e] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="ambient-glow-blue top-24 left-[-15%] pointer-events-none" />
        <div className="ambient-glow-violet top-1/2 right-[-15%] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono mb-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Your Selected Web Solutions</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white font-mono">
                SHOPPING CART ({totalItems} {totalItems === 1 ? "Item" : "Items"})
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/store"
                className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
                >
                  Clear Cart
                </button>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 px-6 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-slate-500">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white font-mono mb-2">Your cart is currently empty</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Discover our curated suite of modern website blueprints, contactless restaurant QR menus, and e-commerce solutions.
              </p>
              <Link
                href="/store"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-mono text-xs font-bold hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] transition-all"
              >
                <Package className="w-4 h-4" />
                <span>Browse Products &amp; Solutions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-4">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="p-4 sm:p-6 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-white/20"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0 bg-slate-950"
                      />
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                          {product.category}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-white font-mono line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-sky-400 font-mono mt-1 font-bold">
                          ₹{product.price.toLocaleString("en-IN")} each
                        </p>
                      </div>
                    </div>

                    {/* Quantity controls & item total */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <div className="flex items-center rounded-xl bg-black/40 border border-white/10 p-1">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-300 flex items-center justify-center transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center font-mono text-xs font-bold text-white">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-300 flex items-center justify-center transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <span className="text-[10px] font-mono text-slate-500 block uppercase">
                          Subtotal
                        </span>
                        <span className="text-base font-bold text-white font-mono">
                          ₹{(product.price * quantity).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary Sidebar */}
              <div className="rounded-3xl bg-slate-900/50 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl lg:sticky lg:top-28">
                <h2 className="text-lg font-bold text-white font-mono mb-6 pb-4 border-b border-white/10">
                  ORDER SUMMARY
                </h2>

                <div className="space-y-3 mb-6 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Items:</span>
                    <span className="text-white font-bold">{totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal:</span>
                    <span className="text-white font-bold">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gateway Processing Fee:</span>
                    <span className="text-emerald-400 font-bold">₹0 (Zero Fees)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ordering System:</span>
                    <span className="text-sky-400 font-bold">Direct WhatsApp Dispatch</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 mb-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold text-white font-mono">Total Amount:</span>
                    <span className="text-2xl font-black text-white font-mono text-gradient-electric">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 block mt-1">
                    * Final order confirmation &amp; scope will be reviewed with our team via WhatsApp.
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-slate-950 font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to WhatsApp Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="mt-6 p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    No credit card or online payment gateway required. You will receive an instant itemized WhatsApp summary to confirm details.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
