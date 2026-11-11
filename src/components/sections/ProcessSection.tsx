"use client";

import React, { useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import Badge from "@/components/ui/Badge";
import { processStepsData } from "@/data/process";
import { 
  Compass, 
  Sparkles, 
  Code2, 
  Rocket, 
  CheckCircle2, 
  ArrowRight 
} from "lucide-react";

export default function ProcessSection() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case "Compass":
        return <Compass className="w-6 h-6 text-sky-400" />;
      case "Sparkles":
        return <Sparkles className="w-6 h-6 text-purple-400" />;
      case "Code2":
        return <Code2 className="w-6 h-6 text-cyan-400" />;
      case "Rocket":
        return <Rocket className="w-6 h-6 text-emerald-400" />;
      default:
        return <Compass className="w-6 h-6 text-sky-400" />;
    }
  };

  return (
    <section id="process" className="relative py-28 bg-[#030818]/60 border-t border-white/[0.06] overflow-hidden">
      {/* Background radial glow */}
      <div className="ambient-glow-blue top-1/2 left-[-10%]" />
      <div className="ambient-glow-violet bottom-10 right-[-10%]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badge="Predictable Excellence"
          badgeVariant="violet"
          title="The 4-Phase Agency"
          highlightedText="Engineering Protocol."
          subtitle="No guesswork, no missed deadlines. We follow a battle-tested sprint methodology honed over 100+ production releases."
        />

        {/* Step Navigation Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {processStepsData.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <button
                key={step.step}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-[#09122e] border-sky-400/50 shadow-[0_0_25px_rgba(56,189,248,0.2)]"
                    : "bg-slate-900/30 border-white/[0.06] hover:bg-slate-900/60 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`font-mono text-xl font-black ${
                      isActive ? "text-gradient-electric" : "text-slate-500"
                    }`}
                  >
                    PHASE {step.step}
                  </span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-slate-400">
                    {step.duration}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-1">
                  {step.title}
                </h4>
              </button>
            );
          })}
        </div>

        {/* Active Phase Deep Dive Card */}
        {(() => {
          const current = processStepsData[activeStepIndex];
          return (
            <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left side details */}
                <div className="lg:col-span-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10">
                      {getStepIcon(current.icon)}
                    </div>
                    <div>
                      <span className="text-xs font-mono uppercase text-sky-400 tracking-wider">
                        Phase {current.step} Protocol • Estimated {current.duration}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
                        {current.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-base text-slate-300 leading-relaxed mb-8">
                    {current.description}
                  </p>

                  {/* Deliverables List */}
                  <div>
                    <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 font-semibold">
                      Key Milestones & Deliverables:
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {current.deliverables.map((item, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5 text-xs sm:text-sm text-slate-200"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right side interactive card graphic / summary */}
                <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-[#050a1b] border border-sky-500/20 shadow-inner flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <span className="text-xs font-mono text-slate-400 uppercase">
                      Quality Gate Guarantee
                    </span>
                    <Badge variant="emerald">Audit Passed</Badge>
                  </div>

                  <div className="my-6 space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Weekly Progress Demo:</span>
                      <span className="text-white font-semibold">Every Friday 3PM UTC</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Direct Engineer Access:</span>
                      <span className="text-sky-300 font-semibold">Dedicated Slack & WhatsApp</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Code Quality CI Check:</span>
                      <span className="text-emerald-400 font-semibold">100% Strict Type Check</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Client Review Cycles:</span>
                      <span className="text-purple-300 font-semibold">Unlimited until approval</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-mono">
                      Step {activeStepIndex + 1} of 4
                    </span>
                    <button
                      onClick={() =>
                        setActiveStepIndex(
                          (activeStepIndex + 1) % processStepsData.length
                        )
                      }
                      className="text-xs font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Next Phase</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}
