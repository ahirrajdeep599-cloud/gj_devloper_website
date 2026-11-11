"use client";

import React from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { 
  Code2, 
  Cpu, 
  Zap, 
  ArrowRight,
  GitBranch,
  CheckCircle2
} from "lucide-react";

export default function AboutSection() {
  const pillars = [
    {
      title: "Clean, Scalable Architecture",
      description: "We don't use fragile page builders or bloated WordPress themes. Every solution is written in strict TypeScript, modern Next.js, and modular CSS that scales seamlessly.",
      icon: <Code2 className="w-5 h-5 text-sky-400" />,
    },
    {
      title: "Full-Stack Versatility",
      description: "From pixel-perfect mobile-first interfaces to complex relational database schemas, secure authentication, and webhook integrations—we handle the complete technology stack.",
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
    },
    {
      title: "Direct Developer Partnership",
      description: "You collaborate directly with senior software engineers. No junior intermediaries or lost-in-translation requirements. Fast technical answers and rapid weekly deployment cycles.",
      icon: <GitBranch className="w-5 h-5 text-emerald-400" />,
    },
    {
      title: "Results-Driven Performance",
      description: "We engineer for sub-second speeds, top organic search visibility, and maximum user engagement so your web investment delivers measurable business returns.",
      icon: <Zap className="w-5 h-5 text-amber-400" />,
    },
  ];

  return (
    <section id="about" className="relative py-28 overflow-hidden bg-[#020510] border-t border-white/[0.06]">
      {/* Background ambient lighting */}
      <div className="ambient-glow-blue top-1/3 left-[-10%]" />
      <div className="ambient-glow-violet bottom-1/4 right-[-10%]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Mission & Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <Badge variant="electric" hasDot>
              Engineering Philosophy
            </Badge>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
              MORE THAN JUST A WEBSITE.{" "}
              <span className="text-gradient-electric block mt-1">
                WE BUILD DIGITAL SOLUTIONS.
              </span>
            </h2>

            <p className="text-base text-slate-300 leading-relaxed">
              At <strong className="text-white">GJ Devloper</strong>, we believe modern businesses deserve more than cookie-cutter templates that slow down browsers and fail to convert. We are a specialized web development studio focused on crafting high-performance, responsive, and functional digital experiences.
            </p>

            <p className="text-sm text-slate-400 leading-relaxed">
              Whether architecting a digital QR menu system for high-volume dining, a direct-booking hotel portal, or a scalable SaaS platform, we bring hardcore programming expertise and modern design sensibilities to every line of code.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <a href="#services">
                <Button variant="electric" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Services
                </Button>
              </a>

              <a href="#projects">
                <Button variant="secondary" size="md">
                  View Project Gallery
                </Button>
              </a>
            </div>
          </div>

          {/* Right Column: 4 Pillars of Developer Craft */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-sky-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,102,255,0.15)] flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>The GJ Standard</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
