import React from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import Badge from "@/components/ui/Badge";
import { 
  Check, 
  X, 
  Zap, 
  ShieldCheck, 
  Sparkles 
} from "lucide-react";

export default function WhyUsSection() {
  const comparisonRows = [
    {
      feature: "Engineering Talent Level",
      gj: "Senior Principal Engineers & Founders Only",
      traditional: "Delegated to junior interns / offshore pool",
      freelancer: "Single generalist, unknown code quality",
    },
    {
      feature: "3D & WebGL Capabilities",
      gj: "Custom Three.js Shaders & 60fps Native Physics",
      traditional: "Heavy lottie files or outsourced 3D at huge cost",
      freelancer: "Basic CSS animations or static images",
    },
    {
      feature: "PageSpeed & Core Web Vitals",
      gj: "Guaranteed 95-100 Score on Mobile & Desktop",
      traditional: "Bloated 40-60 scores with slow third-party scripts",
      freelancer: "Rarely tested or optimized",
    },
    {
      feature: "Code Architecture & Scalability",
      gj: "Next.js 15, Strict TypeScript, Zero Tech Debt",
      traditional: "Monolithic CMS legacy templates (WordPress / Drupal)",
      freelancer: "Spaghetti code with broken plugins",
    },
    {
      feature: "Communication & Velocity",
      gj: "Direct Private Slack / WhatsApp & Weekly Sprints",
      traditional: "Layers of account managers and endless ticketing",
      freelancer: "Ghosting risks & irregular communication",
    },
    {
      feature: "IP & Code Ownership",
      gj: "100% Full IP Transfer & GitHub Repository Handover",
      traditional: "Proprietary CMS lock-in or recurring hosting hostage",
      freelancer: "Hostage risks, missing documentation",
    },
  ];

  return (
    <section id="why-us" className="relative py-28 bg-[#04091c]/50 border-t border-white/[0.06] overflow-hidden">
      {/* Background radial glow */}
      <div className="ambient-glow-blue top-1/2 right-[-10%]" />
      <div className="ambient-glow-violet bottom-10 left-[-10%]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badge="The Benchmark Standard"
          badgeVariant="electric"
          title="Why Global Brands Choose"
          highlightedText="GJ Devloper."
          subtitle="Most agencies sell bloated retainers and billable hours. We sell unfair competitive advantages, raw engineering speed, and digital supremacy."
        />

        {/* Feature Comparison Table */}
        <div className="overflow-x-auto rounded-3xl border border-white/[0.08] bg-slate-900/40 backdrop-blur-xl shadow-2xl p-1 mb-16">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="py-5 px-6 text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold w-1/4">
                  Feature / Capability
                </th>
                <th className="py-5 px-6 text-sm font-bold text-white bg-gradient-to-r from-blue-600/30 via-indigo-600/20 to-transparent rounded-t-2xl w-1/3 border-x border-sky-400/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8] animate-pulse" />
                    <span className="text-gradient-electric text-base font-extrabold font-sans">
                      GJ Devloper
                    </span>
                    <Badge variant="electric" className="text-[10px] py-0.5 px-2">
                      Elite
                    </Badge>
                  </div>
                </th>
                <th className="py-5 px-6 text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold w-1/5">
                  Traditional Agencies
                </th>
                <th className="py-5 px-6 text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold w-1/5">
                  Budget Freelancers
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-sm">
              {comparisonRows.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="py-4 px-6 font-medium text-slate-200 text-xs sm:text-sm">
                    {row.feature}
                  </td>
                  <td className="py-4 px-6 bg-blue-500/[0.03] border-x border-sky-400/20 font-medium text-sky-200">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>{row.gj}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-400 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-rose-500/80 shrink-0" />
                      <span>{row.traditional}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-400 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-rose-500/80 shrink-0" />
                      <span>{row.freelancer}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3 Pillars Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-sky-500/40 backdrop-blur-xl transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Extreme Velocity
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We deploy rapid iteration cycles without compromising code purity. From kickoff to live global deployment in 4 to 6 weeks, not 6 months.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-purple-500/40 backdrop-blur-xl transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Sensory 3D Craft
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We create magnetic, interactive WebGL landscapes that stop users in their tracks, turn bounce rates into sales, and establish instant market authority.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-emerald-500/40 backdrop-blur-xl transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Enterprise Resilience
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Bulletproof TypeScript, automated CI/CD pipelines, and zero-trust security practices engineered to pass enterprise vendor security reviews on first try.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
