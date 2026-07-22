import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // WhatsApp/FB crawler එකට relative image path resolve කරගන්න මේක අනිවාර්යයෙන්ම ඕන
  metadataBase: new URL("https://lumosstore.vercel.app"),

  title: {
    default: "The Store | Luxury Perfumes & Cosmetics", // සාමාන්‍ය පිටුවල පෙන්වන නම
    template: "%s | The Store", // වෙනත් පිටුවල නම මෙයට එකතු වේ (e.g. Chanel No 5 | The Store)
  },
  description: "Explore our premium collection of imported luxury perfumes, cosmetics, and custom gift boxes in Sri Lanka.",
  keywords: ["perfumes", "cosmetics", "luxury perfumes sri lanka", "imported cosmetics", "custom gift box builder"],
  authors: [{ name: "The Store Team" }],

  // Facebook, WhatsApp, Viber Share වලදී ලස්සනට පින්තූරය සහ විස්තරය පෙන්වීමට (OpenGraph)
  openGraph: {
    title: "The Store | Luxury Perfumes & Cosmetics",
    description: "Explore our premium collection of imported luxury perfumes and cosmetics.",
    url: "https://lumosstore.vercel.app/", // පසුව ඔයාගේ සැබෑ Domain එක දාන්න
    siteName: "The Store",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg", // public/ folder එකේ මේ නමින්ම image එකක් දාන්න
        width: 1200,
        height: 630,
        alt: "The Store - Luxury Perfumes & Cosmetics",
      },
    ],
  },

  // Twitter/X card - WhatsApp සමහරවිට මේකත් fallback විදිහට check කරනවා
  twitter: {
    card: "summary_large_image",
    title: "The Store | Luxury Perfumes & Cosmetics",
    description: "Explore our premium collection of imported luxury perfumes and cosmetics.",
    images: ["/og-image.jpg"],
  },
};

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