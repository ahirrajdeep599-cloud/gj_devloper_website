"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ArrowRight, Sparkles, Code2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import CodeEditorVisual from "@/components/ui/CodeEditorVisual";
import { useSiteSettings } from "@/context/SiteSettingsContext";

// Dynamically import the 3D Canvas with ssr: false for flawless client-side WebGL rendering
const HeroSphereCanvas = dynamic(
  () => import("@/components/3d/HeroSphereCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[350px] flex items-center justify-center">
        <div className="w-40 h-40 rounded-full border border-sky-500/20 animate-spin border-t-sky-400" />
      </div>
    ),
  }
);

interface HeroSectionProps {
  onStartProject?: () => void;
}

export default function HeroSection({}: HeroSectionProps) {
  const { settings } = useSiteSettings();
  const heroHeading = settings.hero_heading || "WE CODE. WE CREATE. WE BUILD DIGITAL EXPERIENCES.";
  const isDefaultHeading = heroHeading.trim() === "WE CODE. WE CREATE. WE BUILD DIGITAL EXPERIENCES.";
  const heroSubtitle =
    settings.hero_subtitle ||
    "From creative ideas to powerful digital solutions, GJ Devloper transforms businesses through modern web development.";

  return (
    <section className="relative min-h-[95vh] pt-32 pb-20 flex items-center justify-center overflow-hidden">
      {/* Background radial ambient lights */}
      <div className="ambient-glow-blue top-10 left-[-10%]" />
      <div className="ambient-glow-violet top-20 right-[-10%]" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* Floating Programming Symbols in Background */}
      <div className="absolute top-28 left-8 text-sky-500/20 font-mono text-3xl font-black select-none pointer-events-none animate-pulse">
        &lt;/&gt;
      </div>
      <div className="absolute top-44 right-16 text-purple-500/20 font-mono text-4xl font-black select-none pointer-events-none animate-pulse [animation-delay:1.5s]">
        &#123; TypeScript &#125;
      </div>
      <div className="absolute bottom-32 left-12 text-indigo-500/20 font-mono text-2xl font-bold select-none pointer-events-none">
        async &#47;&#47; await =&gt;
      </div>
      <div className="absolute bottom-20 right-28 text-cyan-500/20 font-mono text-3xl font-black select-none pointer-events-none">
        Next.js 15
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Developer Studio Headline & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Top Status Badge */}
            <div className="inline-flex items-center gap-2 mb-6">
              <Badge variant="electric" hasDot>
                Modern Software &amp; Web Development Studio
              </Badge>
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-white/10 text-xs font-mono text-slate-300">
                <Code2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Clean Code Architecture</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.1] mb-6">
              {isDefaultHeading ? (
                <>
                  WE CODE. <br />
                  <span className="text-gradient-primary">WE CREATE.</span> <br />
                  WE BUILD DIGITAL EXPERIENCES.
                </>
              ) : (
                heroHeading
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl mb-8">
              {heroSubtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-10">
              <a href="#projects" className="w-full sm:w-auto">
                <Button
                  variant="electric"
                  size="xl"
                  glow
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto font-bold font-mono text-sm"
                >
                  Explore Our Projects
                </Button>
              </a>

              <a href="#contact" className="w-full sm:w-auto">
                <Button
                  variant="glass"
                  size="xl"
                  icon={<Sparkles className="w-4 h-4 text-sky-400" />}
                  className="w-full sm:w-auto font-bold font-mono text-sm"
                >
                  Let&apos;s Build Something
                </Button>
              </a>
            </div>

            {/* Developer Proof Points */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 sm:gap-8 w-full max-w-lg">
              <div>
                <div className="text-2xl font-black text-white font-mono text-gradient-electric">
                  100%
                </div>
                <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
                  Type-Safe Code
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-white font-mono text-gradient-electric">
                  &lt; 0.4s
                </div>
                <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
                  PageSpeed Load
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-white font-mono text-gradient-electric">
                  Zero
                </div>
                <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
                  Bloated Templates
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Code Editor Visual with Layered 3D Technology Accents */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
            {/* Ambient Background 3D Sphere Element */}
            <div className="absolute -top-16 -right-12 w-64 h-64 opacity-50 pointer-events-none -z-10 hidden sm:block">
              <HeroSphereCanvas />
            </div>

            {/* Visual Code Editor Window */}
            <CodeEditorVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
