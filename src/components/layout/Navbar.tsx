"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, ShoppingBag } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";

interface NavbarProps {
  onOpenContactModal?: () => void;
}

export default function Navbar({}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { settings } = useSiteSettings();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", href: "/#about" },
    { name: "Services", href: "/#services" },
    { name: "Store", href: "/store" },
    { name: "Work", href: "/#projects" },
    { name: "Why Us", href: "/#why-us" },
    { name: "Process", href: "/#process" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Estimator", href: "/#estimator" },
    { name: "Contact", href: "/#contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "py-3 bg-[#030712]/80 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg"
              aria-label="GJ Devloper Home"
            >
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 p-[1.5px] shadow-[0_0_20px_rgba(56,189,248,0.35)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all duration-300">
                <div className="w-full h-full bg-[#050918] rounded-[10px] flex items-center justify-center">
                  <span className="font-mono font-black text-lg tracking-tighter bg-gradient-to-br from-sky-300 to-purple-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                    GJ
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  {settings.agency_name || "GJ Devloper"}
                  <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8] animate-pulse" />
                </span>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase -mt-0.5">
                  Digital Engineering Agency
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 px-4 py-1.5 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/[0.08] shadow-inner">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-3 py-1.5 text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-full transition-all duration-200"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Cart Icon & Availability Pill & Action Button */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Shopping Cart Button */}
              <Link
                href="/cart"
                className="relative p-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-slate-300 hover:text-white hover:border-sky-500/40 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sky-400"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5 text-sky-400" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 text-slate-950 font-mono text-[10px] font-black flex items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.7)] animate-bounce">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>

              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Available Q2/Q3</span>
              </div>

              <Link href="/#contact" className="hidden md:inline-block">
                <Button
                  variant="electric"
                  size="sm"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="rounded-full shadow-md"
                >
                  Start Project
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-900/60 border border-white/10 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-20 right-4 left-4 p-6 bg-[#080d22]/95 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Navigation
              </span>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Taking Projects</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  {link.name}
                </a>
              ))}

              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 font-mono text-sm font-bold mt-2"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-sky-400" />
                  <span>Shopping Cart</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-sky-400 text-slate-950 text-xs font-black">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </Link>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full"
              >
                <Button variant="electric" size="md" className="w-full">
                  Start Your Project
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
