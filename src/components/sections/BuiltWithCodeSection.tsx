"use client";

import React, { useState, useEffect } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { 
  Cpu, 
  Zap, 
  Code2, 
  Database, 
  Share2, 
  Smartphone, 
  Sparkles, 
  MessageSquare, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function BuiltWithCodeSection() {
  const { settings, getWhatsAppUrl } = useSiteSettings();
  const terminalSteps = [
    { label: "Thinking & Scoping", text: "Turning Ideas Into Reality...", status: "active" },
    { label: "Design Architecture", text: "Designing High-Fidelity UI & 3D Shaders...", status: "pending" },
    { label: "Engineering Sprint", text: "Building Next.js 15 App & Type-Safe APIs...", status: "pending" },
    { label: "Edge Optimization", text: "Deploying to Global CDN with 100/100 Core Web Vitals...", status: "pending" },
    { label: "Production Launch", text: "System Live. Production Ready.", status: "completed" },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % terminalSteps.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [terminalSteps.length]);

  const workflowCards = [
    {
      title: "AI-Assisted Development",
      description: "Leveraging cutting-edge generative AI models and automation to speed up component prototyping and eliminate boilerplate.",
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      gradient: "from-purple-500/10 to-indigo-500/5",
    },
    {
      title: "Rapid Prototyping",
      description: "Fast iteration loops from Figma concept to functional interactive browser preview within days, not weeks.",
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      gradient: "from-amber-500/10 to-orange-500/5",
    },
    {
      title: "Modern Frontend Development",
      description: "Component-driven architecture using Next.js 15, React 19, TypeScript, and utility-first Tailwind CSS.",
      icon: <Code2 className="w-5 h-5 text-sky-400" />,
      gradient: "from-sky-500/10 to-blue-500/5",
    },
    {
      title: "Backend Integration",
      description: "Serverless edge functions and Node.js microservices engineered for high throughput and instantaneous response.",
      icon: <Cpu className="w-5 h-5 text-blue-400" />,
      gradient: "from-blue-500/10 to-indigo-500/5",
    },
    {
      title: "API Integration",
      description: "Connecting WhatsApp Business Cloud APIs, CRM systems, SMS alerts, and third-party SaaS webhooks flawlessly.",
      icon: <Share2 className="w-5 h-5 text-cyan-400" />,
      gradient: "from-cyan-500/10 to-teal-500/5",
    },
    {
      title: "Responsive Web Design",
      description: "Pixel-perfect mobile, tablet, and ultra-wide monitor fluid layouts optimized for touch and desktop gestures.",
      icon: <Smartphone className="w-5 h-5 text-pink-400" />,
      gradient: "from-pink-500/10 to-rose-500/5",
    },
    {
      title: "Database Integration",
      description: "Relational data modeling, SQLite, and cloud databases with parameterized queries and sub-second caching.",
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      gradient: "from-emerald-500/10 to-green-500/5",
    },
    {
      title: "Creative Problem Solving",
      description: "Blending engineering rigor with visual design to overcome complex product bottlenecks and UX friction.",
      icon: <CheckCircle2 className="w-5 h-5 text-violet-400" />,
      gradient: "from-violet-500/10 to-purple-500/5",
    },
  ];

  const ctaWhatsAppUrl = getWhatsAppUrl(
    `Hi ${settings.agency_name || "GJ Devloper"}, I have an idea for a web project and saw your 'Built with Code' workflow. Let's build it together!`
  );

  return (
    <section className="relative py-28 overflow-hidden bg-[#030617] border-t border-white/[0.06]">
      {/* Background ambient lighting */}
      <div className="ambient-glow-blue top-1/4 right-[-12%]" />
      <div className="ambient-glow-violet bottom-1/3 left-[-12%]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badge="Engineering DNA"
          badgeVariant="electric"
          title="BUILT WITH CODE."
          highlightedText="POWERED BY CREATIVITY."
          subtitle="We turn ideas into digital experiences using modern AI-powered development workflows."
        />

        {/* Animated Terminal Window */}
        <div className="max-w-3xl mx-auto mb-16 rounded-3xl bg-[#05091a] border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,102,255,0.25)] overflow-hidden">
          {/* Terminal Window Header Bar */}
          <div className="px-5 py-3.5 bg-slate-900/80 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">
                gj-devloper-terminal ~ ai-engine v3.8
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Cycle</span>
            </div>
          </div>

          {/* Terminal Screen Body */}
          <div className="p-6 sm:p-8 font-mono text-xs sm:text-sm space-y-3.5">
            <div className="text-slate-500">
              $ npx gj-devloper init --workflow=modern-ai-stack --mode=production
            </div>

            {terminalSteps.map((step, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 transition-opacity duration-300 ${
                    isCurrent
                      ? "opacity-100 text-sky-300"
                      : isPast
                      ? "opacity-60 text-slate-400"
                      : "opacity-25 text-slate-600"
                  }`}
                >
                  <span className="text-slate-500 shrink-0 font-bold">
                    [{String(idx + 1).padStart(2, "0")}]
                  </span>
                  <span className="text-emerald-400 shrink-0">
                    {isCurrent ? "⚡" : isPast ? "✔" : "○"}
                  </span>
                  <div className="flex-1">
                    <span className="font-bold text-slate-200 mr-2">
                      {step.label}:
                    </span>
                    <span>{step.text}</span>
                    {isCurrent && (
                      <span className="inline-block w-2 h-4 bg-sky-400 ml-1.5 animate-pulse align-middle" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 8 Workflow Technology Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {workflowCards.map((card, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-gradient-to-br ${card.gradient} border border-white/[0.08] hover:border-sky-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,102,255,0.15)] flex flex-col justify-between`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-4 shadow-md">
                  {card.icon}
                </div>
                <h4 className="text-base font-bold text-white mb-2">
                  {card.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Active Workflow</span>
              </div>
            </div>
          ))}
        </div>

        {/* Big Creative Call to Action Bar */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-slate-900/60 border border-sky-500/30 shadow-[0_20px_50px_rgba(0,102,255,0.2)] backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="max-w-xl">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-300 font-bold block mb-1">
              Ready to execute?
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              {settings.cta_heading || "Have an Idea? Let's Build It!"}
            </h3>
            <p className="text-sm text-slate-300">
              {settings.cta_subtitle ||
                "From initial sketch to high-speed digital reality, let's bring your vision to life."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href={ctaWhatsAppUrl} target="_blank" rel="noreferrer">
              <button
                type="button"
                className="py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Discuss on WhatsApp</span>
              </button>
            </a>

            <a href="#contact">
              <Button
                variant="electric"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Start Your Project
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
