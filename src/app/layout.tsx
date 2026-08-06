import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  await connectDB();
  const settings = await Setting.findOne();
  
  const siteTitle = settings?.storeName || "The Store";
  const favicon = settings?.favicon || settings?.logo || "/favicon.ico";

  return {
    metadataBase: new URL("https://lumosstore.vercel.app"),

    title: {
      default: `${siteTitle} | Luxury Perfumes & Cosmetics`,
      template: `%s | ${siteTitle}`,
    },
    description: "Explore our premium collection of imported luxury perfumes, cosmetics, and custom gift boxes in Sri Lanka.",
    keywords: ["perfumes", "cosmetics", "luxury perfumes sri lanka", "imported cosmetics", "custom gift box builder"],
    authors: [{ name: `${siteTitle} Team` }],
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },

    openGraph: {
      title: `${siteTitle} | Luxury Perfumes & Cosmetics`,
      description: "Explore our premium collection of imported luxury perfumes and cosmetics.",
      url: "https://lumosstore.vercel.app/",
      siteName: siteTitle,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${siteTitle} - Luxury Perfumes & Cosmetics`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${siteTitle} | Luxury Perfumes & Cosmetics`,
      description: "Explore our premium collection of imported luxury perfumes and cosmetics.",
      images: ["/og-image.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}