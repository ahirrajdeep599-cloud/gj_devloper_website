"use client";

import React, { useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { formatWhatsAppInquiryMessage } from "@/lib/whatsapp";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ExternalLink
} from "lucide-react";

interface ContactSectionProps {
  initialMessage?: string;
  initialService?: string;
}

export default function ContactSection({ 
  initialMessage = "",
  initialService = "Business Website Development"
}: ContactSectionProps) {
  const { settings, getWhatsAppUrl } = useSiteSettings();
  const contactEmail = settings.contact_email || "contact@gjdevloper.com";
  const agencyName = settings.agency_name || "GJ Devloper";
  const [formData, setFormData] = useState({
    name: "",
    whatsappNumber: "",
    websiteType: initialService,
    budget: "$1,000 - $3,000",
    projectDescription: initialMessage,
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedWhatsAppUrl, setLastSubmittedWhatsAppUrl] = useState("");

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

  const budgetOptions = [
    "Under $1,000",
    "$1,000 - $3,000 (Recommended Starter)",
    "$3,000 - $6,000 (Comprehensive)",
    "$6,000+ (Enterprise System)",
  ];

  // Sync initialMessage when prop changes
  React.useEffect(() => {
    if (initialMessage) {
      setFormData((prev) => ({
        ...prev,
        projectDescription: prev.projectDescription
          ? `${prev.projectDescription}\n\n[Configurator Estimate]: ${initialMessage}`
          : initialMessage,
      }));
    }
  }, [initialMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Format the WhatsApp text
    const formattedMessage = formatWhatsAppInquiryMessage({
      customerName: formData.name,
      whatsappNumber: formData.whatsappNumber,
      websiteType: formData.websiteType,
      budget: formData.budget,
      projectDescription: formData.projectDescription,
      serviceName: formData.websiteType,
      source: "GJ Devloper Inquiry Portal",
    });

    const waDirectUrl = getWhatsAppUrl(formattedMessage);
    setLastSubmittedWhatsAppUrl(waDirectUrl);

    try {
      // Post to our SQLite database & Cloud API handler
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
      console.warn("Local DB recording error, proceeding with direct WhatsApp launch:", err);
    }

    setIsSubmitting(false);
    setSubmitted(true);

    // Trigger celebratory confetti dynamically on client only
    if (typeof window !== "undefined") {
      import("canvas-confetti").then((module) => {
        const confettiFn = module.default;
        confettiFn({
          particleCount: 110,
          spread: 75,
          origin: { y: 0.6 },
          colors: ["#10b981", "#38bdf8", "#a855f7", "#00f0ff"],
        });
      });
    }

    // Automatically open WhatsApp in new tab
    window.open(waDirectUrl, "_blank");
  };

  return (
    <section id="contact" className="relative py-28 bg-[#02050f] border-t border-white/[0.08] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="ambient-glow-blue top-1/3 right-[-15%]" />
      <div className="ambient-glow-violet bottom-10 left-[-15%]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badge="Direct Project Inquiries"
          badgeVariant="electric"
          title="Start Your Project With"
          highlightedText="GJ Devloper."
          subtitle="Submit your requirements below. Our system records your inquiry into our secure pipeline and connects you directly to our WhatsApp priority desk."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Agency Channels & Guarantees */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Direct WhatsApp Hotline
              </span>
              <h3 className="text-2xl font-bold text-white mb-4">
                Fast Answers. Transparent Quotes.
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Prefer immediate messaging? Our team reviews project scopes over WhatsApp every day. We provide honest technical advice, timeline estimates, and budget recommendations.
              </p>

              <div className="space-y-3.5 pt-4 border-t border-white/10 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Rapid response within 5 to 30 minutes</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Confidential inquiries &amp; NDA protection</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Free architecture consultation &amp; quote</span>
                </div>
              </div>
            </div>

            {/* Direct Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={getWhatsAppUrl(`Hi ${agencyName}, I would like to speak with an engineer about a website project.`)}
                target="_blank"
                rel="noreferrer"
                className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 transition-all group shadow-[0_0_20px_rgba(16,185,129,0.15)]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:bg-black/20 group-hover:text-black">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono text-emerald-300 group-hover:text-slate-900 font-bold">
                    WhatsApp Chat
                  </span>
                </div>
                <span className="text-sm font-semibold text-white group-hover:text-slate-950 block">
                  {settings.contact_phone || "Click to Chat Now →"}
                </span>
              </a>

              <a
                href={`mailto:${contactEmail}`}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-sky-500/40 hover:bg-slate-900/60 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">Direct Email</span>
                </div>
                <span className="text-sm font-semibold text-white group-hover:text-sky-300">
                  {contactEmail}
                </span>
              </a>
            </div>
          </div>

          {/* Right Column: Project Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-2xl shadow-2xl relative">
              {submitted ? (
                <div className="py-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                    Inquiry Generated &amp; Saved!
                  </h3>
                  <p className="text-slate-300 max-w-md text-sm leading-relaxed mb-6">
                    Your project details have been logged in our system. WhatsApp should have opened in a new tab. If it did not open automatically, click the button below to start the conversation:
                  </p>
                  
                  {lastSubmittedWhatsAppUrl && (
                    <a
                      href={lastSubmittedWhatsAppUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mb-6 inline-flex"
                    >
                      <button
                        type="button"
                        className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Open WhatsApp Message Now</span>
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </button>
                    </a>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSubmitted(false)}
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Customer Name & WhatsApp Phone */}
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
                        placeholder="E.g. Elena Rostova / Lumina Hotels"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-sm transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2 font-medium">
                        WhatsApp Number * (With Country Code)
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.whatsappNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, whatsappNumber: e.target.value })
                        }
                        placeholder="+91 98765 43210 / +1 555 123 4567"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Required Website Type & Budget */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2 font-medium">
                        Required Website / System Type *
                      </label>
                      <select
                        value={formData.websiteType}
                        onChange={(e) =>
                          setFormData({ ...formData, websiteType: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-sm transition-all"
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
                        Estimated Budget Bracket
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) =>
                          setFormData({ ...formData, budget: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-sm transition-all"
                      >
                        {budgetOptions.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Project Description */}
                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2 font-medium">
                      Project Description &amp; Specific Requirements *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.projectDescription}
                      onChange={(e) =>
                        setFormData({ ...formData, projectDescription: e.target.value })
                      }
                      placeholder="Share details about what you need: target audience, desired features (e.g. QR menus, WhatsApp ordering, reservations, CRM sync), launch timeline..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-sm transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-[0_10px_25px_-5px_rgba(16,185,129,0.5)] cursor-pointer"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>
                      {isSubmitting ? "Generating WhatsApp Transmission..." : "Submit Inquiry & Open WhatsApp"}
                    </span>
                  </button>

                  <div className="text-center text-[11px] font-mono text-slate-500">
                    🔒 Automatically saved to GJ Devloper CRM • Opens WhatsApp pre-formatted • Mutual NDA Guaranteed
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
