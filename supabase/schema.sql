-- ==============================================================================
-- GJ DEVLOPER — IDEMPOTENT & HARDENED PRODUCTION DATABASE SCHEMA
-- File: supabase/schema.sql
-- ==============================================================================
-- Architecture: WhatsApp Direct-to-Chat E-Commerce & Full-Stack Digital Agency
-- Payment Architecture: Zero Gateway Integrations (No Stripe, PayPal, Razorpay)
-- Security: Server-Side Price Verification, Anti-Privilege Escalation, Safe RLS
-- Idempotency: Safe to execute repeatedly without 42710 duplicate object errors
-- ==============================================================================

-- ==============================================================================
-- 1. EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. HELPER FUNCTIONS & ADMIN AUTHORIZATION
-- ==============================================================================

-- Automatic updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Secure Admin check function
-- Handles direct SQL Editor execution (postgres), service_role, and authenticated admin users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_jwt_role TEXT;
BEGIN
  -- 1. Direct PostgreSQL administration (Supabase SQL Editor, migrations, superuser)
  IF CURRENT_USER IN ('postgres', 'supabase_admin', 'dashboard_user') THEN
    RETURN TRUE;
  END IF;

  -- 2. Internal Supabase service_role bypass
  BEGIN
    v_jwt_role := CURRENT_SETTING('request.jwt.claim.role', true);
  EXCEPTION WHEN OTHERS THEN
    v_jwt_role := NULL;
  END;

  IF v_jwt_role = 'service_role' THEN
    RETURN TRUE;
  END IF;

  -- 3. Unauthenticated public visitors are never admins
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 4. Verify admin role assigned in public.profiles table
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ==============================================================================
-- 3. PROFILES TABLE (Linked to auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Anti-Privilege Escalation Trigger Function
-- Blocks customers from changing their own role to admin or altering user IDs
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only confirmed administrators or trusted SQL Editor sessions can alter user roles
  IF (OLD.role IS DISTINCT FROM NEW.role) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can modify account roles.';
  END IF;

  -- Prevent altering profile ownership ID
  IF (OLD.id IS DISTINCT FROM NEW.id) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied: Profile ID cannot be altered.';
  END IF;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

DROP TRIGGER IF EXISTS update_profiles_timestamp ON public.profiles;
CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Automatic Profile Creation Trigger on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'customer' -- All public signups are strictly customers
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ==============================================================================
-- 4. CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

DROP TRIGGER IF EXISTS update_categories_timestamp ON public.categories;
CREATE TRIGGER update_categories_timestamp
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- 5. PRODUCTS TABLE (Store Catalog)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2) CHECK (original_price >= 0),
  image_url TEXT NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  stock_quantity INT NOT NULL DEFAULT 10 CHECK (stock_quantity >= 0),
  badge TEXT DEFAULT '',
  features JSONB DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);

DROP TRIGGER IF EXISTS update_products_timestamp ON public.products;
CREATE TRIGGER update_products_timestamp
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- 6. ORDERS TABLE (WhatsApp Direct Ordering Engine)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  order_notes TEXT,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN (
    'New',
    'Contacted',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled'
  )),
  whatsapp_sent_status TEXT DEFAULT 'Sent',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

DROP TRIGGER IF EXISTS update_orders_timestamp ON public.orders;
CREATE TRIGGER update_orders_timestamp
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- 7. ORDER ITEMS TABLE (Itemized Products Per Order)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);

-- ==============================================================================
-- 8. WEBSITE SETTINGS TABLE (Copy & WhatsApp Number Control)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.website_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE, -- Allows distinguishing public settings from private configurations
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_settings_timestamp ON public.website_settings;
CREATE TRIGGER update_settings_timestamp
  BEFORE UPDATE ON public.website_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- 9. PRICING PACKAGES TABLE (Dynamic Agency Plans)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pricing_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subtitle TEXT,
  price TEXT NOT NULL,
  price_label TEXT DEFAULT 'Starting price',
  category TEXT DEFAULT 'Website',
  badge TEXT DEFAULT '',
  description TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  whatsapp_preset TEXT,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_active ON public.pricing_packages(is_active);

DROP TRIGGER IF EXISTS update_pricing_timestamp ON public.pricing_packages;
CREATE TRIGGER update_pricing_timestamp
  BEFORE UPDATE ON public.pricing_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- 10. SECURE SERVER-SIDE ORDER CREATION (Prevents Client Price Tampering)
