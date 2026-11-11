"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowUp, 
  Mail, 
  ShieldCheck, 
  Globe, 
  Clock, 
  CheckCircle2, 
  Terminal,
  MessageSquare
} from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function Footer() {
  const { settings, getWhatsAppUrl } = useSiteSettings();
  const [timeIST, setTimeIST] = useState("");
  const [timeUTC, setTimeUTC] = useState("");

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setTimeIST(
        now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setTimeUTC(
        now.toLocaleTimeString("en-US", {
          timeZone: "UTC",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const whatsappHref = getWhatsAppUrl(
    `Hi ${settings.agency_name || "GJ Devloper"}, I visited your website and would like to discuss a web development project.`
  );
  const contactEmail = settings.contact_email || "contact@gjdevloper.com";
  const githubUrl = settings.social_github || "https://github.com";
  const twitterUrl = settings.social_twitter || "https://twitter.com";
  const linkedinUrl = settings.social_linkedin || "https://linkedin.com";

  return (
    <footer className="relative bg-[#02050e] border-t border-white/[0.08] pt-20 pb-12 overflow-hidden text-slate-300">
      {/* Background ambient gradient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-t from-blue-900/15 via-violet-900/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Tier: Brand & Big Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/[0.08]">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 p-[1.5px] shadow-[0_0_20px_rgba(56,189,248,0.35)]">
                <div className="w-full h-full bg-[#050918] rounded-[10px] flex items-center justify-center">
                  <span className="font-mono font-black text-lg bg-gradient-to-br from-sky-300 to-purple-400 bg-clip-text text-transparent">
                    GJ
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white">
                  {settings.agency_name || "GJ Devloper"}
                </span>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                  Professional Web Development Agency
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              {settings.footer_tagline ||
                "We design and engineer bespoke business websites, high-conversion e-commerce, restaurant & hotel portals, QR menus, and custom web applications for ambitious brands."}
            </p>

            <div className="flex items-center gap-3">
              {/* WhatsApp direct chat link */}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:text-white hover:bg-emerald-600 hover:border-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                aria-label="Direct WhatsApp Chat"
              >
                <MessageSquare className="w-4 h-4" />
              </a>

              {/* GitHub */}
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-900/70 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-sky-400/50 hover:bg-slate-800 transition-all"
                aria-label="GitHub Profile"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-900/70 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-sky-400/50 hover:bg-slate-800 transition-all"
                aria-label="X Profile"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-900/70 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-sky-400/50 hover:bg-slate-800 transition-all"
                aria-label="LinkedIn Profile"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* Email */}
              <a
                href={`mailto:${contactEmail}`}
                className="w-10 h-10 rounded-xl bg-slate-900/70 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-sky-400/50 hover:bg-slate-800 transition-all"
                aria-label="Email Agency"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>

            {/* Live Agency Status & Clocks */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md flex flex-col gap-2.5 max-w-md">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-sky-400" /> Agency Timezones:
                </span>
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 border-t border-white/5">
                <div>
                  <span className="text-slate-500">IST (HQ): </span>
                  <span className="text-slate-200 font-semibold">{timeIST || "Loading..."}</span>
                </div>
                <div>
                  <span className="text-slate-500">UTC: </span>
                  <span className="text-slate-200 font-semibold">{timeUTC || "Loading..."}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Links Column 1: Core Services */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Agency Services
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-slate-400">
              <li>
                <a href="#services" className="hover:text-sky-300 transition-colors">
                  Business Website Development
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-sky-300 transition-colors">
                  E-Commerce Storefronts
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-sky-300 transition-colors">
                  Restaurant Websites & Menus
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-sky-300 transition-colors">
                  Hotel Direct Booking Websites
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-sky-300 transition-colors">
                  Restaurant Management / POS
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-sky-300 transition-colors">
                  QR Code Digital Menu Systems
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Navigation & Company */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Agency & Links
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
              <li>
                <a href="#projects" className="hover:text-sky-300 transition-colors">
                  Sample Project Showcase
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-sky-300 transition-colors">
                  Get a Quote
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-sky-300 transition-colors">
                  Contact & Inquiry Page
                </Link>
              </li>
              <li>
                <a href="#estimator" className="hover:text-sky-300 transition-colors">
                  Project Cost Calculator
                </a>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-sky-300 transition-colors text-slate-500 hover:text-slate-300 flex items-center gap-1.5 font-mono text-xs">
                  <span>🔒 Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Security */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Engineering Guarantee
            </h4>
            <div className="flex flex-col gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Code Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Mutual NDA Standard</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Global Deployment</span>
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Next.js 15 & TypeScript</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tier: Copyright & Back To Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <p>© {new Date().getFullYear()} GJ Devloper. All Rights Reserved. Sample concepts are clearly marked for illustration.</p>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-slate-300 transition-colors">
              Contact
            </Link>
            <Link href="/admin/login" className="hover:text-slate-300 transition-colors">
              Admin
            </Link>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
              aria-label="Back to top of page"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
