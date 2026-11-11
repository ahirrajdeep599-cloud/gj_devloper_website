import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { getSupabasePortfolio, saveSupabasePortfolio } from "@/lib/supabaseCatalog";

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();

    const sbPortfolio = await getSupabasePortfolio();
    if (sbPortfolio) {
      const idx = sbPortfolio.findIndex((p) => p.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      const existing = sbPortfolio[idx];
      const updated = {
        ...existing,
        title: body.title !== undefined ? body.title.trim() : existing.title,
        client_badge: body.client_badge !== undefined ? body.client_badge : existing.client_badge,
        service_category:
          body.service_category !== undefined ? body.service_category : existing.service_category,
        summary: body.summary !== undefined ? body.summary.trim() : existing.summary,
        description:
          body.description !== undefined ? body.description.trim() : existing.description,
        demo_url: body.demo_url !== undefined ? body.demo_url : existing.demo_url,
        whatsapp_prompt:
          body.whatsapp_prompt !== undefined ? body.whatsapp_prompt : existing.whatsapp_prompt,
        sort_order: body.sort_order !== undefined ? Number(body.sort_order) : existing.sort_order,
      };
      const nextList = [...sbPortfolio];
      nextList[idx] = updated;
      await saveSupabasePortfolio(nextList);
      return NextResponse.json({ success: true, project: updated });
    }

    const existing = db.prepare("SELECT * FROM portfolio_projects WHERE id = ?").get(id) as DBProjectRow | undefined;
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const title = body.title !== undefined ? body.title.trim() : existing.title;
    const client_badge = body.client_badge !== undefined ? body.client_badge : existing.client_badge;
    const service_category =
      body.service_category !== undefined ? body.service_category : existing.service_category;
    const summary = body.summary !== undefined ? body.summary.trim() : existing.summary;
    const description =
      body.description !== undefined ? body.description.trim() : existing.description;
    const demo_url = body.demo_url !== undefined ? body.demo_url : existing.demo_url;
    const whatsapp_prompt =
      body.whatsapp_prompt !== undefined ? body.whatsapp_prompt : existing.whatsapp_prompt;
    const sort_order = body.sort_order !== undefined ? Number(body.sort_order) : existing.sort_order;

    db.prepare(`
      UPDATE portfolio_projects SET
        title = ?, client_badge = ?, service_category = ?, summary = ?,
        description = ?, demo_url = ?, whatsapp_prompt = ?, sort_order = ?
      WHERE id = ?
    `).run(title, client_badge, service_category, summary, description, demo_url, whatsapp_prompt, sort_order, id);

    const updated = db.prepare("SELECT * FROM portfolio_projects WHERE id = ?").get(id);
    return NextResponse.json({ success: true, project: updated });
  } catch (err: unknown) {
    console.error("[Portfolio PATCH Error]:", err);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const sbPortfolio = await getSupabasePortfolio();
    if (sbPortfolio) {
      await saveSupabasePortfolio(sbPortfolio.filter((p) => p.id !== id));
      return NextResponse.json({ success: true, message: "Project deleted successfully" });
    }

    db.prepare("DELETE FROM portfolio_projects WHERE id = ?").run(id);
    return NextResponse.json({ success: true, message: "Project deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
