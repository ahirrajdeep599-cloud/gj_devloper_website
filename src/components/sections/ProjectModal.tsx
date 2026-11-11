"use client";

import React, { useEffect } from "react";
import { PortfolioSampleProject } from "@/data/projects";
import { X, MessageSquare } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { getWhatsAppDirectUrl } from "@/lib/whatsapp";

interface ProjectModalProps {
  project: PortfolioSampleProject | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (project) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const whatsappHref = getWhatsAppDirectUrl(project.whatsappPrompt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-xl transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-4xl bg-[#070c1e] border border-white/15 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <Badge variant="electric">{project.serviceCategory}</Badge>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              📌 {project.clientBadge}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Close Case Study"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* Title & Overview */}
          <div>
            <div className="text-xs font-mono text-slate-400 mb-1">
              {project.sampleNotice}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              {project.title}
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Key Impact Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-950/60 border border-white/10">
            {project.metrics.map((res, i) => (
              <div key={i} className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono text-gradient-electric">
                  {res.value}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-1 uppercase tracking-wider">
                  {res.label}
                </div>
              </div>
            ))}
          </div>

          {/* Deep Dive: Challenge & Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-rose-500/[0.03] border border-rose-500/20">
              <h3 className="text-sm font-mono uppercase tracking-wider text-rose-400 font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Problem &amp; Inefficiency
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {project.challenge}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-sky-500/[0.03] border border-sky-500/20">
              <h3 className="text-sm font-mono uppercase tracking-wider text-sky-400 font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                GJ Devloper Architecture
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {project.solution}
              </p>
            </div>
          </div>

          {/* Technologies Used */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 font-semibold">
              Technologies Deployed In This Build:
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-mono text-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-6 border-t border-white/10 bg-slate-900/60 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs text-slate-400 font-mono">
            Want a tailored architecture like this for your brand?
          </span>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <a href={whatsappHref} target="_blank" rel="noreferrer">
              <button
                type="button"
                className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Discuss on WhatsApp</span>
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
