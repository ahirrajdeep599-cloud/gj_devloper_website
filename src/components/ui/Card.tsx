import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "glass" | "solid" | "glow" | "subtle";
  hoverEffect?: boolean;
  className?: string;
}

export default function Card({
  children,
  variant = "glass",
  hoverEffect = true,
  className,
  ...props
}: CardProps) {
  const variantStyles = {
    glass:
      "bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] shadow-[0_16px_32px_-8px_rgba(0,0,0,0.5)]",
    solid:
      "bg-[#070d1e] border border-slate-800 shadow-xl",
    glow:
      "bg-gradient-to-b from-slate-900/70 to-[#0a122c]/80 backdrop-blur-xl border border-sky-500/20 shadow-[0_0_30px_rgba(56,189,248,0.1)]",
    subtle:
      "bg-white/[0.02] backdrop-blur-md border border-white/[0.05]",
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-6 sm:p-8 transition-all duration-300 relative overflow-hidden group",
        variantStyles[variant],
        hoverEffect &&
          "hover:border-sky-500/40 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,102,255,0.25)]",
        className
      )}
      {...props}
    >
      {/* Subtle corner light highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-400/10 via-transparent to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      {children}
    </div>
  );
}
