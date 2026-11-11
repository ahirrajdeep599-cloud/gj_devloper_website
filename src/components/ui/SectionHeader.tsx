import React from "react";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  badge?: string;
  badgeVariant?: "primary" | "secondary" | "electric" | "violet" | "emerald";
  title: string;
  highlightedText?: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export default function SectionHeader({
  badge,
  badgeVariant = "electric",
  title,
  highlightedText,
  subtitle,
  align = "center",
  className,
}: SectionHeaderProps) {
  const alignmentStyles = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  };

  return (
    <div
      className={cn(
        "flex flex-col max-w-3xl mb-12 md:mb-16",
        alignmentStyles[align],
        className
      )}
    >
      {badge && (
        <div className="mb-4">
          <Badge variant={badgeVariant}>{badge}</Badge>
        </div>
      )}

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
        {title}{" "}
        {highlightedText && (
          <span className="text-gradient-electric">{highlightedText}</span>
        )}
      </h2>

      {subtitle && (
        <p className="mt-4 text-base sm:text-lg text-slate-400 font-normal leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