-- ==============================================================================
-- Computes verified product prices exclusively on the server from public.products.
-- Aggregates duplicate items, validates quantities and stock, generates unique order numbers.
CREATE OR REPLACE FUNCTION public.place_order_secure(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_delivery_address TEXT,
  p_city TEXT,
  p_pincode TEXT,
  p_order_notes TEXT DEFAULT NULL,
  p_items JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_subtotal NUMERIC(10, 2) := 0;
  v_total NUMERIC(10, 2) := 0;
  v_item RECORD;
  v_prod RECORD;
  v_item_subtotal NUMERIC(10, 2);
  v_customer_id UUID;
  v_order_item_list JSONB := '[]'::jsonb;
BEGIN
  -- A. Validation of Customer Details
  IF p_customer_name IS NULL OR length(trim(p_customer_name)) < 2 THEN
    RAISE EXCEPTION 'Validation Error: Full name must be at least 2 characters.';
  END IF;

  IF p_customer_phone IS NULL OR length(trim(p_customer_phone)) < 7 THEN
    RAISE EXCEPTION 'Validation Error: Valid contact phone/WhatsApp number is required.';
  END IF;

  IF p_delivery_address IS NULL OR length(trim(p_delivery_address)) < 5 THEN
    RAISE EXCEPTION 'Validation Error: Delivery address must be at least 5 characters.';
  END IF;

  IF p_city IS NULL OR length(trim(p_city)) < 2 THEN
    RAISE EXCEPTION 'Validation Error: City name is required.';
  END IF;

  IF p_pincode IS NULL OR length(trim(p_pincode)) < 3 THEN
    RAISE EXCEPTION 'Validation Error: Valid postal pincode is required.';
  END IF;

  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Validation Error: Cart cannot be empty.';
  END IF;

  IF jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'Validation Error: Cart exceeds maximum allowed limit of 50 items.';
  END IF;

  -- B. Capture authenticated customer UID if available (or NULL for guest checkout)
  v_customer_id := auth.uid();

  -- C. Generate unique, human-readable order number (Format: GJ-ORD-YYMMDD-XXXXXX)
  v_order_number := 'GJ-ORD-' || to_char(NOW(), 'YYMMDD') || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));

  -- D. Server-Side Price Verification with Duplicate Aggregation
  FOR v_item IN
    SELECT
      (item->>'product_id')::UUID AS product_id,
      SUM(COALESCE((item->>'quantity')::INT, 0)) AS quantity
    FROM jsonb_array_elements(p_items) AS item
    GROUP BY (item->>'product_id')::UUID
  LOOP
    IF v_item.quantity <= 0 OR v_item.quantity > 500 THEN
      RAISE EXCEPTION 'Validation Error: Invalid quantity specified for product %', v_item.product_id;
    END IF;

    -- Look up canonical price & stock strictly from the database
    SELECT id, name, price, in_stock, stock_quantity
    INTO v_prod
    FROM public.products
    WHERE id = v_item.product_id AND is_active = TRUE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product with ID % is inactive or does not exist.', v_item.product_id;
    END IF;

    IF NOT v_prod.in_stock THEN
      RAISE EXCEPTION 'Product "%" is currently out of stock.', v_prod.name;
    END IF;

    IF v_prod.stock_quantity < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for "%". Requested %, available %.', v_prod.name, v_item.quantity, v_prod.stock_quantity;
    END IF;

    v_item_subtotal := round(v_prod.price * v_item.quantity, 2);
    v_subtotal := v_subtotal + v_item_subtotal;
  END LOOP;

  -- Direct WhatsApp Ordering: zero hidden surcharge or gateway fee
  v_total := v_subtotal;

  -- E. Insert Verified Order Header
  INSERT INTO public.orders (
    order_number,
    customer_id,
    customer_name,
    customer_phone,
    delivery_address,
    city,
    pincode,
    order_notes,
    subtotal,
    total_amount,
    status,
    whatsapp_sent_status
  ) VALUES (
    v_order_number,
    v_customer_id,
    trim(p_customer_name),
    trim(p_customer_phone),
    trim(p_delivery_address),
    trim(p_city),
    trim(p_pincode),
    NULLIF(trim(p_order_notes), ''),
    v_subtotal,
    v_total,
    'New',
    'Sent'
  )
  RETURNING id INTO v_order_id;

  -- F. Insert Itemized Products with Server-Side Canonical Prices
  FOR v_item IN
    SELECT
      (item->>'product_id')::UUID AS product_id,
      SUM(COALESCE((item->>'quantity')::INT, 0)) AS quantity
    FROM jsonb_array_elements(p_items) AS item
    GROUP BY (item->>'product_id')::UUID
  LOOP
    SELECT id, name, price
    INTO v_prod
    FROM public.products
    WHERE id = v_item.product_id;

    v_item_subtotal := round(v_prod.price * v_item.quantity, 2);

    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      unit_price,
      quantity,
      subtotal
    ) VALUES (
      v_order_id,
      v_prod.id,
      v_prod.name,
      v_prod.price,
      v_item.quantity,
      v_item_subtotal
    );

    v_order_item_list := v_order_item_list || jsonb_build_object(
      'product_id', v_prod.id,
      'product_name', v_prod.name,
      'unit_price', v_prod.price,
      'quantity', v_item.quantity,
      'subtotal', v_item_subtotal
    );
  END LOOP;

  -- G. Return Order Confirmation Payload for WhatsApp Link Construction
  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'customer_name', trim(p_customer_name),
    'customer_phone', trim(p_customer_phone),
    'subtotal', v_subtotal,
    'total_amount', v_total,
    'items', v_order_item_list,
    'message', 'Your order details are ready on WhatsApp. Send the message to complete your order request.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Grant execution to all clients (anon, authenticated, service_role)
