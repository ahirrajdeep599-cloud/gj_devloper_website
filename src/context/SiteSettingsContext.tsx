"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface PricingPlan {
  id: string;
  name: string;
  subtitle?: string;
  price: string;
  price_label?: string;
  category?: string;
  badge?: string;
  description?: string;
  features: string[];
  whatsapp_preset?: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order?: number;
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  category: string;
  short_description: string;
  deliverables: string[];
  starting_price: string;
  icon_type: string;
  badge: string;
  whatsapp_preset: string;
  gradient?: string;
  is_active?: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  clientBadge: string;
  serviceCategory: string;
  isSample: boolean;
  sampleNotice: string;
  summary: string;
  description: string;
  challenge?: string;
  solution?: string;
  metrics: { value: string; label: string }[];
  techStack: string[];
  gradient: string;
  accentColor?: string;
  previewMockupType: string;
  demoUrl?: string;
  whatsappPrompt: string;
}

interface SiteSettingsContextType {
  settings: Record<string, string>;
  whatsappNumber: string;
  pricingPlans: PricingPlan[];
  services: ServiceItem[];
  projects: PortfolioItem[];
  getWhatsAppUrl: (message: string) => string;
  refreshSettings: () => Promise<void>;
  loading: boolean;
}

const fallbackSettings: Record<string, string> = {
  whatsapp_number: "919876543210",
  whatsapp_country_code: "+91",
  contact_email: "contact@gjdevloper.com",
  contact_phone: "+91 98765 43210",
  agency_name: "GJ Devloper",
  hero_heading: "WE CODE. WE CREATE. WE BUILD DIGITAL EXPERIENCES.",
  hero_subtitle: "From creative ideas to powerful digital solutions, GJ Devloper transforms businesses through modern web development.",
  about_heading: "MORE THAN JUST A WEBSITE. WE BUILD DIGITAL SOLUTIONS.",
  about_description: "At GJ Devloper, we believe modern businesses deserve more than cookie-cutter templates that slow down browsers and fail to convert. We are a specialized web development studio focused on crafting high-performance, responsive, and functional digital experiences.",
  cta_heading: "Have an Idea? Let's Build It!",
  cta_subtitle: "From initial sketch to high-speed digital reality, let's bring your vision to life.",
  footer_tagline: "We design and engineer bespoke business websites, high-conversion e-commerce, restaurant & hotel portals, QR menus, and custom web applications for ambitious brands.",
  social_github: "https://github.com",
  social_twitter: "https://twitter.com",
  social_linkedin: "https://linkedin.com",
  social_instagram: "https://instagram.com",
};

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: fallbackSettings,
  whatsappNumber: "919876543210",
  pricingPlans: [],
  services: [],
  projects: [],
  getWhatsAppUrl: () => "",
  refreshSettings: async () => {},
  loading: true,
});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Record<string, string>>(fallbackSettings);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [projects, setProjects] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    try {
      // 1. Fetch Settings
      const resSettings = await fetch("/api/settings");
      if (resSettings.ok) {
        const data = await resSettings.json();
        if (data.settings && Object.keys(data.settings).length > 0) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      }

      // 2. Fetch Pricing Plans
      const resPricing = await fetch("/api/pricing");
      if (resPricing.ok) {
        const data = await resPricing.json();
        if (data.plans && data.plans.length > 0) {
          setPricingPlans(data.plans);
        }
      }

      // 3. Fetch Services
      const resServices = await fetch("/api/services");
      if (resServices.ok) {
        const data = await resServices.json();
        if (data.services && data.services.length > 0) {
          setServices(data.services);
        }
      }

      // 4. Fetch Portfolio
      const resPortfolio = await fetch("/api/portfolio");
      if (resPortfolio.ok) {
        const data = await resPortfolio.json();
        if (data.projects && data.projects.length > 0) {
          setProjects(data.projects);
        }
      }
    } catch (err) {
      console.warn("Using offline fallback settings for initial render:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const whatsappNumber = settings.whatsapp_number || "919876543210";

  const getWhatsAppUrl = useCallback(
    (message: string): string => {
      const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");
      const encoded = encodeURIComponent(message);
      return `https://wa.me/${cleanPhone}?text=${encoded}`;
    },
    [whatsappNumber]
  );

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        whatsappNumber,
        pricingPlans,
        services,
        projects,
        getWhatsAppUrl,
        refreshSettings: fetchAllData,
        loading,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
