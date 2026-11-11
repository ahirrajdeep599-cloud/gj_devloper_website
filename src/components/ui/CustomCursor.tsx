"use client";

import React, { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);

  useEffect(() => {
    // 1. Detect if touch device or reduced motion is preferred
    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (isTouchDevice || prefersReducedMotion) {
      return; // Do not render on touch or reduced-motion
    }

    setIsVisible(true);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Detect hover target
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        "a, button, input, select, textarea, [role='button'], .cursor-pointer"
      );

      const isCard = target.closest(".glass-card, [data-cursor-label]");

      if (isCard) {
        setIsHovered(true);
        const label = (isCard as HTMLElement).getAttribute("data-cursor-label") || "EXPLORE";
        setHoverLabel(label);
      } else if (interactive) {
        setIsHovered(true);
        setHoverLabel(null);
      } else {
        setIsHovered(false);
        setHoverLabel(null);
      }
    };

    const handleMouseLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      if (dotRef.current) dotRef.current.style.opacity = "1";
      if (ringRef.current) ringRef.current.style.opacity = "1";
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // Smooth inertia lerp for the glowing outer ring
    const render = () => {
      const ease = 0.18; // smooth follow speed
      ringX += (mouseX - ringX) * ease;
      ringY += (mouseY - ringY) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none">
      {/* Outer Glowing Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-[width,height,background-color,border-color] duration-300 ease-out flex items-center justify-center ${
          hoverLabel
            ? "w-20 h-20 bg-sky-500/20 border border-sky-400/80 backdrop-blur-sm shadow-[0_0_30px_rgba(56,189,248,0.4)]"
            : isHovered
            ? "w-14 h-14 bg-sky-400/15 border border-sky-400/60 shadow-[0_0_20px_rgba(56,189,248,0.35)]"
            : "w-8 h-8 border border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]"
        }`}
      >
        {hoverLabel && (
          <span className="text-[9px] font-mono font-bold tracking-widest text-sky-200 uppercase animate-in fade-in zoom-in-75 duration-200">
            {hoverLabel}
          </span>
        )}
      </div>

      {/* Small Inner Sharp Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-[transform,opacity] duration-75 ${
          hoverLabel
            ? "w-1 h-1 bg-sky-300 opacity-40"
            : isHovered
            ? "w-1.5 h-1.5 bg-sky-300 shadow-[0_0_8px_#38bdf8]"
            : "w-2 h-2 bg-gradient-to-r from-sky-400 to-violet-400 shadow-[0_0_6px_#38bdf8]"
        }`}
      />
    </div>
  );
}
