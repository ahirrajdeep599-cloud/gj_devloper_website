"use client";

import React, { useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { gjServices } from "@/data/services";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { 
  Briefcase, 
  ShoppingBag, 
  Utensils, 
  Building2, 
  UserCheck, 
  Zap, 
  Cpu, 
  Layers, 
  QrCode, 
  Sparkles, 
  MessageSquare, 
  Check, 
  ArrowRight
} from "lucide-react";

export default function ServicesSection() {
  const { services: apiServices, getWhatsAppUrl } = useSiteSettings();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const normalizedServices = (apiServices && apiServices.length > 0 ? apiServices : gjServices).map((s) => ({
    id: s.id,
    number: s.number,
    title: s.title,
    category: s.category,
    shortDescription:
      ("short_description" in s && s.short_description) ||
      ("shortDescription" in s && s.shortDescription) ||
      "",
    deliverables: Array.isArray(s.deliverables) ? s.deliverables : [],
    startingPrice:
      ("starting_price" in s && s.starting_price) ||
      ("startingPrice" in s && s.startingPrice) ||
      "",
    iconType:
      ("icon_type" in s && s.icon_type) ||
      ("iconType" in s && s.iconType) ||
      "Briefcase",
    badge: s.badge || "Service",
    whatsappPreset:
      ("whatsapp_preset" in s && s.whatsapp_preset) ||
      ("whatsappPreset" in s && s.whatsappPreset) ||
      `Hi, I'm interested in ${s.title}.`,
  }));

  const categories = [
    "All",
    ...Array.from(new Set(normalizedServices.map((s) => s.category).filter(Boolean))),
  ];

  const filteredServices =
    selectedCategory === "All"
      ? normalizedServices
      : normalizedServices.filter((s) => s.category === selectedCategory);

  const getServiceIcon = (iconType: string) => {
    switch (iconType) {
      case "Briefcase":
        return <Briefcase className="w-6 h-6 text-sky-400" />;
      case "ShoppingBag":
        return <ShoppingBag className="w-6 h-6 text-purple-400" />;
      case "Utensils":
        return <Utensils className="w-6 h-6 text-amber-400" />;
      case "Building2":
        return <Building2 className="w-6 h-6 text-emerald-400" />;
      case "UserCheck":
        return <UserCheck className="w-6 h-6 text-cyan-400" />;
      case "Zap":
        return <Zap className="w-6 h-6 text-fuchsia-400" />;
      case "Cpu":
        return <Cpu className="w-6 h-6 text-sky-400" />;
      case "Layers":
        return <Layers className="w-6 h-6 text-orange-400" />;
      case "QrCode":
        return <QrCode className="w-6 h-6 text-teal-400" />;
      case "Sparkles":
        return <Sparkles className="w-6 h-6 text-violet-400" />;
      default:
        return <Briefcase className="w-6 h-6 text-sky-400" />;
    }
  };

  return (
    <section id="services" className="relative py-28 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="ambient-glow-blue top-1/4 left-[-15%]" />
      <div className="ambient-glow-violet bottom-1/4 right-[-15%]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badge="10 Specialized Disciplines"
          badgeVariant="electric"
          title="Engineered For Business Growth."
          highlightedText="Our Services."
          subtitle="Explore the complete spectrum of web development, hospitality systems, and digital engineering services delivered by GJ Devloper."
        />

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] border border-white/20"
                  : "bg-slate-900/50 text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 10 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredServices.map((service) => {
            const whatsappUrl = getWhatsAppUrl(service.whatsappPreset);

            return (
              <div
                key={service.id}
                className="group relative rounded-3xl p-7 bg-slate-900/40 border border-white/[0.08] hover:border-sky-500/40 hover:bg-[#08102a]/80 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-12px_rgba(0,102,255,0.22)]"
              >
                <div>
                  {/* Top Header Row */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-sky-400/50 transition-all duration-300 shadow-lg">
                        {getServiceIcon(service.iconType)}
                      </div>
                      <span className="font-mono text-xs text-slate-500 font-bold">
                        #{service.number}
                      </span>
                    </div>

                    <Badge variant={service.number === "01" ? "electric" : "secondary"}>
                      {service.badge}
                    </Badge>
                  </div>

                  {/* Title & Short Description */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-sky-300 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-sm text-slate-300 font-normal leading-relaxed mb-6">
                    {service.shortDescription}
                  </p>

                  {/* Deliverables Checklist */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-white/[0.06]">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                      Deliverables Included:
                    </span>
                    {service.deliverables.map((deliv, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span>{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Card Actions: Starting Rate + WhatsApp + Get Quote */}
                <div className="pt-4 border-t border-white/[0.06] mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      Starting Investment
                    </span>
                    <span className="text-sm font-mono font-bold text-sky-300">
                      {service.startingPrice}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Get a Quote button (scrolls to inquiry form with pre-filled state) */}
                    <a href="#contact" className="w-full">
                      <Button
                        variant="glass"
                        size="sm"
                        className="w-full text-xs py-2.5"
                        icon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Get a Quote
                      </Button>
                    </a>

                    {/* WhatsApp 1-Click Inquiry */}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full"
                    >
                      <button
                        type="button"
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
