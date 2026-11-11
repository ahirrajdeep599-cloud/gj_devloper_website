"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackgroundParticles from "@/components/3d/BackgroundParticles";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import HeroSection from "@/components/sections/HeroSection";
import TrustedSection from "@/components/sections/TrustedSection";
import AboutSection from "@/components/sections/AboutSection";
import ServicesSection from "@/components/sections/ServicesSection";
import BuiltWithCodeSection from "@/components/sections/BuiltWithCodeSection";
import WhyUsSection from "@/components/sections/WhyUsSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ProcessSection from "@/components/sections/ProcessSection";
import TechStackSection from "@/components/sections/TechStackSection";
import PricingSection from "@/components/sections/PricingSection";
import ProjectEstimatorSection from "@/components/sections/ProjectEstimatorSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ContactSection from "@/components/sections/ContactSection";

export default function HomePage() {
  const [inquiryPrefill, setInquiryPrefill] = useState("");

  const handleApplyEstimate = (summary: string) => {
    setInquiryPrefill(summary);
  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 overflow-x-hidden selection:bg-sky-500/30 selection:text-white">
      {/* Global Background Ambient Particles */}
      <BackgroundParticles />

      {/* Floating WhatsApp Quick Connect Button */}
      <FloatingWhatsApp />

      {/* Global Sticky Navigation */}
      <Navbar />

      <main className="relative z-10">
        {/* Hero Section with Interactive 3D Sphere */}
        <HeroSection />

        {/* 1. Trusted Digital Solutions */}
        <TrustedSection />

        {/* About GJ Devloper Studio */}
        <AboutSection />

        {/* 2. Our Services (10 Flagship Offerings) */}
        <ServicesSection />

        {/* 3. Built With Code. Powered by Creativity. */}
        <BuiltWithCodeSection />

        {/* 4. Why Choose Us (The GJ Standard) */}
        <WhyUsSection />

        {/* 5. Featured Projects & Interactive Sample Showcases */}
        <ProjectsSection />

        {/* 6. Our Working Process (4-Phase Protocol) */}
        <ProcessSection />

        {/* 7. Technologies We Use (Tech Radar) */}
        <TechStackSection />

        {/* 8. Conversion-Focused Pricing (₹1,999 / ₹4,999 / ₹9,999) */}
        <PricingSection />

        {/* 9. Interactive Scope & Cost Estimator */}
        <ProjectEstimatorSection onApplyEstimate={handleApplyEstimate} />

        {/* 10. Client Feedback Concepts */}
        <TestimonialsSection />

        {/* 11. Contact CTA & Direct WhatsApp Inquiry */}
        <ContactSection initialMessage={inquiryPrefill} />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
