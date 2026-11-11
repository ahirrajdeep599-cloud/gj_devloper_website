"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import {
  ShoppingBag,
  Check,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  MessageSquare,
  Package,
} from "lucide-react";
import Link from "next/link";

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [addedIds, setAddedIds] = useState<{ [key: number]: boolean }>({});

  const { addToCart, totalItems } = useCart();
  const { getWhatsAppUrl } = useSiteSettings();

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))).filter(Boolean),
  ];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const handleQuickWhatsAppBuy = (product: Product) => {
    const message = `Hello! I want to order "${product.name}" (Price: ₹${product.price.toLocaleString("en-IN")}) directly from your website store.\n\nPlease share order confirmation and next steps.`;
    const url = getWhatsAppUrl(message);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[#02050e] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="ambient-glow-blue top-24 left-[-15%] pointer-events-none" />
        <div className="ambient-glow-violet top-1/2 right-[-15%] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>100% WhatsApp Direct Ordering • Zero Payment Gateway Hassle</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-mono mb-4">
              DIGITAL SOLUTIONS &amp;{" "}
              <span className="text-gradient-electric">WEB SYSTEMS STORE</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Explore high-performance digital blueprints, contactless restaurant QR portals, and custom web systems.
              Order instantly through WhatsApp with zero intermediary fees.
            </p>

            {/* Quick Cart Pill Link */}
            {totalItems > 0 && (
              <div className="mt-6 flex justify-center">
                <Link
                  href="/cart"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-mono text-xs font-bold hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>View Cart ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-sky-500 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.4)] font-bold"
                    : "bg-slate-900/60 text-slate-400 border border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 animate-pulse h-96"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/10 max-w-md mx-auto">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white font-mono mb-1">No products found</h3>
              <p className="text-xs text-slate-400">Try selecting another category or check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.in_stock === 0 || product.stock_quantity <= 0;
                const isJustAdded = addedIds[product.id];

                return (
                  <div
                    key={product.id}
                    className="group rounded-3xl bg-slate-900/40 border border-white/10 hover:border-sky-500/40 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between overflow-hidden hover:shadow-[0_0_35px_rgba(56,189,248,0.15)]"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="relative h-52 w-full overflow-hidden bg-slate-950">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#091024] via-transparent to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-slate-950/80 backdrop-blur-md border border-white/10 text-slate-300">
                            {product.category}
                          </span>
                          {product.badge && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 uppercase tracking-wider shadow">
                              {product.badge}
                            </span>
                          )}
                        </div>

                        {/* Stock status indicator */}
                        <div className="absolute bottom-3 left-3">
                          {isOutOfStock ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/80 text-white font-bold">
                              Out of Stock
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/90 text-slate-950 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                              In Stock
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-white font-mono mb-2 line-clamp-1 group-hover:text-sky-300 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                          {product.description}
                        </p>

                        {/* Features bullet list */}
                        {product.features && product.features.length > 0 && (
                          <div className="space-y-1.5 mb-6 pt-3 border-t border-white/[0.06]">
                            {product.features.slice(0, 3).map((feat, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-[11px] text-slate-300"
                              >
                                <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                <span className="line-clamp-1">{feat}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="p-6 pt-0 border-t border-white/[0.06] bg-slate-950/30">
                      <div className="flex items-baseline justify-between mb-4 pt-4">
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 block uppercase">
                            Price
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-white font-mono text-gradient-electric">
                              ₹{product.price.toLocaleString("en-IN")}
                            </span>
                            {product.original_price && product.original_price > product.price && (
                              <span className="text-xs text-slate-500 line-through font-mono">
                                ₹{product.original_price.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                        {product.original_price && product.original_price > product.price && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Save ₹{(product.original_price - product.price).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Add to Cart button */}
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={isOutOfStock}
                          className={`w-full py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isOutOfStock
                              ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                              : isJustAdded
                              ? "bg-emerald-500 text-slate-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                              : "bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/20"
                          }`}
                        >
                          {isJustAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>

                        {/* Instant WhatsApp Buy */}
                        <button
                          onClick={() => handleQuickWhatsAppBuy(product)}
                          className="w-full py-2.5 px-3 rounded-xl font-mono text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 transition-all flex items-center justify-center gap-1.5"
                          title="Instant order inquiry via WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Buy via WA</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Trust Footnote */}
          <div className="mt-20 p-8 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-mono font-bold text-white mb-1">Direct WhatsApp Confirmation</h4>
                <p className="text-[11px] text-slate-400">Zero middleman gateways, zero hidden processing fees.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-mono font-bold text-white mb-1">Instant Developer Response</h4>
                <p className="text-[11px] text-slate-400">Direct technical verification and personalized project scope setup.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-violet-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-mono font-bold text-white mb-1">100% Quality Guarantee</h4>
                <p className="text-[11px] text-slate-400">Clean code, sub-second loading, and post-delivery assistance.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