GRANT EXECUTE ON FUNCTION public.place_order_secure(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated, service_role;

-- ==============================================================================
-- 11. SECURE FIRST-ADMIN BOOTSTRAP PROCEDURE
-- ==============================================================================
-- Dedicated stored procedure to promote an admin account safely from SQL Editor.
-- Accessible only by PostgreSQL superusers and service_role.
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(p_email TEXT)
RETURNS TEXT AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Strict caller verification: only postgres superuser or existing admin can execute
  IF NOT (CURRENT_USER IN ('postgres', 'supabase_admin') OR public.is_admin()) THEN
    RAISE EXCEPTION 'Access Denied: You must be an administrator to execute this procedure.';
  END IF;

  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = lower(trim(p_email));
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile with email "%" not found. The user must sign up first.', p_email;
  END IF;

  UPDATE public.profiles
  SET role = 'admin', updated_at = NOW()
  WHERE id = v_user_id;

  RETURN 'Success: User ' || p_email || ' has been promoted to administrator.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.promote_user_to_admin(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.promote_user_to_admin(TEXT) TO postgres, service_role;

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_packages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- A. PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- B. CATEGORIES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can manage categories" ON public.categories;
CREATE POLICY "Only admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- C. PRODUCTS POLICIES
-- ------------------------------------------------------------------------------
-- Public users can view active products only; admins can view all products
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Only admins can manage products" ON public.products;
CREATE POLICY "Only admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- D. ORDERS POLICIES
-- ------------------------------------------------------------------------------
-- Direct table INSERT is restricted to admins/service_role.
-- Customers place orders through place_order_secure() which guarantees canonical prices.
DROP POLICY IF EXISTS "Only authorized systems can insert orders directly" ON public.orders;
CREATE POLICY "Only authorized systems can insert orders directly"
  ON public.orders FOR INSERT
  WITH CHECK (public.is_admin());

-- Customers can view only their own orders; admins can view all orders
DROP POLICY IF EXISTS "Customers view own orders, admins view all" ON public.orders;
CREATE POLICY "Customers view own orders, admins view all"
  ON public.orders FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = customer_id)
    OR public.is_admin()
  );

-- Only admins can update order status, delivery, or internal notes
DROP POLICY IF EXISTS "Only admins can update orders" ON public.orders;
CREATE POLICY "Only admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete orders
DROP POLICY IF EXISTS "Only admins can delete orders" ON public.orders;
CREATE POLICY "Only admins can delete orders"
  ON public.orders FOR DELETE
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- E. ORDER ITEMS POLICIES
-- ------------------------------------------------------------------------------
-- Direct insert restricted to admins/service_role (place_order_secure handles order items)
DROP POLICY IF EXISTS "Only authorized systems can insert order items directly" ON public.order_items;
CREATE POLICY "Only authorized systems can insert order items directly"
  ON public.order_items FOR INSERT
  WITH CHECK (public.is_admin());

-- Customers can only view items belonging to their own orders; admins view all
DROP POLICY IF EXISTS "Customers view own order items, admins view all" ON public.order_items;
CREATE POLICY "Customers view own order items, admins view all"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND ((auth.uid() IS NOT NULL AND orders.customer_id = auth.uid()) OR public.is_admin())
    )
  );

-- Only admins can modify or delete order items
DROP POLICY IF EXISTS "Only admins can manage order items" ON public.order_items;
CREATE POLICY "Only admins can manage order items"
  ON public.order_items FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- F. WEBSITE SETTINGS POLICIES
