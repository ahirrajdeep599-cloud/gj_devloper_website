"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "electric" | "glass" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  glow?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  icon,
  iconPosition = "right",
  glow = false,
  ...props
}: ButtonProps) {
  const sizeStyles = {
    sm: "px-4 py-2 text-xs font-semibold rounded-lg gap-1.5",
    md: "px-6 py-3 text-sm font-semibold rounded-xl gap-2",
    lg: "px-7 py-3.5 text-base font-semibold rounded-xl gap-2.5",
    xl: "px-8 py-4 text-base md:text-lg font-bold rounded-2xl gap-3",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] border border-blue-400/30 hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.6)] active:scale-[0.98]",
    electric:
      "bg-gradient-to-r from-sky-400 via-blue-600 to-violet-600 hover:from-sky-300 hover:via-blue-500 hover:to-violet-500 text-white shadow-[0_0_30px_rgba(56,189,248,0.35)] border border-white/20 active:scale-[0.98]",
    secondary:
      "bg-white/10 hover:bg-white/15 text-white border border-white/15 backdrop-blur-md hover:border-white/25 active:scale-[0.98]",
    glass:
      "bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 hover:text-white border border-white/10 hover:border-sky-500/40 backdrop-blur-xl shadow-lg active:scale-[0.98]",
    outline:
      "bg-transparent hover:bg-sky-500/10 text-sky-400 hover:text-sky-300 border border-sky-500/30 hover:border-sky-400/60 active:scale-[0.98]",
    ghost:
      "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border-transparent",
  };

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center transition-all duration-300 cursor-pointer select-none group overflow-hidden font-medium",
        sizeStyles[size],
        variantStyles[variant],
        glow && "relative before:absolute before:-inset-1 before:bg-gradient-to-r before:from-blue-600 before:to-violet-600 before:rounded-2xl before:blur-lg before:opacity-50 before:group-hover:opacity-100 before:transition before:duration-500 before:-z-10",
        className
      )}
      {...props}
    >
      {/* Subtle shine sweep effect on hover */}
      <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />

      {icon && iconPosition === "left" && (
        <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
          {icon}
        </span>
      )}

      <span className="relative z-10 flex items-center gap-2">{children}</span>

      {icon && iconPosition === "right" && (
        <span className="transition-transform duration-300 group-hover:translate-x-0.5">
          {icon}
        </span>
      )}
    </button>
  );
}
