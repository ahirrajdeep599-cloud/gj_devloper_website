import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import os from "os";
import bcrypt from "bcryptjs";
import { gjServices } from "@/data/services";
import { sampleProjectsData } from "@/data/projects";

// Ensure data directory exists (Use /tmp on Vercel/Serverless to avoid EROFS read-only filesystem error)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const dataDir = isServerless
  ? path.join(os.tmpdir(), "data")
  : path.join(process.cwd(), "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "gj_devloper.db");

// Global cached database connection across Next.js worker threads
declare global {
  var _gj_sqlite_db: Database.Database | undefined;
}

if (!global._gj_sqlite_db) {
  global._gj_sqlite_db = new Database(dbPath, { timeout: 10000 });
  if (isServerless) {
    global._gj_sqlite_db.pragma("journal_mode = MEMORY");
  } else {
    global._gj_sqlite_db.pragma("journal_mode = WAL");
  }
  global._gj_sqlite_db.pragma("busy_timeout = 10000");

  global._gj_sqlite_db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pricing_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subtitle TEXT,
      price TEXT NOT NULL,
      price_label TEXT DEFAULT 'Starting price',
      category TEXT DEFAULT 'Website',
      badge TEXT DEFAULT '',
      description TEXT,
      features TEXT NOT NULL, -- JSON array
      whatsapp_preset TEXT,
      is_popular INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      short_description TEXT NOT NULL,
      deliverables TEXT NOT NULL, -- JSON array
      starting_price TEXT NOT NULL,
      icon_type TEXT NOT NULL,
      badge TEXT NOT NULL,
      whatsapp_preset TEXT NOT NULL,
      gradient TEXT DEFAULT 'from-blue-600 via-indigo-600 to-sky-500',
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS portfolio_projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      client_badge TEXT NOT NULL,
      service_category TEXT NOT NULL,
      is_sample INTEGER DEFAULT 1,
      sample_notice TEXT NOT NULL,
      summary TEXT NOT NULL,
      description TEXT NOT NULL,
      challenge TEXT NOT NULL,
      solution TEXT NOT NULL,
      metrics TEXT NOT NULL, -- JSON array
      tech_stack TEXT NOT NULL, -- JSON array
      gradient TEXT NOT NULL,
      accent_color TEXT DEFAULT '#38bdf8',
      preview_type TEXT DEFAULT 'webapp',
      demo_url TEXT DEFAULT '',
      whatsapp_prompt TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      whatsapp_number TEXT NOT NULL,
      website_type TEXT NOT NULL,
      package_name TEXT DEFAULT '',
      budget TEXT NOT NULL,
      project_description TEXT NOT NULL,
      status TEXT DEFAULT 'New', -- 'New', 'Contacted', 'In Progress', 'Completed'
      whatsapp_sent_status TEXT DEFAULT 'Pending',
      source TEXT DEFAULT 'Web Form',
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      image_url TEXT NOT NULL,
      in_stock INTEGER NOT NULL DEFAULT 1,
      stock_quantity INTEGER NOT NULL DEFAULT 10,
      badge TEXT DEFAULT '',
      features TEXT DEFAULT '[]',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      city TEXT NOT NULL,
      pincode TEXT NOT NULL,
      order_notes TEXT,
      items TEXT NOT NULL, -- JSON array of { id, name, price, quantity, subtotal }
      subtotal REAL NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'New', -- 'New', 'Contacted', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
      whatsapp_sent_status TEXT DEFAULT 'Sent',
      admin_notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe table column alterations for backward compatibility
  try {
    global._gj_sqlite_db.exec("ALTER TABLE admins ADD COLUMN email TEXT;");
  } catch {
    // Column already exists
  }
  try {
    global._gj_sqlite_db.exec("ALTER TABLE orders ADD COLUMN admin_notes TEXT DEFAULT '';");
  } catch {
    // Column already exists
  }
  try {
    global._gj_sqlite_db.exec("ALTER TABLE services ADD COLUMN number TEXT DEFAULT '01';");
  } catch {
    // Column already exists
  }
  try {
    global._gj_sqlite_db.exec("ALTER TABLE services ADD COLUMN icon_type TEXT DEFAULT 'Briefcase';");
  } catch {
    // Column already exists
  }
  try {
    global._gj_sqlite_db.exec("ALTER TABLE services ADD COLUMN whatsapp_preset TEXT DEFAULT '';");
  } catch {
    // Column already exists
  }
  try {
    global._gj_sqlite_db.exec("ALTER TABLE services ADD COLUMN gradient TEXT DEFAULT 'from-blue-600 via-indigo-600 to-sky-500';");
  } catch {
    // Column already exists
  }
  try {
    global._gj_sqlite_db.exec("ALTER TABLE services ADD COLUMN is_active INTEGER DEFAULT 1;");
  } catch {
    // Column already exists
  }
  try {
    global._gj_sqlite_db.exec("ALTER TABLE services ADD COLUMN sort_order INTEGER DEFAULT 0;");
  } catch {
    // Column already exists
  }

  // 1. Seed primary admin from secure environment variables
  const adminUsername = (process.env.ADMIN_USERNAME || "admin").trim();
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@gjdevloper.com").trim();
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;

  if (adminUsername && adminPassword) {
    // Remove legacy default 'admin' account if a custom ADMIN_USERNAME is configured
    if (adminUsername !== "admin") {
      global._gj_sqlite_db.prepare("DELETE FROM admins WHERE username = 'admin'").run();
    }

    const existingAdmin = global._gj_sqlite_db
      .prepare("SELECT id FROM admins WHERE username = ?")
      .get(adminUsername) as { id: number } | undefined;

    if (!existingAdmin) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(adminPassword, salt);
      global._gj_sqlite_db
        .prepare(
          "INSERT OR IGNORE INTO admins (email, username, password_hash) VALUES (?, ?, ?)"
        )
        .run(adminEmail, adminUsername, hash);
    }
  }

  // 2. Seed default settings if empty
  const defaultSettings: Record<string, string> = {
    whatsapp_number: "919876543210",
    whatsapp_country_code: "+91",
    contact_email: "contact@gjdevloper.com",
    contact_phone: "+91 98765 43210",
    agency_name: "GJ Devloper",
    hero_heading: "WE CODE. WE CREATE. WE BUILD DIGITAL EXPERIENCES.",
    hero_subtitle: "From creative ideas to powerful digital solutions, GJ Devloper transforms businesses through modern web development.",
    about_heading: "MORE THAN JUST A WEBSITE. WE BUILD DIGITAL SOLUTIONS.",
    about_description: "At GJ Devloper, we believe modern businesses deserve more than cookie-cutter templates that slow down browsers and fail to convert. We are a specialized web development studio focused on crafting high-performance, responsive, and functional digital experiences.",
    cta_heading: "Have an Idea? Let's Build It!",
    cta_subtitle: "From initial sketch to high-speed digital reality, let's bring your vision to life.",
    footer_tagline: "We design and engineer bespoke business websites, high-conversion e-commerce, restaurant & hotel portals, QR menus, and custom web applications for ambitious brands.",
    social_github: "https://github.com",
    social_twitter: "https://twitter.com",
    social_linkedin: "https://linkedin.com",
    social_instagram: "https://instagram.com",
  };

  const insertSettingStmt = global._gj_sqlite_db.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)"
  );
  for (const [key, value] of Object.entries(defaultSettings)) {
    insertSettingStmt.run(key, value);
  }

  // 3. Seed default pricing plans if empty
  const planCount = global._gj_sqlite_db
    .prepare("SELECT COUNT(*) as count FROM pricing_plans")
    .get() as { count: number };

  if (planCount.count === 0) {
    const insertPlanStmt = global._gj_sqlite_db.prepare(`
      INSERT INTO pricing_plans (
        id, name, subtitle, price, price_label, category, badge, description, features, whatsapp_preset, is_popular, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialPlans = [
      {
        id: "basic",
        name: "Basic Website",
        subtitle: "For personal and small business websites",
        price: "₹1,999",
        price_label: "Starting price",
        category: "Business Website",
        badge: "Starter Suite",
        description: "Clean, responsive, and fast digital presence designed to establish your brand online with immediate credibility.",
        features: JSON.stringify([
          "Modern Mobile-Responsive Layout",
          "Up to 3 - 5 Content Pages / Views",
          "Contact Form & WhatsApp Quick Button",
          "Fast Page Loading Speed",
          "Basic SEO Meta Tags & Google Indexing",
          "Social Media & Map Links Integration",
          "14 Days Post-Launch Support",
        ]),
        whatsapp_preset: "Hi GJ Devloper, I'm interested in the Basic Website Plan (Starting at ₹1,999). Can you share more details?",
        is_popular: 0,
        is_active: 1,
        sort_order: 1,
      },
      {
        id: "professional",
        name: "Professional Website",
        subtitle: "For growing businesses & ambitious brands",
        price: "₹4,999",
        price_label: "Starting price",
        category: "Business Website",
        badge: "Most Popular",
        description: "High-impact web presence engineered to drive conversions, showcase offerings, and outpace direct market competitors.",
        features: JSON.stringify([
          "Everything in Basic, plus:",
          "Custom UI/UX Theme & Dark Mode Aesthetic",
          "Up to 8 - 12 Interactive Pages / Sections",
          "Dynamic Product / Service Catalog or QR Menu",
          "Table Booking or Service Quote Calculators",
          "Advanced Core Web Vitals & Technical SEO",
          "Google Analytics 4 & Conversion Tracking",
          "30 Days Post-Launch Warranty & Support",
        ]),
        whatsapp_preset: "Hi GJ Devloper, I'm interested in the Professional Website Plan (Starting at ₹4,999). Let's discuss requirements!",
        is_popular: 1,
        is_active: 1,
        sort_order: 2,
      },
      {
        id: "premium",
        name: "Premium Website",
        subtitle: "For advanced business websites & custom solutions",
        price: "₹9,999",
        price_label: "Starting price",
        category: "Custom Web Applications",
        badge: "Enterprise Grade",
        description: "Bespoke full-stack web applications, 3D WebGL experiences, or complex digital management systems built to dominate your industry.",
        features: JSON.stringify([
          "Everything in Professional, plus:",
          "Custom Web App or Headless E-Commerce System",
          "Interactive 3D / WebGL Animated Elements",
          "Secure User Authentication & Database Storage",
          "WhatsApp Direct Ordering & Instant Checkout Engine",
          "Automated WhatsApp / Email Notification Alerts",
          "Full Source Code & GitHub Handover",
          "Priority 60 Days Hypercare Support",
        ]),
        whatsapp_preset: "Hi GJ Devloper, I'm interested in the Premium Website Plan (Starting at ₹9,999). Let's schedule a call!",
        is_popular: 0,
        is_active: 1,
        sort_order: 3,
      },
    ];

    for (const plan of initialPlans) {
      insertPlanStmt.run(
        plan.id,
        plan.name,
        plan.subtitle,
        plan.price,
        plan.price_label,
        plan.category,
        plan.badge,
        plan.description,
        plan.features,
        plan.whatsapp_preset,
        plan.is_popular,
        plan.is_active,
        plan.sort_order
      );
    }
  }

  // 4. Seed default services if empty
  const serviceCount = global._gj_sqlite_db
    .prepare("SELECT COUNT(*) as count FROM services")
    .get() as { count: number };

  if (serviceCount.count === 0) {
    const insertServiceStmt = global._gj_sqlite_db.prepare(`
      INSERT INTO services (
        id, number, title, category, short_description, deliverables, starting_price, icon_type, badge, whatsapp_preset, gradient, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    gjServices.forEach((svc, idx) => {
      insertServiceStmt.run(
        svc.id,
        svc.number,
        svc.title,
        svc.category,
        svc.shortDescription,
        JSON.stringify(svc.deliverables),
        svc.startingPrice,
        svc.iconType,
        svc.badge,
        svc.whatsappPreset,
        svc.gradient,
        idx + 1
      );
    });
  }

  // 5. Seed default sample portfolio projects if empty
  const projectCount = global._gj_sqlite_db
    .prepare("SELECT COUNT(*) as count FROM portfolio_projects")
    .get() as { count: number };

  if (projectCount.count === 0) {
    const insertProjectStmt = global._gj_sqlite_db.prepare(`
      INSERT INTO portfolio_projects (
        id, title, client_badge, service_category, is_sample, sample_notice, summary, description, challenge, solution, metrics, tech_stack, gradient, accent_color, preview_type, demo_url, whatsapp_prompt, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    sampleProjectsData.forEach((proj, idx) => {
      insertProjectStmt.run(
        proj.id,
        proj.title,
        proj.clientBadge,
        proj.serviceCategory,
        proj.isSample ? 1 : 0,
        proj.sampleNotice,
        proj.summary,
        proj.description,
        proj.challenge,
        proj.solution,
        JSON.stringify(proj.metrics),
        JSON.stringify(proj.techStack),
        proj.gradient,
        proj.accentColor,
        proj.previewMockupType,
        "",
        proj.whatsappPrompt,
        idx + 1
      );
    });
  }

  // 6. Seed default products if empty
  const productCount = global._gj_sqlite_db
    .prepare("SELECT COUNT(*) as count FROM products")
    .get() as { count: number };

  if (productCount.count === 0) {
    const insertProductStmt = global._gj_sqlite_db.prepare(`
      INSERT INTO products (
        name, slug, category, description, price, original_price, image_url, in_stock, stock_quantity, badge, features, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialProducts = [
      {
        name: "Custom Business Website Blueprint",
        slug: "custom-business-website-blueprint",
        category: "Web Systems",
        description: "Modern, high-performance responsive web presence tailored for brands. Includes 5 custom views, dark/light aesthetics, WhatsApp lead routing, and 100/100 Core Web Vitals.",
        price: 3499,
        original_price: 4999,
        image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        in_stock: 1,
        stock_quantity: 15,
        badge: "Best Seller",
        features: JSON.stringify(["5 Dynamic Pages", "WhatsApp Instant Inquiries", "100/100 Mobile Performance", "14-Day Free Support"]),
        sort_order: 1,
      },
      {
        name: "WhatsApp Restaurant QR Menu & Ordering Portal",
        slug: "whatsapp-restaurant-qr-menu-portal",
        category: "Hospitality & Dining",
        description: "Contactless digital QR menu with table selector, instant cart, and 1-click WhatsApp order dispatcher straight to the kitchen desk.",
        price: 4999,
        original_price: 6999,
        image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        in_stock: 1,
        stock_quantity: 10,
        badge: "High ROI",
        features: JSON.stringify(["Digital Table Selector", "Instant WhatsApp Order Dispatch", "Item Variations & Addons", "Zero Transaction Fee"]),
        sort_order: 2,
      },
      {
        name: "Agency & Creative Portfolio Dark UI Template",
        slug: "agency-creative-portfolio-dark-ui",
        category: "Portfolios",
        description: "Futuristic dark UI web portfolio with 3D particles, project modal showcases, live coding animations, and dynamic customer inquiries pipeline.",
        price: 2999,
        original_price: 3999,
        image_url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
        in_stock: 1,
        stock_quantity: 20,
        badge: "Featured",
        features: JSON.stringify(["3D WebGL Canvas Sphere", "Interactive Code Window", "Case Studies Showcase", "Admin Management Panel"]),
        sort_order: 3,
      },
      {
        name: "Direct-to-WhatsApp E-Commerce Storefront System",
        slug: "direct-whatsapp-ecommerce-storefront",
        category: "E-Commerce",
        description: "Frictionless online storefront with client-side persistent cart, automatic subtotal calculations, instant WhatsApp order generator, and SQLite inventory management.",
        price: 5999,
        original_price: 8499,
        image_url: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80",
        in_stock: 1,
        stock_quantity: 8,
        badge: "Zero Gateway Fees",
        features: JSON.stringify(["Full Cart & Checkout System", "Instant Order to WhatsApp", "SQLite Order Storage", "Admin Order Pipeline"]),
        sort_order: 4,
      },
      {
        name: "Real Estate Property Listings Portal",
        slug: "real-estate-property-listings-portal",
        category: "Real Estate",
        description: "Editorial luxury property presentation portal with interactive virtual galleries, neighborhood guides, and direct broker WhatsApp appointment booking.",
        price: 4499,
        original_price: 5999,
        image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
        in_stock: 1,
        stock_quantity: 12,
        badge: "New",
        features: JSON.stringify(["Property Filter by Location & Price", "HD Photo & Floorplan Showcase", "Direct WhatsApp Broker Routing", "Mobile-Optimized"]),
        sort_order: 5,
      },
      {
        name: "Interactive Services Cost Estimator Widget",
        slug: "interactive-services-cost-estimator-widget",
        category: "Web Systems",
        description: "Interactive real-time cost calculation widget with project type selector, addon toggles, instant total calculations, and WhatsApp lead handoff.",
        price: 1999,
        original_price: 2999,
        image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        in_stock: 1,
        stock_quantity: 25,
        badge: "Popular Addon",
        features: JSON.stringify(["Real-time Multiplier Logic", "Smooth Slider Controls", "Direct WhatsApp Pre-fill", "Embeddable Anywhere"]),
        sort_order: 6,
      },
    ];

    for (const prod of initialProducts) {
      insertProductStmt.run(
        prod.name,
        prod.slug,
        prod.category,
        prod.description,
        prod.price,
        prod.original_price,
        prod.image_url,
        prod.in_stock,
        prod.stock_quantity,
        prod.badge,
        prod.features,
        prod.sort_order
      );
    }
  }
}

const db: Database.Database = global._gj_sqlite_db;

export default db;
