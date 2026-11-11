import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "electric" | "violet" | "emerald";
  className?: string;
  hasDot?: boolean;
}

export default function Badge({
  children,
  variant = "primary",
  className,
  hasDot = true,
}: BadgeProps) {
  const variantStyles = {
    primary: "bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
    secondary: "bg-white/5 border-white/10 text-slate-300",
    electric: "bg-sky-500/10 border-sky-400/25 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.2)]",
    violet: "bg-purple-500/10 border-purple-400/25 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.2)]",
    emerald: "bg-emerald-500/10 border-emerald-400/25 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
  };

  const dotStyles = {
    primary: "bg-blue-400 shadow-[0_0_8px_#38bdf8]",
    secondary: "bg-slate-400",
    electric: "bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse",
    violet: "bg-purple-400 shadow-[0_0_8px_#a855f7] animate-pulse",
    emerald: "bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase border backdrop-blur-md transition-all",
        variantStyles[variant],
        className
      )}
    >
      {hasDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", dotStyles[variant])} />
      )}
      <span>{children}</span>
    </div>
  );
}