-- ------------------------------------------------------------------------------
-- Public users can view only non-sensitive settings (is_public = true)
DROP POLICY IF EXISTS "Public can view public settings only" ON public.website_settings;
CREATE POLICY "Public can view public settings only"
  ON public.website_settings FOR SELECT
  USING (is_public = true OR public.is_admin());

-- Only admins can modify or add website settings
DROP POLICY IF EXISTS "Only admins can manage website settings" ON public.website_settings;
CREATE POLICY "Only admins can manage website settings"
  ON public.website_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- G. PRICING PACKAGES POLICIES
-- ------------------------------------------------------------------------------
-- Public users can view active packages only; admins view all
DROP POLICY IF EXISTS "Public can view active pricing packages" ON public.pricing_packages;
CREATE POLICY "Public can view active pricing packages"
  ON public.pricing_packages FOR SELECT
  USING (is_active = true OR public.is_admin());

-- Only admins can modify pricing packages
DROP POLICY IF EXISTS "Only admins can manage pricing packages" ON public.pricing_packages;
CREATE POLICY "Only admins can manage pricing packages"
  ON public.pricing_packages FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 13. IDEMPOTENT SEED DATA (Prevents Duplicate Rows)
-- ==============================================================================

-- Seed Categories (Idempotent upsert)
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Web Systems', 'web-systems', 'High-performance web applications and bespoke software blueprints', 1),
  ('Hospitality & Dining', 'hospitality-dining', 'Contactless QR menus and direct WhatsApp ordering for restaurants & cafes', 2),
  ('Portfolios', 'portfolios', 'Futuristic dark UI creative portfolios with interactive 3D and project showcases', 3),
  ('E-Commerce', 'ecommerce', 'Frictionless direct-to-WhatsApp storefronts with persistent carts and zero gateway fees', 4),
  ('Real Estate', 'real-estate', 'Luxury property showcase portals with interactive galleries and direct broker chat', 5)
ON CONFLICT (name) DO UPDATE SET
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- Seed Default Settings (Placeholders clearly designated for Admin Panel customization)
INSERT INTO public.website_settings (key, value, description, is_public) VALUES
  ('whatsapp_number', '919876543210', 'Primary WhatsApp number for inquiries and orders (Configurable via Admin Panel)', TRUE),
  ('whatsapp_country_code', '+91', 'Country calling code for WhatsApp number (Configurable via Admin Panel)', TRUE),
  ('contact_email', 'contact@gjdevloper.com', 'Public contact email address (Configurable via Admin Panel)', TRUE),
  ('contact_phone', '+91 98765 43210', 'Public phone display number (Configurable via Admin Panel)', TRUE),
  ('agency_name', 'GJ Devloper', 'Agency and brand display name', TRUE),
  ('hero_heading', 'WE CODE. WE CREATE. WE BUILD DIGITAL EXPERIENCES.', 'Main Hero section headline', TRUE),
  ('hero_subtitle', 'From creative ideas to powerful digital solutions, GJ Devloper transforms businesses through modern web development.', 'Main Hero section subtitle', TRUE)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  is_public = EXCLUDED.is_public;

