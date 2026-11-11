import React from "react";
import { 
  ShieldCheck, 
  Award,
  Zap,
  TrendingUp
} from "lucide-react";

export default function TrustedSection() {
  const partners = [
    { name: "NEXUS AI", tier: "Silicon Valley, CA" },
    { name: "AURA ATELIER", tier: "Milan / Paris" },
    { name: "PULSE CAPITAL", tier: "London, UK" },
    { name: "VERDANT BIOTECH", tier: "Zurich, CH" },
    { name: "HYPERION LABS", tier: "Austin, TX" },
    { name: "SYNAPSE VENTURES", tier: "Singapore" },
  ];

  const highlights = [
    {
      icon: <Award className="w-5 h-5 text-sky-400" />,
      title: "100+ Flagships Shipped",
      desc: "Zero-defect delivery across high-growth startups and venture-backed platforms.",
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
      title: "$50M+ Client Revenue",
      desc: "Our engineered storefronts and SaaS portals process millions in recurring monthly GMV.",
    },
    {
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      title: "Sub-Second LCP Guarantee",
      desc: "Obsessive performance engineering delivering perfect green Google Core Web Vitals.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: "100% Code Ownership",
      desc: "No proprietary lock-in. Full clean TypeScript repository handoff and docs.",
    },
  ];

  return (
    <section className="relative py-16 bg-[#040817]/70 border-y border-white/[0.06] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subtle Headline */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-8 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
            <h3 className="text-xs sm:text-sm font-mono uppercase tracking-widest text-slate-400 font-semibold">
              Trusted by Ambitious Founders & Tech Leaders Worldwide
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Global Engineering Standards • US / EU / APAC
          </span>
        </div>

        {/* Global Logos Marquee */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mb-12">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="p-4 rounded-xl bg-slate-900/40 border border-white/[0.06] hover:border-sky-500/30 transition-all duration-300 flex flex-col items-center justify-center text-center group"
            >
              <span className="font-mono font-bold text-sm sm:text-base text-slate-300 group-hover:text-white transition-colors tracking-wider">
                {partner.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-1 group-hover:text-sky-400 transition-colors">
                {partner.tier}
              </span>
            </div>
          ))}
        </div>

        {/* 4 Pillars of Excellence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all flex items-start gap-4"
            >
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
