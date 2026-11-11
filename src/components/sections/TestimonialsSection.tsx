"use client";

import React, { useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { testimonialsData } from "@/data/testimonials";
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevTestimonial = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonialsData.length - 1 : prev - 1
    );
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) =>
      prev === testimonialsData.length - 1 ? 0 : prev + 1
    );
  };

  const activeItem = testimonialsData[currentIndex];

  return (
    <section id="testimonials" className="relative py-28 bg-[#04081b]/50 border-t border-white/[0.06] overflow-hidden">
      {/* Background ambient glow */}
      <div className="ambient-glow-blue top-1/3 left-[-10%]" />
      <div className="ambient-glow-violet bottom-1/4 right-[-10%]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badge="Verified Client Proof"
          badgeVariant="emerald"
          title="Endorsed By Founders &"
          highlightedText="Global Leaders."
          subtitle="Don't take our word for it. Here is what technology executives and venture-backed founders say about engineering with GJ Devloper."
        />

        {/* Featured Testimonial Spotlight */}
        <div className="relative max-w-4xl mx-auto rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl mb-12">
          {/* Quote Icon */}
          <div className="absolute top-6 right-8 text-white/[0.05] pointer-events-none">
            <Quote className="w-24 h-24" />
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-1.5 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-5 h-5 fill-amber-400 text-amber-400"
              />
            ))}
            <span className="ml-2 text-xs font-mono text-slate-400">
              5.0 Verified Review
            </span>
          </div>

          {/* Quote Text */}
          <blockquote className="text-lg sm:text-xl md:text-2xl font-medium text-slate-100 leading-relaxed mb-8">
            &ldquo;{activeItem.quote}&rdquo;
          </blockquote>

          {/* Author Details & Scope */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-[#070d24] flex items-center justify-center font-bold text-sky-300 font-mono text-sm">
                  {activeItem.avatar}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">
                    {activeItem.clientName}
                  </h4>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {activeItem.clientRole} • {activeItem.clientCompany}
                </div>
                <div className="text-[11px] text-sky-400/80 font-mono mt-0.5">
                  📍 {activeItem.location} • Scope: {activeItem.projectScope}
                </div>
              </div>
            </div>

            {/* Next / Prev Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevTestimonial}
                className="p-3 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                aria-label="Previous Testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono text-slate-400 px-2">
                {currentIndex + 1} / {testimonialsData.length}
              </span>
              <button
                onClick={nextTestimonial}
                className="p-3 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                aria-label="Next Testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Small thumbnail pills below */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {testimonialsData.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                idx === currentIndex
                  ? "bg-sky-500/10 border-sky-400/40 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                  : "bg-white/[0.03] border-white/5 text-slate-400 hover:text-slate-200"
              }`}
            >
              {item.clientName} ({item.clientCompany.split(" ")[0]})
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