-- Seed Default Pricing Packages (Idempotent upsert)
INSERT INTO public.pricing_packages (
  id, name, subtitle, price, price_label, category, badge, description, features, whatsapp_preset, is_popular, is_active, sort_order
) VALUES
  (
    'basic',
    'Basic Website',
    'For personal and small business websites',
    '₹1,999',
    'Starting price',
    'Business Website',
    'Starter Suite',
    'Clean, responsive, and fast digital presence designed to establish your brand online with immediate credibility.',
    '["Modern Mobile-Responsive Layout", "Up to 3 - 5 Content Pages / Views", "Contact Form & WhatsApp Quick Button", "Fast Page Loading Speed", "Basic SEO Meta Tags & Google Indexing", "Social Media & Map Links Integration", "14 Days Post-Launch Support"]'::jsonb,
    'Hi GJ Devloper, I''m interested in the Basic Website Plan (Starting at ₹1,999). Can you share more details?',
    FALSE,
    TRUE,
    1
  ),
  (
    'professional',
    'Professional Website',
    'For growing businesses & ambitious brands',
    '₹4,999',
    'Starting price',
    'Business Website',
    'Most Popular',
    'High-impact web presence engineered to drive conversions, showcase offerings, and outpace direct market competitors.',
    '["Everything in Basic, plus:", "Custom UI/UX Theme & Dark Mode Aesthetic", "Up to 8 - 12 Interactive Pages / Sections", "Dynamic Product / Service Catalog or QR Menu", "Table Booking or Service Quote Calculators", "Advanced Core Web Vitals & Technical SEO", "Google Analytics 4 & Conversion Tracking", "30 Days Post-Launch Warranty & Support"]'::jsonb,
    'Hi GJ Devloper, I''m interested in the Professional Website Plan (Starting at ₹4,999). Let''s discuss requirements!',
    TRUE,
    TRUE,
    2
  ),
  (
    'premium',
    'Premium Website',
    'For advanced business websites & custom solutions',
    '₹9,999',
    'Starting price',
    'Custom Web Applications',
    'Enterprise Grade',
    'Bespoke full-stack web applications, 3D WebGL experiences, or complex digital management systems built to dominate your industry.',
    '["Everything in Professional, plus:", "Custom Web App or Headless E-Commerce System", "Interactive 3D / WebGL Animated Elements", "Secure User Authentication & Database Storage", "WhatsApp Direct Ordering & Instant Checkout Engine", "Automated WhatsApp / Email Notification Alerts", "Full Source Code & GitHub Handover", "Priority 60 Days Hypercare Support"]'::jsonb,
    'Hi GJ Devloper, I''m interested in the Premium Website Plan (Starting at ₹9,999). Let''s schedule a call!',
    FALSE,
    TRUE,
    3
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  description = EXCLUDED.description;

-- Seed Default Products (Resolving category IDs dynamically; Idempotent on slug)
INSERT INTO public.products (
  name, slug, category_id, description, price, original_price, image_url, in_stock, stock_quantity, badge, features, sort_order, is_active
) VALUES
  (
    'Custom Business Website Blueprint',
    'custom-business-website-blueprint',
    (SELECT id FROM public.categories WHERE slug = 'web-systems' LIMIT 1),
    'Modern, high-performance responsive web presence tailored for brands. Includes 5 custom views, dark/light aesthetics, WhatsApp lead routing, and 100/100 Core Web Vitals.',
    3499.00,
    4999.00,
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    TRUE,
    15,
    'Best Seller',
    '["5 Dynamic Pages", "WhatsApp Instant Inquiries", "100/100 Mobile Performance", "14-Day Free Support"]'::jsonb,
    1,
    TRUE
  ),
  (
    'WhatsApp Restaurant QR Menu & Ordering Portal',
    'whatsapp-restaurant-qr-menu-portal',
    (SELECT id FROM public.categories WHERE slug = 'hospitality-dining' LIMIT 1),
    'Contactless digital QR menu with table selector, instant cart, and 1-click WhatsApp order dispatcher straight to the kitchen desk.',
    4999.00,
    6999.00,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    TRUE,
    10,
    'High ROI',
    '["Digital Table Selector", "Instant WhatsApp Order Dispatch", "Item Variations & Addons", "Zero Transaction Fee"]'::jsonb,
    2,
    TRUE
  ),
  (
    'Agency & Creative Portfolio Dark UI Template',
    'agency-creative-portfolio-dark-ui',
    (SELECT id FROM public.categories WHERE slug = 'portfolios' LIMIT 1),
    'Futuristic dark UI web portfolio with 3D particles, project modal showcases, live coding animations, and dynamic customer inquiries pipeline.',
    2999.00,
    3999.00,
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    TRUE,
    20,
    'Featured',
    '["3D WebGL Canvas Sphere", "Interactive Code Window", "Case Studies Showcase", "Admin Management Panel"]'::jsonb,
    3,
    TRUE
  ),
  (
    'Direct-to-WhatsApp E-Commerce Storefront System',
    'direct-whatsapp-ecommerce-storefront',
    (SELECT id FROM public.categories WHERE slug = 'ecommerce' LIMIT 1),
    'Frictionless online storefront with client-side persistent cart, automatic subtotal calculations, instant WhatsApp order generator, and SQLite/Supabase inventory backend.',
    5999.00,
    8499.00,
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80',
    TRUE,
    8,
    'Zero Gateway Fees',
    '["Full Cart & Checkout System", "Instant Order to WhatsApp", "Order Storage", "Admin Order Pipeline"]'::jsonb,
    4,
    TRUE
  ),
  (
    'Real Estate Property Listings Portal',
    'real-estate-property-listings-portal',
    (SELECT id FROM public.categories WHERE slug = 'real-estate' LIMIT 1),
    'Editorial luxury property presentation portal with interactive virtual galleries, neighborhood guides, and direct broker WhatsApp appointment booking.',
    4499.00,
    5999.00,
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    TRUE,
    12,
    'New',
    '["Property Filter by Location & Price", "HD Photo & Floorplan Showcase", "Direct WhatsApp Broker Routing", "Mobile-Optimized"]'::jsonb,
    5,
    TRUE
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  features = EXCLUDED.features,
  description = EXCLUDED.description;
