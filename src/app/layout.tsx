import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import CustomCursor from "@/components/ui/CustomCursor";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "GJ Devloper | World-Class Digital Agency & High-Performance Web Development",
  description:
    "GJ Devloper is a premier international web development agency. We engineer bespoke 3D interactive web experiences, high-conversion full-stack web applications, and enterprise digital solutions that scale revenue.",
  keywords: [
    "GJ Devloper",
    "web development agency",
    "Next.js web developer",
    "3D web development",
    "WebGL agency",
    "creative digital agency",
    "React developer",
    "enterprise web applications",
    "high conversion e-commerce",
    "UI/UX design systems",
  ],
  authors: [{ name: "GJ Devloper", url: "https://gjdevloper.com" }],
  creator: "GJ Devloper",
  publisher: "GJ Devloper",
  metadataBase: new URL("https://gjdevloper.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gjdevloper.com",
    siteName: "GJ Devloper",
    title: "GJ Devloper | We Build Digital Experiences That Grow Businesses",
    description:
      "Award-winning web engineering, bespoke 3D interactive interfaces, and sub-second full-stack applications built for global brands and ambitious startups.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GJ Devloper - Premium Web Development Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GJ Devloper | Premium Web Development Agency",
    description:
      "We build world-class digital experiences that grow businesses. High-performance Next.js, 3D WebGL, and scalable software.",
    creator: "@gjdevloper",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "GJ Devloper",
    image: "https://gjdevloper.com/og-image.jpg",
    description:
      "Professional web development agency engineering world-class 3D web experiences, full-stack web applications, and high-performance digital platforms.",
    url: "https://gjdevloper.com",
    telephone: "+1-800-GJ-DEV",
    priceRange: "$$$$",
    address: {
      "@type": "PostalAddress",
      addressCountry: "Global / Remote",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "08:00",
      closes: "22:00",
    },
    sameAs: [
      "https://github.com/gjdevloper",
      "https://linkedin.com/company/gjdevloper",
      "https://twitter.com/gjdevloper",
    ],
  };

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#030712] text-slate-100 min-h-screen selection:bg-sky-500/30 selection:text-white`}
      >
        <SiteSettingsProvider>
          <CartProvider>
            <CustomCursor />
            {children}
          </CartProvider>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
