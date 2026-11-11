"use client";

import React, { useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ProjectModal from "@/components/sections/ProjectModal";
import { sampleProjectsData, PortfolioSampleProject } from "@/data/projects";
import { getWhatsAppDirectUrl } from "@/lib/whatsapp";
import { 
  ArrowUpRight, 
  MessageSquare, 
  Sparkles, 
  ChevronRight,
  Utensils,
  Building2,
  ShoppingBag,
  Cpu,
  UserCheck,
  Layers
} from "lucide-react";

export default function ProjectsSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeModalProject, setActiveModalProject] = useState<PortfolioSampleProject | null>(null);

  const categories = [
    "All",
    "Restaurant & QR",
    "Hotel & Hospitality",
    "E-Commerce",
    "Custom Web Apps",
    "Brand Portfolios",
  ];

  const filteredProjects =
    selectedCategory === "All"
      ? sampleProjectsData
      : sampleProjectsData.filter((p) => p.serviceCategory === selectedCategory);

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "restaurant":
        return <Utensils className="w-8 h-8 text-amber-300" />;
      case "hotel":
        return <Building2 className="w-8 h-8 text-emerald-300" />;
      case "ecommerce":
        return <ShoppingBag className="w-8 h-8 text-purple-300" />;
      case "pos":
        return <Layers className="w-8 h-8 text-orange-300" />;
      case "webapp":
        return <Cpu className="w-8 h-8 text-sky-300" />;
      case "portfolio":
        return <UserCheck className="w-8 h-8 text-violet-300" />;
      default:
        return <Sparkles className="w-8 h-8 text-sky-300" />;
    }
  };

  return (
    <section id="projects" className="relative py-28 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="ambient-glow-blue top-1/4 left-[-12%]" />
      <div className="ambient-glow-violet bottom-1/3 right-[-12%]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badge="Interactive Portfolio"
          badgeVariant="electric"
          title="Curated Architecture"
          highlightedText="& Sample Showcases."
          subtitle="Explore interactive sample projects engineered to illustrate GJ Devloper's capabilities across restaurants, hotels, e-commerce, and enterprise applications."
        />

        {/* Transparent Sample Disclaimer Pill */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 border border-amber-500/30 text-amber-300 text-xs font-mono">
            <span>📌 Note:</span>
            <span className="text-slate-300">
              Showcases below are sample demonstration architectures created by GJ Devloper.
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-14">
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

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {filteredProjects.map((project) => {
            const whatsappUrl = getWhatsAppDirectUrl(project.whatsappPrompt);

            return (
              <div
                key={project.id}
                className="group relative rounded-3xl bg-slate-900/40 border border-white/[0.08] hover:border-sky-500/40 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-15px_rgba(0,102,255,0.25)] flex flex-col justify-between"
              >
                {/* Top Banner / Large Visual Mockup Header */}
                <div
                  onClick={() => setActiveModalProject(project)}
                  className={`relative h-64 sm:h-76 w-full bg-gradient-to-br ${project.gradient} p-6 flex flex-col justify-between overflow-hidden cursor-pointer`}
                >
                  {/* Background geometric overlay */}
                  <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
                  <div className="absolute inset-0 bg-dot-pattern opacity-30" />

                  {/* Top Badge & Metric */}
                  <div className="relative z-10 flex items-center justify-between">
                    <Badge variant="electric">{project.serviceCategory}</Badge>
                    <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-black/60 border border-white/20 text-amber-300 backdrop-blur-md">
                      Sample Architecture
                    </span>
                  </div>

                  {/* Center Visual Mockup Accent */}
                  <div className="relative z-10 flex items-center gap-4 my-auto">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      {getCategoryIcon(project.previewMockupType)}
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">
                        {project.title}
                      </div>
                      <div className="text-xs font-mono text-slate-300">
                        {project.sampleNotice}
                      </div>
                    </div>
                  </div>

                  {/* High-Impact Stat Highlight inside card header */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md">
                      <span className="text-xl font-black text-white font-mono text-gradient-electric">
                        {project.metrics[0].value}
                      </span>
                      <span className="text-[11px] text-slate-300 font-mono ml-2">
                        {project.metrics[0].label}
                      </span>
                    </div>

                    {/* Hover reveal action pill */}
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold font-mono shadow-xl opacity-90 group-hover:opacity-100 transition-opacity">
                      <span>View Blueprint</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Bottom Card Content */}
                <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                  <div>
                    <h3
                      onClick={() => setActiveModalProject(project)}
                      className="text-2xl font-bold text-white mb-3 hover:text-sky-300 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>{project.title}</span>
                      <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-sky-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-6">
                      {project.summary}
                    </p>
                  </div>

                  {/* Tech Tags & Actions */}
                  <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/5 text-xs font-mono text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveModalProject(project)}
                        className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer"
                      >
                        Details
                      </button>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Inquire on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Work CTA Callout */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-slate-900/50 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-2xl font-extrabold text-white mb-2">
              Have your own custom concept ready to bring to life?
            </h3>
            <p className="text-sm text-slate-300">
              We specialize in custom design systems, bespoke restaurant/hotel digital platforms, and production-ready web applications.
            </p>
          </div>

          <a href="#contact">
            <Button
              variant="electric"
              size="lg"
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Start Your Custom Build
            </Button>
          </a>
        </div>
      </div>

      {/* Case Study Modal */}
      <ProjectModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
      />
    </section>
  );
}
