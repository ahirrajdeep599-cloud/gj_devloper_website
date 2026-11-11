"use client";

import React, { useState } from "react";
import { MessageSquare, X, Send, CheckCircle2 } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function FloatingWhatsApp() {
  const { settings, getWhatsAppUrl } = useSiteSettings();
  const agencyName = settings.agency_name || "GJ Devloper";
  const [isOpen, setIsOpen] = useState(false);
  const [quickService, setQuickService] = useState("Business Website Development");
  const [clientName, setClientName] = useState("");
  const [quickNote, setQuickNote] = useState("");

  const services = [
    "Business Website Development",
    "E-commerce Website",
    "Restaurant Website",
    "Hotel Website",
    "Portfolio Website",
    "Custom Web Applications",
    "Digital Menu & QR Codes",
  ];

  const handleLaunchWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `🚀 *WHATSAPP FAST CHAT — GJ DEVLOPER*
────────────────────────
👤 *Name:* ${clientName.trim() || "Visitor"}
🎯 *Interested Service:* ${quickService}
${quickNote ? `📝 *Note:* ${quickNote}\n` : ""}────────────────────────
Hi GJ Devloper, I'm reaching out from your website to get a quote!`;

    const url = getWhatsAppUrl(message);
    window.open(url, "_blank");
    setIsOpen(false);
  };

  const defaultDirectUrl = getWhatsAppUrl(
    `Hi ${agencyName}, I'm visiting your website and would like to inquire about your web development services.`
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Quick Chat Card */}
      {isOpen && (
        <div className="mb-4 w-[320px] sm:w-[360px] rounded-3xl bg-[#070e24] border border-emerald-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-white/20 p-1 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#070e24]" />
              </div>
              <div>
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  <span>{agencyName}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                </h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />
                  Typically replies in 5 mins
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              aria-label="Close WhatsApp chat prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleLaunchWhatsApp} className="p-4 space-y-3.5">
            <p className="text-xs text-slate-300">
              Welcome! Let us know what you need and we will connect with you on WhatsApp immediately:
            </p>

            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Your Name
              </label>
              <input
                type="text"
                placeholder="E.g. Alexander Smith"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Select Service
              </label>
              <select
                value={quickService}
                onChange={(e) => setQuickService(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                {services.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Brief Note (Optional)
              </label>
              <input
                type="text"
                placeholder="E.g. Need launch by next month"
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open Direct WhatsApp Chat</span>
            </button>

            <div className="text-center">
              <a
                href={defaultDirectUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors underline"
              >
                Or skip form &amp; start blank chat →
              </a>
            </div>
          </form>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <div className="relative group">
        {/* Tooltip on hover */}
        {!isOpen && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-white text-xs whitespace-nowrap shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Chat on WhatsApp</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.45)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-300/40"
          aria-label="Open WhatsApp conversation"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageSquare className="w-6 h-6 fill-current" />
          )}

          {/* Ambient Glow Pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-ping pointer-events-none -z-10" />
        </button>
      </div>
    </div>
  );
}
