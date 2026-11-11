import bcrypt from "bcryptjs";
import { gjServices } from "@/data/services";
import { sampleProjectsData } from "@/data/projects";
import {
  getSupabaseAdmin,
  getSupabaseSettingJson,
  setSupabaseSettingJson,
} from "./supabaseServer";

export interface SupabaseProductRow {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price: number | null;
  image_url: string;
  in_stock: boolean;
  stock_quantity: number;
  badge: string;
  features: string[] | string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: { name?: string; slug?: string } | null;
}

export function formatSupabaseProduct(p: SupabaseProductRow) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.categories?.name || "Web Systems",
    description: p.description,
    price: Number(p.price) || 0,
    original_price:
      p.original_price !== null && p.original_price !== undefined
        ? Number(p.original_price)
        : null,
    image_url: p.image_url,
    in_stock: p.in_stock ? 1 : 0,
    stock_quantity: Number(p.stock_quantity) || 0,
    badge: p.badge || "",
    features: typeof p.features === "string" ? JSON.parse(p.features) : p.features || [],
    sort_order: Number(p.sort_order) || 0,
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

/**
 * Resolves a category name to its UUID in public.categories, creating it if absent.
 */
export async function resolveSupabaseCategoryId(categoryName?: string): Promise<string | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;

  const cleanName = (categoryName || "Web Systems").trim() || "Web Systems";
  const slug =
    cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "general";

  const { data: existing } = await sb
    .from("categories")
    .select("id, name")
    .or(`name.ilike.${cleanName},slug.eq.${slug}`)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    return existing.id;
  }

  const { data: created, error } = await sb
    .from("categories")
    .insert({
      name: cleanName,
      slug,
      description: `${cleanName} digital products`,
      sort_order: 99,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[resolveSupabaseCategoryId Error]:", error);
    return null;
  }

  return created?.id || null;
}

export interface StoredServiceItem {
  id: string;
  number: string;
  title: string;
  category: string;
  short_description: string;
  deliverables: string[];
  starting_price: string;
  icon_type: string;
  badge: string;
  whatsapp_preset: string;
  gradient: string;
  is_active: boolean;
  sort_order: number;
}

export async function getSupabaseServices(): Promise<StoredServiceItem[] | null> {
  if (!getSupabaseAdmin()) return null;
  const existing = await getSupabaseSettingJson<StoredServiceItem[]>("cms_services");
  if (Array.isArray(existing)) return existing;

  const seeded: StoredServiceItem[] = gjServices.map((svc, idx) => ({
    id: svc.id,
    number: svc.number,
    title: svc.title,
    category: svc.category,
    short_description: svc.shortDescription,
    deliverables: svc.deliverables,
    starting_price: svc.startingPrice,
    icon_type: svc.iconType,
    badge: svc.badge,
    whatsapp_preset: svc.whatsappPreset,
    gradient: svc.gradient,
    is_active: true,
    sort_order: idx + 1,
  }));

  await setSupabaseSettingJson("cms_services", seeded, true, "Persistent CMS services list");
  return seeded;
}

export async function saveSupabaseServices(services: StoredServiceItem[]): Promise<boolean> {
  return setSupabaseSettingJson("cms_services", services, true, "Persistent CMS services list");
}

export interface StoredPortfolioItem {
  id: string;
  title: string;
  client_badge: string;
  service_category: string;
  is_sample: boolean;
  sample_notice: string;
  summary: string;
  description: string;
  challenge: string;
  solution: string;
  metrics: { value: string; label: string }[];
  tech_stack: string[];
  gradient: string;
  accent_color: string;
  preview_type: string;
  demo_url: string;
  whatsapp_prompt: string;
  sort_order: number;
}

export async function getSupabasePortfolio(): Promise<StoredPortfolioItem[] | null> {
  if (!getSupabaseAdmin()) return null;
  const existing = await getSupabaseSettingJson<StoredPortfolioItem[]>("cms_portfolio");
  if (Array.isArray(existing)) return existing;

  const seeded: StoredPortfolioItem[] = sampleProjectsData.map((p, idx) => ({
    id: p.id,
    title: p.title,
    client_badge: p.clientBadge,
    service_category: p.serviceCategory,
    is_sample: p.isSample,
    sample_notice: p.sampleNotice,
    summary: p.summary,
    description: p.description,
    challenge: p.challenge,
    solution: p.solution,
    metrics: p.metrics,
    tech_stack: p.techStack,
    gradient: p.gradient,
    accent_color: p.accentColor,
    preview_type: p.previewMockupType,
    demo_url: "",
    whatsapp_prompt: p.whatsappPrompt,
    sort_order: idx + 1,
  }));

  await setSupabaseSettingJson("cms_portfolio", seeded, true, "Persistent CMS portfolio showcase");
  return seeded;
}

export async function saveSupabasePortfolio(projects: StoredPortfolioItem[]): Promise<boolean> {
  return setSupabaseSettingJson(
    "cms_portfolio",
    projects,
    true,
    "Persistent CMS portfolio showcase"
  );
}

export interface StoredInquiryItem {
  id: number;
  customer_name: string;
  whatsapp_number: string;
  website_type: string;
  budget: string;
  project_description: string;
  status: string;
  whatsapp_sent_status: string;
  source: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export async function getSupabaseInquiries(): Promise<StoredInquiryItem[] | null> {
  if (!getSupabaseAdmin()) return null;
  const existing = await getSupabaseSettingJson<StoredInquiryItem[]>("cms_inquiries");
  return Array.isArray(existing) ? existing : [];
}

export async function saveSupabaseInquiries(inquiries: StoredInquiryItem[]): Promise<boolean> {
  return setSupabaseSettingJson(
    "cms_inquiries",
    inquiries,
    false,
    "Private admin customer inquiries"
  );
}

export interface StoredAdminAccount {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export async function getSupabaseAdmins(): Promise<StoredAdminAccount[] | null> {
  if (!getSupabaseAdmin()) return null;
  const existing = await getSupabaseSettingJson<StoredAdminAccount[]>("cms_admins");
  if (Array.isArray(existing) && existing.length > 0) {
    return existing;
  }

  const adminUsername = (process.env.ADMIN_USERNAME || "admin").trim();
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@gjdevloper.com").trim();
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;
  if (!adminPassword) return [];

  const hash = bcrypt.hashSync(adminPassword, bcrypt.genSaltSync(10));
  const seeded: StoredAdminAccount[] = [
    {
      id: 1,
      username: adminUsername,
      email: adminEmail,
      password_hash: hash,
      created_at: new Date().toISOString(),
    },
  ];
  await setSupabaseSettingJson("cms_admins", seeded, false, "Private admin authentication store");
  return seeded;
}

export async function saveSupabaseAdmins(admins: StoredAdminAccount[]): Promise<boolean> {
  return setSupabaseSettingJson("cms_admins", admins, false, "Private admin authentication store");
}
