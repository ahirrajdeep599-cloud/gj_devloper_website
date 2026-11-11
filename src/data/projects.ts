export interface PortfolioSampleProject {
  id: string;
  title: string;
  clientBadge: string;
  serviceCategory: "Restaurant & QR" | "Hotel & Hospitality" | "E-Commerce" | "Custom Web Apps" | "Brand Portfolios";
  isSample: boolean;
  sampleNotice: string;
  summary: string;
  description: string;
  challenge: string;
  solution: string;
  metrics: { value: string; label: string }[];
  techStack: string[];
  gradient: string;
  accentColor: string;
  previewMockupType: "restaurant" | "hotel" | "ecommerce" | "pos" | "webapp" | "portfolio";
  whatsappPrompt: string;
}

export const sampleProjectsData: PortfolioSampleProject[] = [
  {
    id: "apex-fine-dining",
    title: "Apex Culinary & Sky Lounge",
    clientBadge: "Sample Concept Showcase",
    serviceCategory: "Restaurant & QR",
    isSample: true,
    sampleNotice: "Demonstration Project Architecture by GJ Devloper",
    summary: "Luxury dining flagship with interactive digital QR food menu, table reservation engine, and instant WhatsApp food order routing.",
    description: "Architected to solve long waiter wait-times and physical menu print costs. Features an ultra-fast digital menu with allergen filters, chef specials, and direct table checkout.",
    challenge: "Physical laminated menus were slow to update during daily specials, and peak dinner hours overwhelmed front-of-house staff.",
    solution: "Engineered a Next.js contactless QR digital menu with real-time sync, dynamic pricing, and instant table-number WhatsApp ordering.",
    metrics: [
      { value: "0.32s", label: "QR Scan-to-Menu Speed" },
      { value: "+38%", label: "Average Table Turnover" },
      { value: "$0", label: "Menu Re-printing Costs" },
      { value: "4.9★", label: "Guest Satisfaction" },
    ],
    techStack: ["Next.js 15", "Tailwind CSS", "QR Engine", "WhatsApp API", "Edge Cache"],
    gradient: "from-amber-600 via-orange-600 to-rose-700",
    accentColor: "#f59e0b",
    previewMockupType: "restaurant",
    whatsappPrompt: "Hi GJ Devloper, I saw the Apex Culinary restaurant & QR menu concept in your portfolio. Can you build something similar for my restaurant?",
  },
  {
    id: "lumina-luxury-suites",
    title: "Lumina Boutique Hotel & Suites",
    clientBadge: "Sample Concept Showcase",
    serviceCategory: "Hotel & Hospitality",
    isSample: true,
    sampleNotice: "Demonstration Project Architecture by GJ Devloper",
    summary: "Bespoke hospitality digital presence featuring high-resolution suite virtual walkthroughs, date-picker reservation engine, and zero-commission direct bookings.",
    description: "Designed for boutique hotels seeking independence from 18-25% OTA commissions. Blends editorial aesthetics with instant booking checkout.",
    challenge: "The property was losing 20%+ of revenue to third-party travel booking aggregators because their own website lacked an intuitive reservation system.",
    solution: "Created an Apple-grade direct booking experience with interactive room calendars, instant confirmation SMS/WhatsApp, and direct deposit confirmation.",
    metrics: [
      { value: "+62%", label: "Direct Booking Share" },
      { value: "100%", label: "Mobile Responsive" },
      { value: "0.45s", label: "First Contentful Paint" },
      { value: "0%", label: "OTA Commission Paid" },
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "WhatsApp Cloud API", "Framer Motion"],
    gradient: "from-emerald-600 via-teal-600 to-cyan-600",
    accentColor: "#10b981",
    previewMockupType: "hotel",
    whatsappPrompt: "Hi GJ Devloper, I like the Lumina Hotel booking website concept in your portfolio. I'd like a quote for a hotel website.",
  },
  {
    id: "verve-streetwear",
    title: "Verve Apparel DTC Storefront",
    clientBadge: "Sample Concept Showcase",
    serviceCategory: "E-Commerce",
    isSample: true,
    sampleNotice: "Demonstration Project Architecture by GJ Devloper",
    summary: "Headless e-commerce storefront with instantaneous page switches, animated product lookbooks, slide-over dynamic cart, and 1-click checkout.",
    description: "Built for contemporary fashion and lifestyle labels. Eliminates standard Shopify liquid bloat in favor of sub-500ms Next.js storefront architecture.",
    challenge: "Traditional e-commerce templates suffered high mobile bounce rates during flash sales due to slow 3.5s page load times.",
    solution: "Implemented Next.js static generation with ISR, WebP responsive image transforms, and instant slide-out cart with localized currencies.",
    metrics: [
      { value: "99/100", label: "Google PageSpeed Mobile" },
      { value: "3.2x", label: "Cart Completion Rate" },
      { value: "< 400ms", label: "Page Transition" },
      { value: "Global", label: "Multi-Currency Ready" },
    ],
    techStack: ["Next.js", "React 19", "Tailwind CSS", "WhatsApp Ordering", "Headless Storefront"],
    gradient: "from-purple-600 via-indigo-600 to-blue-600",
    accentColor: "#8b5cf6",
    previewMockupType: "ecommerce",
    whatsappPrompt: "Hi GJ Devloper, I'm interested in building a high-speed E-Commerce storefront like the Verve Apparel sample in your portfolio.",
  },
  {
    id: "krona-pos-system",
    title: "Krona Kitchen Display & POS System",
    clientBadge: "Sample Concept Showcase",
    serviceCategory: "Custom Web Apps",
    isSample: true,
    sampleNotice: "Demonstration Project Architecture by GJ Devloper",
    summary: "Real-time web-based restaurant management platform uniting table ordering, kitchen ticket displays (KOT), inventory alerts, and daily sales metrics.",
    description: "Engineered for high-volume restaurants and multi-chain eateries. Runs seamlessly on touchscreens, iPads, tablets, and POS terminals.",
    challenge: "Kitchen miscommunications and lost paper tickets caused meal delays and food waste during busy dinner rushes.",
    solution: "Crafted a zero-lag WebSocket kitchen display system with color-coded preparation timers, order bump bars, and automated bill printing.",
    metrics: [
      { value: "0ms", label: "Perceived Ticket Latency" },
      { value: "-45%", label: "Kitchen Order Delays" },
      { value: "Real-Time", label: "Multi-Tablet Sync" },
      { value: "Offline", label: "Network Resilient" },
    ],
    techStack: ["Next.js 15", "TypeScript", "WebSockets", "SQLite / PostgreSQL", "Tailwind CSS"],
    gradient: "from-orange-600 via-amber-600 to-yellow-600",
    accentColor: "#f97316",
    previewMockupType: "pos",
    whatsappPrompt: "Hi GJ Devloper, I saw the Krona POS / Restaurant Management System in your portfolio. Can we discuss building this for my business?",
  },
  {
    id: "solstice-analytics-saas",
    title: "Solstice AI Telemetry Platform",
    clientBadge: "Sample Concept Showcase",
    serviceCategory: "Custom Web Apps",
    isSample: true,
    sampleNotice: "Demonstration Project Architecture by GJ Devloper",
    summary: "Enterprise cloud telemetry and data dashboard featuring streaming canvas charts, automated alerting, and multi-tenant team management.",
    description: "Custom web application architecture capable of rendering tens of thousands of data points with smooth 60fps canvas graphics and dark-mode elegance.",
    challenge: "Complex financial and sensor data caused client browsers to freeze with standard SVG charting libraries.",
    solution: "Engineered hardware-accelerated canvas chart renderers paired with Next.js server actions and secure role-based session tokens.",
    metrics: [
      { value: "60 FPS", label: "Real-Time Render" },
      { value: "10,000+", label: "Concurrent Data Points" },
      { value: "Zero", label: "Main Thread Blocking" },
      { value: "SOC2", label: "Security Compliant" },
    ],
    techStack: ["Next.js 15", "TypeScript", "Tailwind CSS", "Canvas Charts", "Node.js"],
    gradient: "from-sky-500 via-blue-600 to-indigo-800",
    accentColor: "#38bdf8",
    previewMockupType: "webapp",
    whatsappPrompt: "Hi GJ Devloper, I need a Custom Web Application with dashboards and real-time data like the Solstice platform.",
  },
  {
    id: "nexus-studio-portfolio",
    title: "Nexus Creative Agency Portfolio",
    clientBadge: "Sample Concept Showcase",
    serviceCategory: "Brand Portfolios",
    isSample: true,
    sampleNotice: "Demonstration Project Architecture by GJ Devloper",
    summary: "Immersive 3D agency portfolio featuring interactive mouse physics, smooth scroll storytelling, and rich project showcase modals.",
    description: "Designed to help creative studios, architects, and high-ticket freelancers win premium international clients with unforgettable digital poise.",
    challenge: "Standing out in a sea of generic, boring web templates with a bespoke, futuristic dark-theme design system.",
    solution: "Combined Three.js WebGL particle spheres with fluid glassmorphism cards and lightning-fast edge static generation.",
    metrics: [
      { value: "4.5x", label: "Inquiry Conversion Lift" },
      { value: "0.38s", label: "First Meaningful Paint" },
      { value: "Awwwards", label: "Design Benchmark" },
      { value: "100%", label: "Custom Engineered" },
    ],
    techStack: ["Three.js", "Next.js", "Tailwind CSS", "Framer Motion", "TypeScript"],
    gradient: "from-blue-600 via-purple-600 to-violet-700",
    accentColor: "#a855f7",
    previewMockupType: "portfolio",
    whatsappPrompt: "Hi GJ Devloper, I love the Nexus Creative Portfolio showcase. I want to build a similar world-class portfolio website for myself.",
  },
];
