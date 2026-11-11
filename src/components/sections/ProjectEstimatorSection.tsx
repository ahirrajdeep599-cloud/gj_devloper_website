"use client";

import React, { useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Check, ArrowRight, Sparkles, Clock } from "lucide-react";

interface EstimatorProps {
  onApplyEstimate?: (details: string) => void;
}

export default function ProjectEstimatorSection({ onApplyEstimate }: EstimatorProps) {
  const [projectType, setProjectType] = useState<string>("webapp");
  const [scopeSize, setScopeSize] = useState<string>("medium");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([
    "3d",
    "seo",
  ]);
  const [urgency, setUrgency] = useState<string>("standard");

  const projectTypes = [
    { id: "webapp", name: "Full-Stack Web App", basePrice: 4000, weeks: 4 },
    { id: "3d-exp", name: "Interactive 3D / WebGL", basePrice: 4500, weeks: 4 },
    { id: "ecommerce", name: "Headless E-Commerce", basePrice: 4200, weeks: 5 },
    { id: "design", name: "Bespoke UI/UX & Design System", basePrice: 2800, weeks: 3 },
  ];

  const scopeSizes = [
    { id: "starter", name: "Focused MVP (1 - 5 Views)", multiplier: 1 },
    { id: "medium", name: "Growth Suite (6 - 15 Views)", multiplier: 1.4 },
    { id: "enterprise", name: "Enterprise Flagship (16+ Views)", multiplier: 2.1 },
  ];

  const addonsList = [
    { id: "3d", name: "Custom 3D Shaders & WebGL Canvas", price: 1500 },
    { id: "seo", name: "100/100 Core Web Vitals & Technical SEO", price: 800 },
    { id: "auth", name: "Enterprise Auth & Database Modeling", price: 1200 },
    { id: "payments", name: "WhatsApp Direct Ordering & Instant Checkout Engine", price: 1000 },
    { id: "cms", name: "Headless CMS Integration (Sanity / Strapi)", price: 900 },
  ];

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Calculate pricing
  const currentType = projectTypes.find((p) => p.id === projectType) || projectTypes[0];
  const currentScope = scopeSizes.find((s) => s.id === scopeSize) || scopeSizes[1];

  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const item = addonsList.find((a) => a.id === addonId);
    return sum + (item ? item.price : 0);
  }, 0);

  const urgencyMultiplier = urgency === "rush" ? 1.3 : 1;
  const calculatedPrice = Math.round(
    (currentType.basePrice * currentScope.multiplier + addonsTotal) * urgencyMultiplier
  );

  const calculatedWeeks = Math.max(
    2,
    Math.round(
      currentType.weeks * (currentScope.multiplier > 1.5 ? 1.4 : 1) * (urgency === "rush" ? 0.65 : 1)
    )
  );

  const handleTransferToContact = () => {
    const summary = `Estimated Project: ${currentType.name} | Scope: ${currentScope.name} | Add-ons: ${selectedAddons.join(
      ", "
    )} | Timeline: ~${calculatedWeeks} weeks | Estimated Bracket: $${calculatedPrice.toLocaleString()}`;
    if (onApplyEstimate) {
      onApplyEstimate(summary);
    }
    const contactElem = document.getElementById("contact");
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="estimator" className="relative py-28 overflow-hidden">
      {/* Background radial glow */}
      <div className="ambient-glow-blue top-1/2 left-[-10%]" />
      <div className="ambient-glow-violet bottom-10 right-[-10%]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badge="Interactive Estimator"
          badgeVariant="electric"
          title="Calculate Your Project"
          highlightedText="Scope & Investment."
          subtitle="Transparent, upfront engineering investment modeling. Configure your desired architecture and receive an immediate projection."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-8 space-y-8 p-6 sm:p-10 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
            {/* Step 1: Project Type */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3 block">
                01. Select Digital Architecture Type:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projectTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setProjectType(type.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      projectType === type.id
                        ? "bg-sky-500/10 border-sky-400 text-white shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                        : "bg-white/[0.02] border-white/[0.08] text-slate-300 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="font-semibold text-sm">{type.name}</span>
                    <span className="text-xs font-mono text-slate-400">
                      from ${type.basePrice.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Scope Size */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3 block">
                02. Application Complexity & Scope:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {scopeSizes.map((scope) => (
                  <button
                    key={scope.id}
                    onClick={() => setScopeSize(scope.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      scopeSize === scope.id
                        ? "bg-purple-500/10 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                        : "bg-white/[0.02] border-white/[0.08] text-slate-300 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="font-semibold text-xs sm:text-sm">
                      {scope.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Add-ons */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3 block">
                03. High-Performance Add-Ons & Capabilities:
              </label>
              <div className="space-y-2.5">
                {addonsList.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? "bg-sky-500/[0.07] border-sky-500/40 text-white"
                          : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isChecked
                              ? "bg-sky-500 border-sky-400 text-black"
                              : "border-white/20 bg-white/5"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs sm:text-sm font-medium">
                          {addon.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        +${addon.price.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Urgency */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3 block">
                04. Delivery Velocity:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setUrgency("standard")}
                  className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    urgency === "standard"
                      ? "bg-sky-500/10 border-sky-400 text-white"
                      : "bg-white/[0.02] border-white/[0.08] text-slate-400"
                  }`}
                >
                  <span className="text-xs sm:text-sm font-semibold">Standard Sprint</span>
                  <span className="block text-[11px] font-mono text-slate-400 mt-0.5">Regular queue</span>
                </button>
                <button
                  onClick={() => setUrgency("rush")}
                  className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    urgency === "rush"
                      ? "bg-purple-500/10 border-purple-400 text-white"
                      : "bg-white/[0.02] border-white/[0.08] text-slate-400"
                  }`}
                >
                  <span className="text-xs sm:text-sm font-semibold">Priority Fast-Track (+30%)</span>
                  <span className="block text-[11px] font-mono text-slate-400 mt-0.5">Dedicated sprint team</span>
                </button>
              </div>
            </div>
          </div>

          {/* Projection Summary Card */}
          <div className="lg:col-span-4 sticky top-28 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0a1332] to-[#040819] border border-sky-500/30 shadow-[0_20px_50px_rgba(0,102,255,0.25)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Scope Summary
                </span>
                <Badge variant="electric">Instant Projection</Badge>
              </div>

              {/* Estimated Price Display */}
              <div className="my-6">
                <span className="text-xs font-mono text-slate-400 block mb-1">
                  Estimated Investment Bracket:
                </span>
                <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono text-gradient-electric tracking-tight">
                  ${calculatedPrice.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                  Fixed-scope agreement • No surprise billing
                </span>
              </div>

              {/* Delivery Timeline */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" /> Projected Sprint:
                  </span>
                  <span className="text-white font-bold">~{calculatedWeeks} Weeks</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Milestone Guarantee:
                  </span>
                  <span className="text-emerald-400 font-bold">100% On-Time</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1.5 mb-8">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Includes all source code & GitHub handover</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>30-day post-launch hypercare & bug-free warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>100/100 Core Web Vitals speed guarantee</span>
                </div>
              </div>
            </div>

            <Button
              variant="electric"
              size="lg"
              className="w-full"
              onClick={handleTransferToContact}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Export Scope & Start Project
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
