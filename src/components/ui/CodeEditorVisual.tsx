"use client";

import React, { useState } from "react";
import { Terminal, Copy, Check, FileCode } from "lucide-react";

export default function CodeEditorVisual() {
  const [activeTab, setActiveTab] = useState<"code" | "terminal" | "config">("code");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-2xl bg-[#070b19] border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,102,255,0.35)] overflow-hidden backdrop-blur-2xl">
      {/* Window Titlebar */}
      <div className="px-4 py-3 bg-[#050813] border-b border-white/10 flex items-center justify-between select-none">
        {/* macOS window controls */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors cursor-pointer" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors cursor-pointer" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors cursor-pointer" />
        </div>

        {/* File Tabs */}
        <div className="flex items-center gap-1 text-xs font-mono">
          <button
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "code"
                ? "bg-[#0b132e] text-sky-300 border border-sky-500/30 font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-sky-400" />
            <span>GJDevloper.tsx</span>
          </button>

          <button
            onClick={() => setActiveTab("terminal")}
            className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "terminal"
                ? "bg-[#0b132e] text-emerald-300 border border-emerald-500/30 font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>deploy.sh</span>
          </button>
        </div>

        {/* Action icons */}
        <button
          onClick={handleCopy}
          className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          title="Copy snippet"
          aria-label="Copy snippet"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Editor Content */}
      <div className="p-5 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto min-h-[320px]">
        {activeTab === "code" && (
          <div className="space-y-1">
            <div className="text-slate-500">&#47;&#47; 🚀 GJ Devloper • Modern Web Architecture</div>
            <div className="text-slate-400">
              <span className="text-purple-400 font-semibold">import</span> &#123;{" "}
              <span className="text-sky-300">FastApp</span>,{" "}
              <span className="text-sky-300">WebGLCanvas</span>,{" "}
              <span className="text-sky-300">WhatsAppFlow</span> &#125;{" "}
              <span className="text-purple-400 font-semibold">from</span>{" "}
              <span className="text-emerald-300">&quot;@gj-devloper/core&quot;</span>;
            </div>
            <br />
            <div>
              <span className="text-purple-400 font-semibold">export async function</span>{" "}
              <span className="text-blue-400 font-bold">buildDigitalExperience</span>&#40;
              <span className="text-amber-300">clientGoals</span>&#41; &#123;
            </div>
            <div className="pl-4">
              <span className="text-purple-400 font-semibold">const</span>{" "}
              <span className="text-slate-200">architecture</span> ={" "}
              <span className="text-purple-400 font-semibold">await</span>{" "}
              <span className="text-sky-300">engineerStack</span>&#40;&#123;
            </div>
            <div className="pl-8 text-slate-300">
              framework: <span className="text-emerald-300">&quot;Next.js 15 App Router&quot;</span>,
            </div>
            <div className="pl-8 text-slate-300">
              typeSafety: <span className="text-emerald-300">&quot;Strict TypeScript&quot;</span>,
            </div>
            <div className="pl-8 text-slate-300">
              performance: <span className="text-amber-300">100</span>, <span className="text-slate-500">&#47;&#47; Core Web Vitals Guaranteed</span>
            </div>
            <div className="pl-8 text-slate-300">
              features: &#91;
              <span className="text-sky-300">&quot;3D WebGL&quot;</span>,{" "}
              <span className="text-purple-300">&quot;QR Menus&quot;</span>,{" "}
              <span className="text-emerald-300">&quot;WhatsApp API&quot;</span>&#93;,
            </div>
            <div className="pl-4">&#125;&#41;;</div>
            <br />
            <div className="pl-4">
              <span className="text-purple-400 font-semibold">return</span>{" "}
              <span className="text-slate-200">architecture</span>.
              <span className="text-blue-400">deployToGlobalEdge</span>&#40;&#41;;
            </div>
            <div>&#125;</div>
            <div className="mt-2 text-sky-400 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-sky-400 animate-pulse" />
              <span className="text-[11px] text-slate-500">&#47;&#47; Ready to compile for your business</span>
            </div>
          </div>
        )}

        {activeTab === "terminal" && (
          <div className="space-y-2 text-slate-300">
            <div className="text-slate-500"># Production Deploy Pipeline</div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>$ git commit -m &quot;feat: deliver world-class client flagship&quot;</span>
            </div>
            <div className="text-slate-400">
              [main a8f9210] feat: deliver world-class client flagship
              <br />
              18 files changed, 1420 insertions(+)
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>$ npm run build</span>
            </div>
            <div className="text-sky-300">
              ▲ Next.js 15.5.29
              <br />
              ✓ Compiled successfully in 1.8s
              <br />
              ✓ Type checking &amp; security policies verified
              <br />
              ✓ 0 vulnerabilities found
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>$ npx edge-deploy --region=global</span>
            </div>
            <div className="text-emerald-300 font-bold">
              🚀 Deployed to 300+ edge POPs in 0.42s. Status: 200 OK.
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status bar */}
      <div className="px-4 py-2 bg-[#040711] border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            TypeScript 5.x
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-300">Next.js 15 App Router</span>
        </div>

        <div className="flex items-center gap-2 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Production Ready</span>
        </div>
      </div>
    </div>
  );
}
