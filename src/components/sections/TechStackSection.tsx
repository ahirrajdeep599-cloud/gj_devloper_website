"use client";

import React, { useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { techStackData } from "@/data/techStack";
import { 
  Code, 
  Layers, 
  Shield, 
  Palette, 
  Globe, 
  Cpu, 
  Sparkles, 
  Activity, 
  Server, 
  Zap, 
  Cloud, 
  Share2, 
  Database, 
  FileCode, 
  Box, 
  GitBranch, 
  Gauge, 
  AlertCircle 
} from "lucide-react";

export default function TechStackSection() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = [
    "All",
    "Frontend",
    "3D & Creative",
    "Backend & Cloud",
    "State & Database",
    "Tools & CI/CD",
  ];

  const filteredTech =
    activeCategory === "All"
      ? techStackData
      : techStackData.filter((item) => item.category === activeCategory);

  const getTechIcon = (iconName: string) => {
    switch (iconName) {
      case "Code":
        return <Code className="w-5 h-5 text-sky-400" />;
      case "Layers":
        return <Layers className="w-5 h-5 text-indigo-400" />;
      case "Shield":
        return <Shield className="w-5 h-5 text-blue-400" />;
      case "Palette":
        return <Palette className="w-5 h-5 text-cyan-400" />;
      case "Globe":
        return <Globe className="w-5 h-5 text-purple-400" />;
      case "Cpu":
        return <Cpu className="w-5 h-5 text-fuchsia-400" />;
      case "Sparkles":
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      case "Activity":
        return <Activity className="w-5 h-5 text-emerald-400" />;
      case "Server":
        return <Server className="w-5 h-5 text-emerald-400" />;
      case "Zap":
        return <Zap className="w-5 h-5 text-amber-400" />;
      case "Cloud":
        return <Cloud className="w-5 h-5 text-sky-400" />;
      case "Share2":
        return <Share2 className="w-5 h-5 text-violet-400" />;
      case "Database":
        return <Database className="w-5 h-5 text-cyan-400" />;
      case "FileCode":
        return <FileCode className="w-5 h-5 text-teal-400" />;
      case "Box":
        return <Box className="w-5 h-5 text-blue-400" />;
      case "GitBranch":
        return <GitBranch className="w-5 h-5 text-purple-400" />;
      case "Gauge":
        return <Gauge className="w-5 h-5 text-emerald-400" />;
      case "AlertCircle":
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      default:
        return <Code className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <section id="tech-stack" className="relative py-28 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="ambient-glow-blue top-1/4 right-[-10%]" />
      <div className="ambient-glow-violet bottom-1/4 left-[-10%]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badge="High-Performance Arsenal"
          badgeVariant="electric"
          title="Battle-Tested Modern"
          highlightedText="Technology Stack."
          subtitle="We purposefully avoid outdated frameworks. We invest exclusively in modern, type-safe, sub-second tooling that guarantees long-term scalability."
        />

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] border border-white/20"
                  : "bg-slate-900/50 text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredTech.map((tech) => (
            <div
              key={tech.name}
              className={`p-6 rounded-2xl border transition-all duration-300 backdrop-blur-xl flex flex-col justify-between group ${
                tech.highlight
                  ? "bg-[#080f26]/80 border-sky-500/25 hover:border-sky-400/50 shadow-[0_4px_20px_rgba(0,102,255,0.1)] hover:-translate-y-1"
                  : "bg-slate-900/40 border-white/[0.06] hover:border-white/15 hover:bg-slate-900/70"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getTechIcon(tech.icon)}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2 py-0.5 rounded bg-white/[0.03]">
                    {tech.category}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white mb-2 group-hover:text-sky-300 transition-colors">
                  {tech.name}
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {tech.description}
                </p>
              </div>

              {tech.highlight && (
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-1.5 text-[11px] font-mono text-sky-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  <span>Production Core</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
