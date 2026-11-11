"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Layers, 
  Briefcase, 
  LogOut, 
  ExternalLink, 
  MessageSquare, 
  Trash2, 
  CheckCircle2, 
  Search, 
  RefreshCw,
  Plus,
  Edit,
  Save,
  Check,
  PhoneCall,
  DollarSign,
  TrendingUp,
  Sliders,
  FileText,
  ShieldCheck,
  ArrowRight,
  X,
  Package,
  ShoppingBag
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import { Product, Order, OrderStatus } from "@/types";
import { useSiteSettings } from "@/context/SiteSettingsContext";

interface Inquiry {
  id: number;
  customer_name: string;
  whatsapp_number: string;
  website_type: string;
  package_name?: string;
  budget: string;
  project_description: string;
  status: "New" | "Contacted" | "In Progress" | "Completed";
  whatsapp_sent_status: string;
  source: string;
  notes: string;
  created_at: string;
}

interface PricingPlan {
  id: string;
  name: string;
  subtitle?: string;
  price: string;
  price_label?: string;
  category?: string;
  badge?: string;
  description?: string;
  features: string[];
  whatsapp_preset?: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

interface ServiceItem {
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
  is_active: boolean;
  sort_order: number;
}

interface PortfolioProject {
  id: string;
  title: string;
  client_badge?: string;
  service_category?: string;
  summary: string;
  description: string;
  tech_stack: string[];
  demo_url?: string;
  whatsapp_prompt?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { refreshSettings } = useSiteSettings();

  // Navigation State
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "products" | "whatsapp" | "pricing" | "services" | "content" | "inquiries" | "portfolio" | "security"
  >("overview");

