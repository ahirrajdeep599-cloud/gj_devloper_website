import { TechItem } from "@/types";

export const techStackData: TechItem[] = [
  // Frontend
  { name: "Next.js 15", category: "Frontend", icon: "Code", highlight: true, description: "App router, SSR, streaming, and server actions for maximum velocity" },
  { name: "React 19", category: "Frontend", icon: "Layers", highlight: true, description: "Declarative component architecture & modern concurrent hooks" },
  { name: "TypeScript", category: "Frontend", icon: "Shield", highlight: true, description: "End-to-end type safety eliminating runtime bugs" },
  { name: "Tailwind CSS v4", category: "Frontend", icon: "Palette", highlight: true, description: "Utility-first precision styling with custom design tokens" },
  
  // 3D & Creative
  { name: "Three.js", category: "3D & Creative", icon: "Globe", highlight: true, description: "Hardware-accelerated 3D meshes, custom shaders & lighting" },
  { name: "WebGL / GLSL", category: "3D & Creative", icon: "Cpu", highlight: true, description: "High-performance GPU shader computations and particle systems" },
  { name: "Framer Motion", category: "3D & Creative", icon: "Sparkles", highlight: true, description: "Fluid kinetic physics, spring animations, and gesture interactions" },
  { name: "Canvas API", category: "3D & Creative", icon: "Activity", highlight: false, description: "High-density data visualization and interactive particle fields" },

  // Backend & Cloud
  { name: "Node.js", category: "Backend & Cloud", icon: "Server", highlight: true, description: "Scalable asynchronous event-driven backend services" },
  { name: "Edge Functions", category: "Backend & Cloud", icon: "Zap", highlight: true, description: "Sub-10ms global compute deployed across 300+ edge locations" },
  { name: "Vercel / Cloudflare", category: "Backend & Cloud", icon: "Cloud", highlight: true, description: "Global CDN caching, DDoS protection, and edge asset delivery" },
  { name: "REST & GraphQL", category: "Backend & Cloud", icon: "Share2", highlight: false, description: "Clean, self-documenting, and resilient API contracts" },

  // State & Database
  { name: "PostgreSQL", category: "State & Database", icon: "Database", highlight: true, description: "Battle-tested relational database with ACID compliance" },
  { name: "Supabase", category: "State & Database", icon: "Database", highlight: true, description: "Real-time subscriptions, Postgres vector search & instant auth" },
  { name: "Redis", category: "State & Database", icon: "Zap", highlight: false, description: "In-memory caching and ultra-fast session persistence" },
  { name: "Prisma / Drizzle", category: "State & Database", icon: "FileCode", highlight: false, description: "Type-safe ORM for flawless database migrations" },

  // Tools & CI/CD
  { name: "Docker", category: "Tools & CI/CD", icon: "Box", highlight: false, description: "Containerized reproducible development and staging environments" },
  { name: "Git & GitHub Actions", category: "Tools & CI/CD", icon: "GitBranch", highlight: false, description: "Automated linting, testing, and continuous deployment workflows" },
  { name: "Lighthouse CI", category: "Tools & CI/CD", icon: "Gauge", highlight: true, description: "Strict automated performance budgets preventing regressions" },
  { name: "Sentry Telemetry", category: "Tools & CI/CD", icon: "AlertCircle", highlight: false, description: "Real-time error tracking and performance monitoring" },
];
