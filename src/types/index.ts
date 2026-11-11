export interface Project {
  id: string;
  title: string;
  client: string;
  category: "Web Application" | "3D E-Commerce" | "FinTech SaaS" | "Design System" | "Mobile & Web";
  year: string;
  summary: string;
  description: string;
  challenge: string;
  solution: string;
  results: { metric: string; label: string }[];
  tags: string[];
  gradient: string;
  accentColor: string;
  image: string;
  featured: boolean;
  link?: string;
  github?: string;
}

export interface Service {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  deliverables: string[];
  technologies: string[];
  badge: string;
  gradient: string;
  iconName: string;
  startingPrice?: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  clientName: string;
  clientRole: string;
  clientCompany: string;
  projectScope: string;
  rating: number;
  avatar: string;
  location: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  duration: string;
  description: string;
  deliverables: string[];
  icon: string;
}

export interface TechItem {
  name: string;
  category: "Frontend" | "Backend & Cloud" | "3D & Creative" | "State & Database" | "Tools & CI/CD";
  icon: string;
  highlight?: boolean;
  description: string;
}

export interface Product {
  id: string | number;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  original_price?: number | null;
  image_url: string;
  in_stock: number; // 1 or 0
  stock_quantity: number;
  badge?: string;
  features?: string[];
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | "New"
  | "Contacted"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string | number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  pincode: string;
  order_notes?: string;
  items: OrderItem[];
  subtotal: number;
  total_amount: number;
  status: OrderStatus;
  whatsapp_sent_status?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}
