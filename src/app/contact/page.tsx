"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackgroundParticles from "@/components/3d/BackgroundParticles";
import SectionHeader from "@/components/ui/SectionHeader";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import { formatWhatsAppInquiryMessage, getWhatsAppDirectUrl } from "@/lib/whatsapp";
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  ExternalLink,
  HelpCircle
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    whatsappNumber: "",
    websiteType: "Business Website Development",
    budget: "$1,000 - $3,000",
    projectDescription: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastWaUrl, setLastWaUrl] = useState("");

  const websiteTypes = [
    "Business Website Development",
    "E-commerce Website",
    "Restaurant Website",
    "Hotel Website",
    "Portfolio Website",
    "Landing Page Development",
    "Custom Web Applications",
    "Restaurant Management Systems",
    "Digital Menu & QR Code Systems",
    "Website Redesign & Maintenance",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const message = formatWhatsAppInquiryMessage({
      customerName: formData.name,
      whatsappNumber: formData.whatsappNumber,
      websiteType: formData.websiteType,
      budget: formData.budget,
      projectDescription: formData.projectDescription,
      serviceName: formData.websiteType,
      source: "Contact Page Portal",
    });

    const url = getWhatsAppDirectUrl(message);
    setLastWaUrl(url);

    try {
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.name,
          whatsappNumber: formData.whatsappNumber,
          websiteType: formData.websiteType,
          budget: formData.budget,
          projectDescription: formData.projectDescription,
        }),
      });
    } catch (err) {
      console.warn("Failed recording locally:", err);
    }

    setIsSubmitting(false);
    setSubmitted(true);

    if (typeof window !== "undefined") {
      import("canvas-confetti").then((module) => {
        const confettiFn = module.default;
        confettiFn({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#10b981", "#38bdf8", "#818cf8"],
        });
      });
    }

    window.open(url, "_blank");
  };

  const faqs = [
    {
      q: "How fast can my website be launched?",
      a: "Standard business websites and landing pages are typically delivered within 1 to 3 weeks. Complex custom web applications and restaurant management systems take 3 to 6 weeks.",
    },
    {
      q: "Do I get full ownership of the source code?",
      a: "Yes, 100%. Upon project completion and final milestone sign-off, full repository access and intellectual property rights are transferred to you.",
    },
    {
      q: "Can I connect my own WhatsApp Business number for customer orders?",
      a: "Absolutely. We configure custom WhatsApp order routing, QR table ordering, and optional Meta WhatsApp Cloud API webhooks directly to your company phone.",
    },
    {
      q: "Do you offer post-launch maintenance & security?",
      a: "Yes! We provide 30 days of complimentary post-launch hypercare with every build, plus flexible monthly retainers for continuous speed, backups, and feature upgrades.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 overflow-x-hidden">
      <BackgroundParticles />
      <Navbar />
      <FloatingWhatsApp />

      <main className="pt-32 pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <SectionHeader
            badge="Contact Desk & Inquiries"
            badgeVariant="electric"
            title="Connect With"
            highlightedText="GJ Devloper."
            subtitle="Whether you need an online food menu, a luxury hotel booking site, an e-commerce platform, or a bespoke web application—we are ready."
          />

          {/* Contact Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
            {/* Left: Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-2xl">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-2">
                  Official Communication Channels
                </span>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Direct Agency Access
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Skip the agency bureaucracy. Message our lead development engineers directly for technical scoping, estimates, or design reviews.
                </p>

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <a
                    href={getWhatsAppDirectUrl("Hi GJ Devloper, I'm reaching out from the contact page.")}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between hover:bg-emerald-500/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-mono text-emerald-300 font-bold">
                          WhatsApp Priority Line
                        </div>
                        <div className="text-sm font-semibold text-white">
                          Click to Chat Instant
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                  </a>

                  <a
                    href="mailto:contact@gjdevloper.com"
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between hover:border-sky-500/40 hover:bg-slate-900 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-mono text-slate-400">
                          Official Email
                        </div>
                        <div className="text-sm font-semibold text-white">
                          contact@gjdevloper.com
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>

                <div className="pt-6 border-t border-white/10 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Average reply time: Under 15 minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Strict confidentiality &amp; NDA standard</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-7">
              <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-2xl shadow-2xl">
                {submitted ? (
                  <div className="py-10 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Inquiry Logged &amp; WhatsApp Generated!
                    </h3>
                    <p className="text-sm text-slate-300 max-w-md mb-6">
                      Your inquiry has been stored in our system and opened in WhatsApp. Click below if you need to re-open the message thread:
                    </p>
                    {lastWaUrl && (
                      <a
                        href={lastWaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 mb-4"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Open WhatsApp Conversation</span>
                      </a>
                    )}
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-xs text-slate-400 hover:text-white underline"
                    >
                      Fill another inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Submit Your Project Parameters
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2 font-medium">
                          Customer / Business Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Your Name or Company"
                          className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2 font-medium">
                          WhatsApp Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.whatsappNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, whatsappNumber: e.target.value })
                          }
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2 font-medium">
                          Required Website Type
                        </label>
                        <select
                          value={formData.websiteType}
                          onChange={(e) =>
                            setFormData({ ...formData, websiteType: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white focus:outline-none focus:border-emerald-400 text-sm"
                        >
                          {websiteTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2 font-medium">
                          Target Budget
                        </label>
                        <select
                          value={formData.budget}
                          onChange={(e) =>
                            setFormData({ ...formData, budget: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white focus:outline-none focus:border-emerald-400 text-sm"
                        >
                          <option value="Under $1,000">Under $1,000</option>
                          <option value="$1,000 - $3,000">$1,000 - $3,000 (Recommended)</option>
                          <option value="$3,000 - $6,000">$3,000 - $6,000</option>
                          <option value="$6,000+">$6,000+ (Enterprise)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2 font-medium">
                        Project Scope &amp; Vision *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.projectDescription}
                        onChange={(e) =>
                          setFormData({ ...formData, projectDescription: e.target.value })
                        }
                        placeholder="Tell us what you want to achieve, any specific features like QR menus or online payments, reference sites, and your target deadline..."
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 text-sm resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-[0_10px_25px_-5px_rgba(16,185,129,0.5)] cursor-pointer"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>{isSubmitting ? "Processing..." : "Submit Inquiry & Open WhatsApp"}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Client FAQ */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-extrabold text-white text-center mb-8">
              Frequently Asked Questions
            </h3>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl"
                >
                  <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-sky-400" />
                    <span>{faq.q}</span>
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
