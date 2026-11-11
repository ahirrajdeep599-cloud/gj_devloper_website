"use client";

import React from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { Check, MessageSquare, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function PricingSection() {
  const { pricingPlans, getWhatsAppUrl } = useSiteSettings();
  const defaultPlans = [
    {
      id: "basic",
      name: "BASIC",
      subtitle: "For personal and small business websites",
      price: "₹1,999",
      priceLabel: "Starting price",
      featured: false,
      badge: "Starter Suite",
      description: "Clean, responsive, and fast digital presence designed to establish your brand online with immediate credibility.",
      features: [
        "Modern Mobile-Responsive Layout",
        "Up to 3 - 5 Content Pages / Views",
        "Contact Form & WhatsApp Quick Button",
        "Fast Page Loading Speed",
        "Basic SEO Meta Tags & Google Indexing",
        "Social Media & Map Links Integration",
        "14 Days Post-Launch Support",
      ],
      whatsappMessage:
        "Hi GJ Devloper, I'm interested in the BASIC Plan (Starting at ₹1,999) for my personal/small business website. Can you share more details?",
    },
    {
      id: "professional",
      name: "PROFESSIONAL",
      subtitle: "For growing businesses & ambitious brands",
      price: "₹4,999",
      priceLabel: "Starting price",
      featured: true,
      badge: "Most Popular",
      description: "High-impact web presence engineered to drive conversions, showcase offerings, and outpace direct market competitors.",
      features: [
        "Everything in Basic, plus:",
        "Custom UI/UX Theme & Dark Mode Aesthetic",
        "Up to 8 - 12 Interactive Pages / Sections",
        "Dynamic Product / Service Catalog or QR Menu",
        "Table Booking or Service Quote Calculators",
        "Advanced Core Web Vitals & Technical SEO",
        "Google Analytics 4 & Conversion Tracking",
        "30 Days Post-Launch Warranty & Support",
      ],
      whatsappMessage:
        "Hi GJ Devloper, I'm interested in the PROFESSIONAL Plan (Starting at ₹4,999) for my growing business. Let's discuss requirements!",
    },
    {
      id: "premium",
      name: "PREMIUM",
      subtitle: "For advanced business websites & custom solutions",
      price: "₹9,999",
      priceLabel: "Starting price",
      featured: false,
      badge: "Enterprise Grade",
      description: "Bespoke full-stack web applications, 3D WebGL experiences, or complex digital management systems built to dominate your industry.",
      features: [
        "Everything in Professional, plus:",
        "Custom Web App or Headless E-Commerce System",
        "Interactive 3D / WebGL Animated Elements",
        "Secure User Authentication & Database Storage",
        "WhatsApp Direct Ordering & Instant Checkout Engine",
        "Automated WhatsApp / Email Notification Alerts",
        "Full Source Code & GitHub Handover",
        "Priority 60 Days Hypercare Support",
      ],
      whatsappMessage:
        "Hi GJ Devloper, I'm interested in the PREMIUM Plan (Starting at ₹9,999) for an advanced web application / custom solution. Let's schedule a call!",
    },
  ];

  const displayPlans = pricingPlans && pricingPlans.length > 0
    ? pricingPlans.map((p) => ({
        id: p.id,
        name: p.name,
        subtitle: p.subtitle || "",
        price: p.price,
        priceLabel: p.price_label || "Starting price",
        featured: Boolean(p.is_popular),
        badge: p.badge || (p.is_popular ? "Most Popular" : "Package"),
        description: p.description || "",
        features: Array.isArray(p.features) ? p.features : [],
        whatsappMessage:
          p.whatsapp_preset ||
          `Hi GJ Devloper, I'm interested in the ${p.name} plan (${p.price}). Please share more details!`,
      }))
    : defaultPlans;

  return (
    <section id="pricing" className="relative py-28 overflow-hidden bg-[#02050f]/60 border-t border-white/[0.06]">
      {/* Ambient background glows */}
      <div className="ambient-glow-blue top-1/3 left-[-10%]" />
      <div className="ambient-glow-violet bottom-1/4 right-[-10%]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badge="Transparent Engineering Rates"
          badgeVariant="electric"
          title="Predictable Pricing."
          highlightedText="Zero Hidden Fees."
          subtitle="Clear starting rates designed for ambitious projects. Every build is accompanied by strict quality standards and dedicated developer care."
        />

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-14">
          {displayPlans.map((plan) => {
            const whatsappUrl = getWhatsAppUrl(plan.whatsappMessage);

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 ${
                  plan.featured
                    ? "bg-gradient-to-b from-[#09153a] via-[#070e28] to-[#04081b] border-2 border-sky-400/50 shadow-[0_0_50px_rgba(56,189,248,0.25)] lg:-translate-y-3 z-10"
                    : "bg-slate-900/40 border border-white/10 hover:border-white/20 hover:bg-slate-900/60"
                }`}
              >
                {/* Popular Pill Tag on Featured Plan */}
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-gradient-to-r from-sky-400 to-purple-500 text-slate-950 font-mono text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{plan.badge}</span>
                    </span>
                  </div>
                )}

                <div>
                  {/* Top Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-white font-mono tracking-wider">
                      {plan.name}
                    </h3>
                    {!plan.featured && (
                      <span className="text-[11px] font-mono text-slate-400 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-6">
                    {plan.subtitle}
                  </p>

                  {/* Price Typography */}
                  <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/5">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">
                      {plan.priceLabel}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-white font-mono text-gradient-electric tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        / baseline
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-6">
                    {plan.description}
                  </p>

                  {/* Features Checklist */}
                  <div className="space-y-3 pt-6 border-t border-white/[0.08] mb-8">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      Included Capabilities:
                    </span>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="space-y-3 pt-4 border-t border-white/[0.08] mt-auto">
                  <a href="#contact" className="block w-full">
                    <Button
                      variant={plan.featured ? "electric" : "glass"}
                      size="md"
                      className="w-full text-xs font-bold"
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      Get Started with {plan.name}
                    </Button>
                  </a>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full"
                  >
                    <button
                      type="button"
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Contact on WhatsApp</span>
                    </button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clear Transparent Pricing Disclaimer */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl max-w-3xl mx-auto flex items-start gap-3.5 text-xs text-slate-400 leading-relaxed">
          <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block font-mono mb-0.5">
              Transparent Baseline Investment Note:
            </strong>
            Prices listed above are initial baseline estimates. Final pricing is customized according to your exact feature set, custom integrations (e.g. WhatsApp ordering automation, live KOT kitchen displays, or custom 3D shader complexity), and turnaround schedule. We provide itemized, fixed-price proposals with no surprises.
          </div>
        </div>
      </div>
    </section>
  );
}