  // Data States
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderMetrics, setOrderMetrics] = useState({
    totalOrders: 0,
    newOrders: 0,
    confirmedOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
  });
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inquiries Filter State
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // WhatsApp Editor State
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneDigits, setPhoneDigits] = useState("9876543210");
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);

  // Pricing Plan Editor State (Modal/Form)
  const [editingPlan, setEditingPlan] = useState<Partial<PricingPlan> | null>(null);
  const [newFeatureText, setNewFeatureText] = useState("");

  // Service Editor State
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [newDeliverableText, setNewDeliverableText] = useState("");

  // Content Editor State
  const [contentForm, setContentForm] = useState<Record<string, string>>({});
  const [savingContent, setSavingContent] = useState(false);

  // Security Credentials State
  const [profileEmail, setProfileEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Trigger Toast Alert
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch All Admin Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Inquiries
      const resInq = await fetch("/api/inquiries", { cache: "no-store" });
      if (resInq.status === 401) {
        router.push("/admin/login");
        return;
      }
      const dataInq = await resInq.json();
      if (dataInq.success) setInquiries(dataInq.inquiries || []);

      // 2. Settings
      const resSet = await fetch("/api/settings", { cache: "no-store" });
      if (resSet.ok) {
        const dataSet = await resSet.json();
        if (dataSet.settings) {
          setSettings(dataSet.settings);
          setContentForm(dataSet.settings);

          // Parse WhatsApp number
          const raw = dataSet.settings.whatsapp_number || "919876543210";
          const cc = dataSet.settings.whatsapp_country_code || "+91";
          setCountryCode(cc);
          const digits = raw.startsWith(cc.replace("+", ""))
            ? raw.slice(cc.replace("+", "").length)
            : raw;
          setPhoneDigits(digits);
        }
      }

      // 3. Pricing Plans (fetch all including inactive for admin)
      const resPlans = await fetch("/api/pricing?all=true", { cache: "no-store" });
      if (resPlans.ok) {
        const dataPlans = await resPlans.json();
        if (dataPlans.plans) setPlans(dataPlans.plans);
      }

      // 4. Services (fetch all including inactive)
      const resSvc = await fetch("/api/services?all=true", { cache: "no-store" });
      if (resSvc.ok) {
        const dataSvc = await resSvc.json();
        if (dataSvc.services) setServices(dataSvc.services);
      }

      // 5. Portfolio
      const resPort = await fetch("/api/portfolio", { cache: "no-store" });
      if (resPort.ok) {
        const dataPort = await resPort.json();
        if (dataPort.projects) setProjects(dataPort.projects);
      }

      // 6. Admin Profile
      const resProfile = await fetch("/api/admin/profile", { cache: "no-store" });
      if (resProfile.ok) {
        const dataProfile = await resProfile.json();
        if (dataProfile.admin) setProfileEmail(dataProfile.admin.email || "");
      }

      // 7. Store Products
      const resProd = await fetch("/api/admin/products", { cache: "no-store" });
      if (resProd.ok) {
        const dataProd = await resProd.json();
        if (dataProd.products) setProducts(dataProd.products);
      }

      // 8. E-Commerce Orders
      const resOrders = await fetch("/api/admin/orders", { cache: "no-store" });
      if (resOrders.ok) {
        const dataOrders = await resOrders.json();
        if (dataOrders.orders) setOrders(dataOrders.orders);
        if (dataOrders.metrics) setOrderMetrics(dataOrders.metrics);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 1. SAVE WHATSAPP NUMBER
  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWhatsApp(true);

    const fullNumber = `${countryCode.replace("+", "")}${phoneDigits.replace(/[^0-9]/g, "")}`;

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            whatsapp_number: fullNumber,
            whatsapp_country_code: countryCode,
          },
        }),
      });

      if (res.ok) {
        setSettings((prev) => ({
          ...prev,
          whatsapp_number: fullNumber,
          whatsapp_country_code: countryCode,
        }));
        void refreshSettings();
        showToast(`WhatsApp number updated to ${countryCode} ${phoneDigits} across the entire website!`);
      } else {
        showToast("Error updating WhatsApp number.");
      }
    } catch {
      showToast("Network error saving WhatsApp number.");
    } finally {
      setSavingWhatsApp(false);
    }
  };

  // 2. SAVE PRICING PLAN (CREATE OR EDIT)
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !editingPlan.name || !editingPlan.price) return;

    try {
      const isNew = !editingPlan.id || editingPlan.id.startsWith("temp-");
      const url = isNew ? "/api/pricing" : `/api/pricing/${editingPlan.id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPlan),
      });

      if (res.ok) {
        showToast(isNew ? "New pricing plan created!" : "Pricing plan updated!");
        setEditingPlan(null);
        fetchData();
        void refreshSettings();
      } else {
        showToast("Failed to save pricing plan.");
      }
    } catch {
      showToast("Error saving plan.");
    }
  };

  // DELETE PRICING PLAN
  const handleDeletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pricing plan?")) return;
    try {
      const res = await fetch(`/api/pricing/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPlans((prev) => prev.filter((p) => p.id !== id));
        void refreshSettings();
        showToast("Plan deleted.");
      }
    } catch {
      showToast("Delete failed.");
    }
  };

  // 3. SAVE SERVICE (CREATE OR EDIT)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.title) return;

    try {
      const isNew = !editingService.id || editingService.id.startsWith("temp-");
      const url = isNew ? "/api/services" : `/api/services/${editingService.id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingService),
      });

      if (res.ok) {
        showToast(isNew ? "New service offering added!" : "Service updated!");
        setEditingService(null);
        fetchData();
        void refreshSettings();
      } else {
        showToast("Failed to save service.");
      }
    } catch {
      showToast("Error saving service.");
    }
  };

  // DELETE SERVICE
  const handleDeleteService = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== id));
        void refreshSettings();
        showToast("Service deleted.");
      }
    } catch {
      showToast("Delete failed.");
    }
  };

  // 4. SAVE WEBSITE CONTENT
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContent(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: contentForm }),
      });
      if (res.ok) {
        setSettings((prev) => ({ ...prev, ...contentForm }));
        void refreshSettings();
        showToast("Website content updated! Changes live on homepage.");
      } else {
        showToast("Failed to update content.");
      }
    } catch {
      showToast("Error updating content.");
    } finally {
      setSavingContent(false);
    }
  };

  // 5. UPDATE INQUIRY STATUS
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((inq) =>
            inq.id === id ? { ...inq, status: newStatus as Inquiry["status"] } : inq
          )
        );
        showToast(`Inquiry #${id} marked as ${newStatus}`);
      }
    } catch {
      showToast("Status update failed.");
    }
  };

  // DELETE INQUIRY
  const handleDeleteInquiry = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this inquiry?")) return;
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInquiries((prev) => prev.filter((i) => i.id !== id));
        showToast("Inquiry deleted.");
      }
    } catch {
      showToast("Delete failed.");
    }
  };

  // 6. UPDATE ADMIN PROFILE / PASSWORD
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword: newPassword || undefined,
          email: profileEmail,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Admin profile credentials updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        showToast(data.error || "Failed to update profile.");
      }
    } catch {
      showToast("Profile update error.");
    } finally {
      setSavingProfile(false);
    }
  };

  // 6. SAVE PRODUCT (CREATE OR UPDATE)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || !editingProduct.price) return;

    try {
      const isNew = !editingProduct.id;
      const url = isNew ? "/api/admin/products" : `/api/admin/products/${editingProduct.id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProduct),
      });

      if (res.ok) {
        showToast(isNew ? "New product added to store!" : "Product updated!");
        setEditingProduct(null);
        fetchData();
      } else {
        showToast("Failed to save product.");
      }
    } catch {
      showToast("Error saving product.");
    }
  };

  // DELETE PRODUCT
  const handleDeleteProduct = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast("Product deleted from store.");
      }
    } catch {
      showToast("Delete product failed.");
    }
  };

  // TOGGLE PRODUCT STOCK
  const handleToggleProductStock = async (product: Product) => {
    const newStock = product.in_stock === 1 ? 0 : 1;
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ in_stock: newStock }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, in_stock: newStock } : p))
        );
        showToast(`Product marked as ${newStock === 1 ? "In Stock" : "Out of Stock"}.`);
      }
    } catch {
      showToast("Failed to update stock status.");
    }
  };

  // 7. UPDATE ORDER STATUS
  const handleUpdateOrderStatus = async (orderId: string | number, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        showToast(`Order status updated to "${newStatus}"!`);
      } else {
        showToast("Failed to update order status.");
      }
    } catch {
      showToast("Network error updating order.");
    }
  };

  // SAVE ADMIN ORDER NOTES
  const handleSaveAdminOrderNotes = async (orderId: string | number, notes: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_notes: notes }),
      });
      if (res.ok) {
        showToast("Order notes saved.");
      }
    } catch {
      showToast("Failed to save order notes.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // Filtered inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus = statusFilter === "All" ? true : inq.status === statusFilter;
    const matchesSearch =
      inq.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.whatsapp_number.includes(searchQuery) ||
      inq.website_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.project_description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate Overview Stats
  const totalInquiries = inquiries.length;
  const newInquiries = inquiries.filter((i) => i.status === "New").length;
  const activePlansCount = plans.filter((p) => p.is_active).length;
  const totalServicesCount = services.filter((s) => s.is_active).length;
  const activeProjectsCount = projects.length;

  const currentFormattedWhatsApp = `${countryCode.replace("+", "")}${phoneDigits.replace(/[^0-9]/g, "")}`;
  const testWhatsAppUrl = `https://wa.me/${currentFormattedWhatsApp}?text=${encodeURIComponent(
    "Hi GJ Devloper, this is a test message from your Admin Panel!"
  )}`;

  return (
    <div className="min-h-screen bg-[#02050e] text-slate-100 flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-[#09153a] border border-sky-400 text-white shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-mono">{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white font-mono text-sm shadow-md">
                GJ
              </div>
              <div>
                <span className="font-bold text-base text-white block">
                  GJ Devloper
                </span>
                <span className="text-[10px] font-mono text-emerald-400 -mt-1 block flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Control Center
                </span>
              </div>
            </Link>

            <span className="hidden lg:inline-block h-5 w-[1px] bg-white/10 mx-2" />

            <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/5">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active WhatsApp: </span>
              <strong className="text-white">+{currentFormattedWhatsApp}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-all flex items-center gap-1.5"
            >
              <span>View Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition-colors cursor-pointer"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-white/5 flex items-center gap-1 overflow-x-auto text-xs font-mono">
          {[
            { id: "overview", label: "Dashboard", icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { id: "orders", label: `Orders (${orderMetrics.newOrders} New)`, icon: <ShoppingBag className="w-3.5 h-3.5" /> },
            { id: "products", label: `Store Products (${products.length})`, icon: <Package className="w-3.5 h-3.5" /> },
            { id: "whatsapp", label: "WhatsApp Number", icon: <MessageSquare className="w-3.5 h-3.5" /> },
            { id: "pricing", label: `Pricing & Packages (${plans.length})`, icon: <DollarSign className="w-3.5 h-3.5" /> },
            { id: "services", label: `Services (${services.length})`, icon: <Briefcase className="w-3.5 h-3.5" /> },
            { id: "content", label: "Website Content", icon: <FileText className="w-3.5 h-3.5" /> },
            { id: "inquiries", label: `Inquiries (${newInquiries} New)`, icon: <Users className="w-3.5 h-3.5" /> },
            { id: "portfolio", label: `Portfolio (${projects.length})`, icon: <Layers className="w-3.5 h-3.5" /> },
            { id: "security", label: "Admin Profile", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-sky-500/15 text-sky-300 border border-sky-400/30 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full">
        {loading && (
          <div className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-xs">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Synchronizing live database records...</span>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 1: OVERVIEW & ANALYTICS                                */}
        {/* ========================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">Total Inquiries</span>
                  <Users className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-3xl font-black text-white font-mono">{totalInquiries}</div>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Leads captured</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#08182b] border border-sky-500/30 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-sky-300 uppercase font-bold">New Leads</span>
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                </div>
                <div className="text-3xl font-black text-sky-300 font-mono">{newInquiries}</div>
                <span className="text-[10px] text-sky-400/80 font-mono mt-1 block">Requires response</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">Active Plans</span>
                  <DollarSign className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-black text-white font-mono">{activePlansCount}</div>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Live packages</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">Services</span>
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-white font-mono">{totalServicesCount}</div>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Active disciplines</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">Showcase Projects</span>
                  <Layers className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-white font-mono">{activeProjectsCount}</div>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Live in portfolio</span>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900/40 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-emerald-400 uppercase font-bold">Store Orders</span>
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-white font-mono">{orderMetrics.totalOrders}</div>
                <span className="text-[10px] text-emerald-400/80 font-mono mt-1 block">
                  {orderMetrics.newOrders} New • {orderMetrics.confirmedOrders} Confirmed
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">Products Catalog</span>
                  <Package className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-3xl font-black text-white font-mono">{products.length}</div>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Available in store</span>
              </div>
            </div>

            {/* Quick Management Shortcuts */}
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/10">
              <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300 font-bold mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>Quick Website Management Actions</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setEditingPlan({
                      name: "Custom Package",
                      price: "₹3,999",
                      price_label: "Starting price",
                      category: "Business Website",
                      badge: "New Package",
                      description: "Custom tailored web development package.",
                      features: ["Mobile Responsive", "Contact Form", "SEO Setup"],
                      is_popular: false,
                      is_active: true,
                      sort_order: plans.length + 1,
                    });
                    setActiveTab("pricing");
                  }}
                  className="p-4 rounded-xl bg-white/[0.03] hover:bg-sky-500/10 border border-white/5 hover:border-sky-500/30 text-left transition-all cursor-pointer group"
                >
                  <Plus className="w-5 h-5 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-bold text-sm text-white">Create New Package</div>
                  <div className="text-xs text-slate-400 mt-0.5">Add a new pricing tier to the site</div>
                </button>

                <button
                  onClick={() => setActiveTab("whatsapp")}
                  className="p-4 rounded-xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 text-left transition-all cursor-pointer group"
                >
                  <MessageSquare className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-bold text-sm text-white">Change WhatsApp Number</div>
                  <div className="text-xs text-slate-400 mt-0.5">Update floating button &amp; links site-wide</div>
                </button>

                <button
                  onClick={() => setActiveTab("content")}
                  className="p-4 rounded-xl bg-white/[0.03] hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 text-left transition-all cursor-pointer group"
                >
                  <FileText className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-bold text-sm text-white">Edit Website Copy</div>
                  <div className="text-xs text-slate-400 mt-0.5">Update headings, subtitle &amp; about text</div>
                </button>

                <button
                  onClick={() => setActiveTab("inquiries")}
                  className="p-4 rounded-xl bg-white/[0.03] hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 text-left transition-all cursor-pointer group"
                >
                  <Users className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-bold text-sm text-white">Review Client Leads</div>
                  <div className="text-xs text-slate-400 mt-0.5">{newInquiries} new inquiries waiting</div>
                </button>
              </div>
            </div>

            {/* Recent Leads Preview */}
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold">
                  Recent Inbound Leads
                </h3>
                <button
                  onClick={() => setActiveTab("inquiries")}
                  className="text-xs font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Inquiries</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {inquiries.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-slate-500">
                  No inquiries logged yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {inquiries.slice(0, 5).map((inq) => (
                    <div
                      key={inq.id}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm text-white">{inq.customer_name}</strong>
                          <span className="text-xs font-mono text-emerald-400">+{inq.whatsapp_number}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              inq.status === "New" ? "bg-sky-500/20 text-sky-300" : "bg-white/5 text-slate-300"
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {inq.website_type} • Budget: {inq.budget} — &ldquo;{inq.project_description}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`https://wa.me/${inq.whatsapp_number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Hi ${inq.customer_name}, this is GJ Devloper regarding your inquiry for ${inq.website_type}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: WHATSAPP NUMBER MANAGEMENT                          */}
        {/* ========================================================== */}
        {activeTab === "whatsapp" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    WhatsApp Hotline Management
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Changes here instantly update every button, floating chat pill, and contact link on your website.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveWhatsApp} className="space-y-6 pt-4 border-t border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-400 block mb-2 font-medium">
                      Country Code
                    </label>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-emerald-400 text-sm"
                    >
                      <option value="+91">+91 (India)</option>
                      <option value="+1">+1 (US &amp; Canada)</option>
                      <option value="+44">+44 (United Kingdom)</option>
                      <option value="+971">+971 (United Arab Emirates)</option>
                      <option value="+61">+61 (Australia)</option>
                      <option value="+49">+49 (Germany)</option>
                      <option value="+65">+65 (Singapore)</option>
                      <option value="+966">+966 (Saudi Arabia)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-mono uppercase text-slate-400 block mb-2 font-medium">
                      WhatsApp Mobile Number (Without Code)
                    </label>
                    <input
                      type="text"
                      required
                      value={phoneDigits}
                      onChange={(e) => setPhoneDigits(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 text-sm font-mono"
                    />
                  </div>
                </div>

                {/* Preview Card */}
                <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 space-y-2">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block font-bold">
                    Live Formatted Target:
                  </span>
                  <div className="text-sm font-mono text-emerald-400 flex items-center gap-2">
                    <span>+{currentFormattedWhatsApp}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-400">https://wa.me/{currentFormattedWhatsApp}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={savingWhatsApp}
                    className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingWhatsApp ? "Saving..." : "Save WhatsApp Number"}</span>
                  </button>

                  <a
                    href={testWhatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-6 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/15 text-white font-mono text-xs flex items-center gap-2 transition-all"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-400" />
                    <span>Test WhatsApp Link</span>
                  </a>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: PRICING PLANS & PACKAGES MANAGEMENT                 */}
        {/* ========================================================== */}
        {activeTab === "pricing" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Pricing Plans &amp; Custom Packages
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Edit prices, features, or create brand-new packages (e.g. Restaurant, E-Commerce). Automatically syncs with the public website.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingPlan({
                    name: "",
                    price: "₹",
                    price_label: "Starting price",
                    category: "Website Development",
                    badge: "",
                    description: "",
                    features: ["Feature 1", "Feature 2"],
                    is_popular: false,
                    is_active: true,
                    sort_order: plans.length + 1,
                  })
                }
                className="py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.25)]"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Package</span>
              </button>
            </div>

            {/* Plan Edit Modal */}
            {editingPlan && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div className="relative w-full max-w-2xl bg-[#070d24] border border-sky-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <h4 className="text-lg font-bold text-white">
                      {editingPlan.id ? "Edit Pricing Package" : "Create Brand New Package"}
                    </h4>
                    <button
                      onClick={() => setEditingPlan(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSavePlan} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                          Package / Plan Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingPlan.name || ""}
                          onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                          placeholder="E.g. Restaurant Website Package"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                          Price * (With Currency Symbol)
                        </label>
                        <input
                          type="text"
                          required
                          value={editingPlan.price || ""}
                          onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
                          placeholder="E.g. ₹4,999 or $999"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          value={editingPlan.category || ""}
                          onChange={(e) => setEditingPlan({ ...editingPlan, category: e.target.value })}
                          placeholder="E.g. E-Commerce / Restaurant / Custom App"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                          Package Badge (Optional)
                        </label>
                        <input
                          type="text"
                          value={editingPlan.badge || ""}
                          onChange={(e) => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                          placeholder="E.g. Most Popular / High ROI"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                        Short Description
                      </label>
                      <textarea
                        rows={2}
                        value={editingPlan.description || ""}
                        onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                        placeholder="Explain what this package is best for..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs resize-none"
                      />
                    </div>

                    {/* Features List */}
                    <div>
                      <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                        Included Features List:
                      </label>
                      <div className="space-y-1.5 mb-2">
                        {(editingPlan.features || []).map((feat, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-black/40 text-xs text-slate-300"
                          >
                            <span>✓ {feat}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (editingPlan.features || []).filter((_, i) => i !== idx);
                                setEditingPlan({ ...editingPlan, features: updated });
                              }}
                              className="text-rose-400 hover:text-rose-300 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add new feature (e.g. 5 Content Pages)..."
                          value={newFeatureText}
                          onChange={(e) => setNewFeatureText(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newFeatureText.trim()) {
                              setEditingPlan({
                                ...editingPlan,
                                features: [...(editingPlan.features || []), newFeatureText.trim()],
                              });
                              setNewFeatureText("");
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                        <input
                          type="checkbox"
                          checked={editingPlan.is_popular || false}
                          onChange={(e) => setEditingPlan({ ...editingPlan, is_popular: e.target.checked })}
                          className="rounded text-sky-500"
                        />
                        <span>Mark as Popular / Featured</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                        <input
                          type="checkbox"
                          checked={editingPlan.is_active !== undefined ? editingPlan.is_active : true}
                          onChange={(e) => setEditingPlan({ ...editingPlan, is_active: e.target.checked })}
                          className="rounded text-emerald-500"
                        />
                        <span>Active on Website</span>
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setEditingPlan(null)}
                        className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
                      >
                        Save Package
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-6 rounded-3xl border flex flex-col justify-between ${
                    plan.is_popular
                      ? "bg-[#09153a] border-sky-400/50 shadow-[0_0_30px_rgba(56,189,248,0.2)]"
                      : "bg-slate-900/40 border-white/10"
                  } ${!plan.is_active ? "opacity-50" : ""}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={plan.is_popular ? "electric" : "secondary"}>
                        {plan.badge || plan.category || "Plan"}
                      </Badge>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingPlan(plan)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xl font-bold text-white">{plan.name}</h4>
                    <div className="text-2xl font-black text-white font-mono text-gradient-electric mt-1 mb-2">
                      {plan.price}
                    </div>
                    <p className="text-xs text-slate-400 mb-4">{plan.description}</p>

                    <div className="space-y-1.5 pt-3 border-t border-white/5 mb-4">
                      {plan.features.map((feat, i) => (
                        <div key={i} className="text-xs text-slate-300 flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-500">
                    <span>Status: {plan.is_active ? "🟢 Active" : "🔴 Hidden"}</span>
                    <span>Order: #{plan.sort_order}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: SERVICES MANAGEMENT                                 */}
        {/* ========================================================== */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">Services Management</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Manage the services offered by GJ Devloper. Edit descriptions, deliverables, and rates.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingService({
                    title: "",
                    category: "Websites",
                    short_description: "",
                    starting_price: "₹",
                    badge: "Specialized",
                    deliverables: ["Deliverable 1"],
                    icon_type: "Briefcase",
                    whatsapp_preset: "Hi GJ Devloper, I'm interested in this service.",
                  })
                }
                className="py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Service</span>
              </button>
            </div>

            {/* Service Edit Modal */}
            {editingService && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div className="relative w-full max-w-2xl bg-[#070d24] border border-sky-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <h4 className="text-lg font-bold text-white">
                      {editingService.id ? "Edit Service" : "Add Service"}
                    </h4>
                    <button
                      onClick={() => setEditingService(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveService} className="space-y-4">
                    <div>
                      <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                        Service Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingService.title || ""}
                        onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                        placeholder="E.g. AI Workflow Integration"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          value={editingService.category || ""}
                          onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                          Starting Price
                        </label>
                        <input
                          type="text"
                          value={editingService.starting_price || ""}
                          onChange={(e) => setEditingService({ ...editingService, starting_price: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                        Description *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={editingService.short_description || ""}
                        onChange={(e) => setEditingService({ ...editingService, short_description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs resize-none"
                      />
                    </div>

                    {/* Deliverables */}
                    <div>
                      <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                        Deliverables List:
                      </label>
                      <div className="space-y-1 mb-2">
                        {(editingService.deliverables || []).map((deliv, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-black/40 text-xs text-slate-300"
                          >
                            <span>✓ {deliv}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (editingService.deliverables || []).filter((_, i) => i !== idx);
                                setEditingService({ ...editingService, deliverables: updated });
                              }}
                              className="text-rose-400 hover:text-rose-300 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="New deliverable..."
                          value={newDeliverableText}
                          onChange={(e) => setNewDeliverableText(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newDeliverableText.trim()) {
                              setEditingService({
                                ...editingService,
                                deliverables: [...(editingService.deliverables || []), newDeliverableText.trim()],
                              });
                              setNewDeliverableText("");
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/10 text-xs text-white"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setEditingService(null)}
                        className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
                      >
                        Save Service
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className="p-5 rounded-2xl bg-slate-900/40 border border-white/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="electric">{svc.category}</Badge>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingService(svc)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(svc.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white mb-1">{svc.title}</h4>
                    <p className="text-xs text-slate-400 mb-3">{svc.short_description}</p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="text-sky-300 font-bold">{svc.starting_price}</span>
                    <span>{svc.deliverables?.length || 0} Deliverables</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 5: WEBSITE CONTENT MANAGEMENT                          */}
        {/* ========================================================== */}
        {activeTab === "content" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-2xl">
              <h3 className="text-xl font-bold text-white mb-2">
                Website Content Management
              </h3>
              <p className="text-xs text-slate-400 font-mono mb-6">
                Update marketing text, headings, about copy, and footer links without modifying source code.
              </p>

              <form onSubmit={handleSaveContent} className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold">
                    Homepage Hero Section
                  </h4>

                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                      Hero Main Heading
                    </label>
                    <input
                      type="text"
                      value={contentForm.hero_heading || ""}
                      onChange={(e) => setContentForm({ ...contentForm, hero_heading: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                      Hero Subtitle
                    </label>
                    <textarea
                      rows={2}
                      value={contentForm.hero_subtitle || ""}
                      onChange={(e) => setContentForm({ ...contentForm, hero_subtitle: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold">
                    About Studio Section
                  </h4>

                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                      About Section Heading
                    </label>
                    <input
                      type="text"
                      value={contentForm.about_heading || ""}
                      onChange={(e) => setContentForm({ ...contentForm, about_heading: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                      About Section Description
                    </label>
                    <textarea
                      rows={4}
                      value={contentForm.about_description || ""}
                      onChange={(e) => setContentForm({ ...contentForm, about_description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    Contact &amp; Social Links
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={contentForm.contact_email || ""}
                        onChange={(e) => setContentForm({ ...contentForm, contact_email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                        Contact Phone / Display
                      </label>
                      <input
                        type="text"
                        value={contentForm.contact_phone || ""}
                        onChange={(e) => setContentForm({ ...contentForm, contact_phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                        GitHub URL
                      </label>
                      <input
                        type="text"
                        value={contentForm.social_github || ""}
                        onChange={(e) => setContentForm({ ...contentForm, social_github: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                        Twitter / X URL
                      </label>
                      <input
                        type="text"
                        value={contentForm.social_twitter || ""}
                        onChange={(e) => setContentForm({ ...contentForm, social_twitter: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                        LinkedIn URL
                      </label>
                      <input
                        type="text"
                        value={contentForm.social_linkedin || ""}
                        onChange={(e) => setContentForm({ ...contentForm, social_linkedin: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingContent}
                    className="py-3 px-6 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.25)]"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingContent ? "Saving Changes..." : "Publish Content Updates"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 6: INQUIRY MANAGEMENT                                  */}
        {/* ========================================================== */}
        {activeTab === "inquiries" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/50 border border-white/10">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 ml-2" />
                <input
                  type="text"
                  placeholder="Search inquiries by name, phone, service, keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400"
                >
                  <option value="All">All Inquiries</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <button
                  onClick={fetchData}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {filteredInquiries.length === 0 ? (
              <div className="py-16 text-center text-xs font-mono text-slate-500 rounded-2xl bg-slate-900/30 border border-white/5">
                No customer inquiries match this criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInquiries.map((inq) => {
                  const greeting = `Hi ${inq.customer_name}, this is GJ Devloper regarding your inquiry for ${inq.website_type}. We'd love to connect and discuss your requirements!`;
                  const waUrl = `https://wa.me/${inq.whatsapp_number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(greeting)}`;

                  return (
                    <div
                      key={inq.id}
                      className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-base font-bold text-white">{inq.customer_name}</h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                              inq.status === "New"
                                ? "bg-sky-500/20 text-sky-300 border border-sky-400/30"
                                : inq.status === "Contacted"
                                ? "bg-purple-500/20 text-purple-300"
                                : inq.status === "In Progress"
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-emerald-500/20 text-emerald-300"
                            }`}
                          >
                            {inq.status}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            {new Date(inq.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                          <div>
                            <span className="text-slate-500">WhatsApp: </span>
                            <span className="text-sky-300 font-semibold">+{inq.whatsapp_number}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Service: </span>
                            <span className="text-slate-200">{inq.website_type}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Budget: </span>
                            <span className="text-emerald-400 font-semibold">{inq.budget}</span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-300 bg-black/40 p-3 rounded-xl border border-white/5 font-mono text-xs leading-relaxed">
                          &ldquo;{inq.project_description}&rdquo;
                        </p>
                      </div>

                      <div className="flex flex-wrap lg:flex-col items-end gap-3 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">Status:</span>
                          <select
                            value={inq.status}
                            onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/20 text-xs text-white"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Reply on WhatsApp</span>
                          </a>

                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB: E-COMMERCE ORDERS PIPELINE                            */}
        {/* ========================================================== */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white font-mono flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  <span>WhatsApp E-Commerce Orders ({orders.length})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage incoming customer order requests, review itemized products, and update fulfillment status.
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
                {["All", "New", "Contacted", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      orderStatusFilter === st
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                        : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders by Order #, Customer Name, or Phone..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Orders List */}
            {(() => {
              const filteredOrders = orders.filter((o) => {
                const matchesStatus = orderStatusFilter === "All" || o.status === orderStatusFilter;
                const matchesSearch =
                  o.order_number.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                  o.customer_name.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                  o.customer_phone.includes(orderSearchQuery);
                return matchesStatus && matchesSearch;
              });

              if (filteredOrders.length === 0) {
                return (
                  <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-white/10">
                    <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-white font-mono mb-1">No orders match criteria</h3>
                    <p className="text-xs text-slate-400">Try changing status filter or search query.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const waClean = order.customer_phone.replace(/[^\d]/g, "");
                    const customerWaUrl = `https://wa.me/${waClean}?text=${encodeURIComponent(
                      `Hello ${order.customer_name}! This is GJ Devloper regarding your order #${order.order_number}. We are reviewing your requirements.`
                    )}`;

                    return (
                      <div
                        key={order.id}
                        className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all space-y-4"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono font-black text-white">
                              #{order.order_number}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                                order.status === "New"
                                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                                  : order.status === "Confirmed"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  : order.status === "Processing"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                                  : order.status === "Shipped" || order.status === "Delivered"
                                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                                  : order.status === "Cancelled"
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                  : "bg-slate-700 text-slate-300"
                              }`}
                            >
                              {order.status}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {new Date(order.created_at).toLocaleString()}
                            </span>
                          </div>

                          {/* Quick Status Selector */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-400">Update Status:</span>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/20 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        {/* Customer & Address Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                              Customer Information
                            </span>
                            <strong className="text-white block text-sm">{order.customer_name}</strong>
                            <span className="text-slate-300 font-mono block mt-0.5">{order.customer_phone}</span>
                            <a
                              href={customerWaUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-[11px] font-mono font-bold transition-all"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Chat on WhatsApp</span>
                            </a>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                              Delivery Location
                            </span>
                            <p className="text-slate-300 leading-relaxed">{order.delivery_address}</p>
                            <span className="text-slate-400 font-mono text-[11px] block mt-1">
                              {order.city} - {order.pincode}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                              Customer Order Notes
                            </span>
                            <p className="text-slate-300 italic bg-black/30 p-2.5 rounded-xl border border-white/5">
                              {order.order_notes || "No special instructions provided."}
                            </p>
                          </div>
                        </div>

                        {/* Ordered Items Table */}
                        <div className="pt-2 border-t border-white/5">
                          <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2">
                            Order Items
                          </span>
                          <div className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-1.5 text-xs font-mono">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-slate-300">
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-medium">{item.name}</span>
                                  <span className="text-slate-500">× {item.quantity}</span>
                                </div>
                                <span className="text-white font-bold">
                                  ₹{item.subtotal.toLocaleString("en-IN")} (₹{item.price.toLocaleString("en-IN")} each)
                                </span>
                              </div>
                            ))}
                            <div className="pt-2 border-t border-white/10 flex items-center justify-between font-bold text-white text-sm">
                              <span>Total Amount:</span>
                              <span className="text-emerald-400 text-base">₹{order.total_amount.toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                        </div>

                        {/* Admin Internal Notes */}
                        <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                          <input
                            type="text"
                            defaultValue={order.admin_notes || ""}
                            id={`order-notes-${order.id}`}
                            placeholder="Add private admin notes (e.g. Contacted client, verified delivery details)..."
                            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-emerald-400"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const inputEl = document.getElementById(`order-notes-${order.id}`) as HTMLInputElement;
                              if (inputEl) handleSaveAdminOrderNotes(order.id, inputEl.value);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition-all cursor-pointer"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB: STORE PRODUCTS MANAGEMENT                             */}
        {/* ========================================================== */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white font-mono flex items-center gap-2">
                  <Package className="w-5 h-5 text-sky-400" />
                  <span>Store Products &amp; Catalog Management ({products.length})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Control product pricing, image banners, stock availability, and features displayed on the store page.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingProduct({
                    name: "",
                    category: "Web Systems",
                    description: "",
                    price: 2999,
                    original_price: 3999,
                    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
                    in_stock: 1,
                    stock_quantity: 10,
                    badge: "New",
                    features: ["Responsive Design", "WhatsApp Direct Order", "14 Days Support"],
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="rounded-2xl bg-slate-900/40 border border-white/10 overflow-hidden flex flex-col justify-between hover:border-sky-500/30 transition-all"
                >
                  <div>
                    <div className="relative h-44 w-full bg-slate-950">
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/80 text-white border border-white/10">
                          {prod.category}
                        </span>
                        {prod.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-400 text-slate-950">
                            {prod.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-base font-bold text-white font-mono mb-1 line-clamp-1">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                        {prod.description}
                      </p>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-xl font-black text-white font-mono">
                          ₹{prod.price.toLocaleString("en-IN")}
                        </span>
                        {prod.original_price && prod.original_price > prod.price && (
                          <span className="text-xs text-slate-500 line-through font-mono">
                            ₹{prod.original_price.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {/* Stock availability toggle */}
                      <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-white/5">
                        <span className="text-slate-400">Stock Availability:</span>
                        <button
                          onClick={() => handleToggleProductStock(prod)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            prod.in_stock === 1
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                          }`}
                        >
                          {prod.in_stock === 1 ? "In Stock (Available)" : "Out of Stock"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingProduct(prod)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Product Edit / Add Modal */}
            {editingProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div className="bg-[#091024] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white font-mono">
                      {editingProduct.id ? "Edit Product" : "Add New Product"}
                    </h3>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-mono">
                    <div>
                      <label className="text-slate-400 block mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        placeholder="e.g. WhatsApp Restaurant QR Menu"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-400 block mb-1">Category *</label>
                        <select
                          value={editingProduct.category || "Web Systems"}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white"
                        >
                          <option value="Web Systems">Web Systems</option>
                          <option value="Hospitality & Dining">Hospitality &amp; Dining</option>
                          <option value="Portfolios">Portfolios</option>
                          <option value="E-Commerce">E-Commerce</option>
                          <option value="Real Estate">Real Estate</option>
                          <option value="Custom Digital Solution">Custom Digital Solution</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Badge / Tag (Optional)</label>
                        <input
                          type="text"
                          value={editingProduct.badge || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                          placeholder="e.g. Best Seller, High ROI"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-slate-400 block mb-1">Selling Price (₹) *</label>
                        <input
                          type="number"
                          required
                          value={editingProduct.price || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                          placeholder="2999"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Original Price (₹)</label>
                        <input
                          type="number"
                          value={editingProduct.original_price || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, original_price: Number(e.target.value) })}
                          placeholder="3999"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Stock Availability</label>
                        <select
                          value={editingProduct.in_stock === 0 ? "0" : "1"}
                          onChange={(e) => setEditingProduct({ ...editingProduct, in_stock: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white"
                        >
                          <option value="1">In Stock (Active)</option>
                          <option value="0">Out of Stock</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Image URL *</label>
                      <input
                        type="url"
                        required
                        value={editingProduct.image_url || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Short Description *</label>
                      <textarea
                        rows={3}
                        required
                        value={editingProduct.description || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        placeholder="Describe key capabilities and what's delivered..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white resize-none"
                      />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                      >
                        Save Product
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB: PORTFOLIO MANAGEMENT                                  */}
        {/* ========================================================== */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Portfolio Projects</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Manage the showcase projects featured on the homepage.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl bg-slate-900/40 border border-white/10 flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">{proj.title}</h4>
                    <p className="text-xs text-slate-400 mb-3">{proj.summary}</p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="text-sky-300">Category: {proj.service_category || "Custom Build"}</span>
                    <span>{proj.tech_stack?.length || 0} Tech Tags</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 8: SECURITY & ADMIN PROFILE                            */}
        {/* ========================================================== */}
        {activeTab === "security" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-2xl">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-6 h-6 text-sky-400" />
                <h3 className="text-xl font-bold text-white">Admin Account Security</h3>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="admin@gjdevloper.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                    Current Password (Required to authorize changes)
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                    New Password (Leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_20px_rgba(56,189,248,0.25)]"
                >
                  {savingProfile ? "Updating Credentials..." : "Update Admin Password & Email"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
