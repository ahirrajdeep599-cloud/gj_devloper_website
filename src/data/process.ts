import { ProcessStep } from "@/types";

export const processStepsData: ProcessStep[] = [
  {
    step: "01",
    title: "Deep Discovery & Technical Blueprint",
    duration: "Week 1",
    description: "We deconstruct your business goals, target audience psychology, conversion funnels, and technical requirements to formulate a bulletproof architecture map.",
    deliverables: [
      "Technical Architecture & System Flow",
      "Competitive Edge & UX Benchmark Audit",
      "Core User Journey Mapping",
      "Technology Stack & Milestone Roadmap",
    ],
    icon: "Compass",
  },
  {
    step: "02",
    title: "High-Fidelity 3D & UI/UX Prototyping",
    duration: "Week 2 - 3",
    description: "We craft an extraordinary, bespoke visual identity—from dark-mode aesthetic nuances to fluid 3D prototypes, micro-interactions, and responsive design systems.",
    deliverables: [
      "Interactive Figma Design System & Prototypes",
      "3D Asset Previews & Motion Storyboards",
      "Mobile & Desktop Responsive Wireframes",
      "Design Review & Stakeholder Alignment",
    ],
    icon: "Sparkles",
  },
  {
    step: "03",
    title: "Precision Engineering & 3D Integration",
    duration: "Week 3 - 5",
    description: "We translate approved designs into clean, modular, and type-safe Next.js code. WebGL shaders, server actions, APIs, and responsive layouts are meticulously built.",
    deliverables: [
      "Next.js 15 & TypeScript Implementation",
      "Optimized 60 FPS Three.js Canvas Scenes",
      "Sub-second Database & Backend Integrations",
      "Security Audits & Unit / Integration Tests",
    ],
    icon: "Code2",
  },
  {
    step: "04",
    title: "Optimization, Global CDN & Launch",
    duration: "Week 5 - 6",
    description: "We subject the build to rigorous multi-device testing, stress tests, and Google Lighthouse 100 audits before orchestrating a zero-downtime global rollout.",
    deliverables: [
      "100/100 Core Web Vitals Benchmark Guarantee",
      "Global CDN & Edge Routing Deployment",
      "Technical SEO & Rich Schema Submission",
      "30-Day Post-Launch Hypercare & Guarantee",
    ],
    icon: "Rocket",
  },
];
