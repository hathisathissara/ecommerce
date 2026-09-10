import type { MetadataRoute } from "next";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";

export const revalidate = 3600; // Refresh sitemap cache every 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gift-builder`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    await connectDB();

    interface SitemapDoc {
      slug?: string;
      updatedAt?: Date | string;
    }

    // 1. Dynamic Product Pages (/products/[slug])
    const products = (await Product.find({}, "slug updatedAt").lean()) as SitemapDoc[];
    const productRoutes: MetadataRoute.Sitemap = (products || [])
      .filter((p): p is SitemapDoc & { slug: string } => Boolean(p?.slug))
      .map((p) => ({
        url: `${baseUrl}/products/${encodeURIComponent(p.slug)}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    // 2. Dynamic Category Filters (/products?category=[slug])
    const categories = (await Category.find({ isActive: { $ne: false } }, "slug updatedAt").lean()) as SitemapDoc[];
    const categoryRoutes: MetadataRoute.Sitemap = (categories || [])
      .filter((c): c is SitemapDoc & { slug: string } => Boolean(c?.slug))
      .map((c) => ({
        url: `${baseUrl}/products?category=${encodeURIComponent(c.slug)}`,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    // 3. Dynamic Brand Filters (/products?brand=[slug])
    const brands = (await Brand.find({}, "slug updatedAt").lean()) as SitemapDoc[];
    const brandRoutes: MetadataRoute.Sitemap = (brands || [])
      .filter((b): b is SitemapDoc & { slug: string } => Boolean(b?.slug))
      .map((b) => ({
        url: `${baseUrl}/products?brand=${encodeURIComponent(b.slug)}`,
        lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    return [...staticRoutes, ...categoryRoutes, ...brandRoutes, ...productRoutes];
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
    return staticRoutes;
  }
}
