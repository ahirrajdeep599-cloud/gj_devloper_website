import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import {
  getSupabasePortfolio,
  saveSupabasePortfolio,
  StoredPortfolioItem,
} from "@/lib/supabaseCatalog";

export const dynamic = "force-dynamic";

interface DBProjectRow {
  id: string;
  title: string;
  client_badge: string;
  service_category: string;
  is_sample: number;
  sample_notice: string;
  summary: string;
  description: string;
  challenge: string;
  solution: string;
  metrics: string;
  tech_stack: string;
  gradient: string;
  accent_color: string;
  preview_type: string;
  demo_url: string;
  whatsapp_prompt: string;
  sort_order: number;
}

function formatSupabasePortfolioItem(r: StoredPortfolioItem) {
  return {
    ...r,
    isSample: Boolean(r.is_sample),
    previewMockupType: r.preview_type,
    clientBadge: r.client_badge,
    sampleNotice: r.sample_notice,
    serviceCategory: r.service_category,
    whatsappPrompt: r.whatsapp_prompt,
    accentColor: r.accent_color,
    techStack: r.tech_stack || [],
    demoUrl: r.demo_url || "",
  };
}

export async function GET() {
  try {
    const sbPortfolio = await getSupabasePortfolio();
    if (sbPortfolio) {
      const sorted = [...sbPortfolio].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      return NextResponse.json(
        { success: true, projects: sorted.map(formatSupabasePortfolioItem) },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const rows = db
      .prepare("SELECT * FROM portfolio_projects ORDER BY sort_order ASC")
      .all() as DBProjectRow[];

    const projects = rows.map((r) => ({
      ...r,
      metrics: typeof r.metrics === "string" ? JSON.parse(r.metrics) : r.metrics,
      techStack: typeof r.tech_stack === "string" ? JSON.parse(r.tech_stack) : r.tech_stack,
      isSample: Boolean(r.is_sample),
      previewMockupType: r.preview_type,
      clientBadge: r.client_badge,
      sampleNotice: r.sample_notice,
      serviceCategory: r.service_category,
      whatsappPrompt: r.whatsapp_prompt,
      accentColor: r.accent_color,
      demoUrl: r.demo_url,
    }));

    return NextResponse.json(
      { success: true, projects },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    console.error("[Portfolio GET Error]:", err);
    return NextResponse.json({ error: "Failed to fetch portfolio projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      client_badge,
      service_category,
      summary,
      description,
      challenge,
      solution,
      metrics,
      tech_stack,
      gradient,
      preview_type,
      demo_url,
      whatsapp_prompt,
      sort_order,
    } = body;

    if (!title || !summary) {
      return NextResponse.json({ error: "Title and summary are required." }, { status: 400 });
    }

    const id = body.id || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const metricsArr = Array.isArray(metrics) ? metrics : [];
    const techArr = Array.isArray(tech_stack) ? tech_stack : ["Next.js", "TypeScript"];

    const sbPortfolio = await getSupabasePortfolio();
    if (sbPortfolio) {
      const created: StoredPortfolioItem = {
        id,
        title: title.trim(),
        client_badge: client_badge ? client_badge.trim() : "Custom Client Build",
        service_category: service_category ? service_category.trim() : "Web Application",
        is_sample: true,
        sample_notice: "Sample Project Architecture",
        summary: summary.trim(),
        description: description ? description.trim() : summary.trim(),
        challenge: challenge ? challenge.trim() : "Custom digital architecture challenge.",
        solution: solution ? solution.trim() : "Engineered bespoke solution with Next.js & TypeScript.",
        metrics: metricsArr,
        tech_stack: techArr,
        gradient: gradient || "from-blue-600 via-indigo-600 to-sky-500",
        accent_color: "#38bdf8",
        preview_type: preview_type || "webapp",
        demo_url: demo_url || "",
        whatsapp_prompt:
          whatsapp_prompt ||
          `Hi GJ Devloper, I saw your ${title} project in your portfolio. Can you build something similar?`,
        sort_order: Number(sort_order) || sbPortfolio.length + 1,
      };
      await saveSupabasePortfolio([...sbPortfolio, created]);
      return NextResponse.json({ success: true, project: formatSupabasePortfolioItem(created) });
    }

    db.prepare(`
      INSERT INTO portfolio_projects (
        id, title, client_badge, service_category, is_sample, sample_notice, summary, description,
        challenge, solution, metrics, tech_stack, gradient, preview_type, demo_url, whatsapp_prompt, sort_order
      ) VALUES (?, ?, ?, ?, 1, 'Sample Project Architecture', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title.trim(),
      client_badge ? client_badge.trim() : "Custom Client Build",
      service_category ? service_category.trim() : "Web Application",
      summary.trim(),
      description ? description.trim() : summary.trim(),
      challenge ? challenge.trim() : "Custom digital architecture challenge.",
      solution ? solution.trim() : "Engineered bespoke solution with Next.js & TypeScript.",
      JSON.stringify(metricsArr),
      JSON.stringify(techArr),
      gradient || "from-blue-600 via-indigo-600 to-sky-500",
      preview_type || "webapp",
      demo_url || "",
      whatsapp_prompt || `Hi GJ Devloper, I saw your ${title} project in your portfolio. Can you build something similar?`,
      sort_order || 99
    );

    const created = db.prepare("SELECT * FROM portfolio_projects WHERE id = ?").get(id) as DBProjectRow | undefined;
    return NextResponse.json({ success: true, project: created });
  } catch (err: unknown) {
    console.error("[Portfolio POST Error]:", err);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
