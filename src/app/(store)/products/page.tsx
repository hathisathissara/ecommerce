// src/app/(store)/products/page.tsx
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand"; // Import Brand model
import FilterBar from "@/components/FilterBar";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import type { Metadata } from "next";
import Setting from "@/models/Setting";

export const revalidate = 10;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string; search?: string }>;
}): Promise<Metadata> {
  await connectDB();
  const { category, brand, search } = await searchParams;
  const settings = await Setting.findOne();
  const siteTitle = settings?.storeName || "The Store";

  let title = "Shop All Products";
  let description = "Browse our full collection of luxury perfumes, cosmetics, and more.";
  let ogImage = settings?.logo || "/og-image.png";

  if (category) {
    const foundCategory = await Category.findOne({ slug: category });
    if (foundCategory) {
      title = `${foundCategory.name} | ${siteTitle}`;
      description = `Shop our premium collection of ${foundCategory.name} at ${siteTitle}.`;
      if (foundCategory.image) ogImage = foundCategory.image;
    }
  } else if (brand) {
    const foundBrand = await Brand.findOne({ slug: brand });
    if (foundBrand) {
      title = `${foundBrand.name} | ${siteTitle}`;
      description = `Explore the best of ${foundBrand.name} at ${siteTitle}.`;
      if (foundBrand.image) ogImage = foundBrand.image;
    }
  } else if (search) {
    title = `Search results for "${search}" | ${siteTitle}`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    category?: string; 
    search?: string; 
    availability?: string; 
    sort?: string; 
    giftsByPrice?: string; 
    giftIdeas?: string;
    brand?: string; // Add brand parameter to searchParams
  }>;
}) {
  await connectDB();
  const { category, search, availability, sort, giftsByPrice, giftIdeas, brand } = await searchParams;

  const query: {
    category?: string;
    brand?: string; // Declare brand inside query type
    $or?: Array<{ name?: { $regex: string; $options: string }; description?: { $regex: string; $options: string } }>;
    stockStatus?: string;
    price?: { $lt?: number; $gte?: number; $lte?: number; $gt?: number };
    tags?: { $in: string[] };
  } = {};
  let activeCategoryName = "All Products";

  // Filter products by selected Category slug
  if (category) {
    const foundCategory = await Category.findOne({ slug: category });
    if (foundCategory) {
      query.category = foundCategory._id;
      activeCategoryName = foundCategory.name;
    }
  }

  // Filter products by selected Brand slug (Triggers on Home Page Brand Logo clicks)
  if (brand) {
    const foundBrand = await Brand.findOne({ slug: brand });
    if (foundBrand) {
      query.brand = foundBrand._id.toString();
      activeCategoryName = foundBrand.name;
    }
  }

  // Filter products by live search term
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Filter products by stock availability status
  if (availability === "in-stock") {
    query.stockStatus = "In Stock";
  } else if (availability === "out-of-stock") {
    query.stockStatus = "Out of Stock";
  }

  // Filter products by price range boundaries
  if (giftsByPrice) {
    if (giftsByPrice === "under-5000") {
      query.price = { $lt: 5000 };
    } else if (giftsByPrice === "5000-10000") {
      query.price = { $gte: 5000, $lte: 10000 };
    } else if (giftsByPrice === "over-10000") {
      query.price = { $gt: 10000 };
    }
  }

  // Filter products by gift tags suggestions
  if (giftIdeas) {
    if (giftIdeas === "for-him") {
      query.tags = { $in: ["For Him", "for him", "Men", "men"] };
    } else if (giftIdeas === "for-her") {
      query.tags = { $in: ["For Her", "for her", "Women", "women"] };
    } else if (giftIdeas === "corporate") {
      query.tags = { $in: ["Corporate", "corporate", "Gift", "gift"] };
    }
  }

  // Sort logic configuration
  let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
  switch (sort) {
    case "best-selling":
      // Now dynamically sorts by the actual sales count tracked on checkout!
      sortQuery = { salesCount: -1 };
      break;
    case "oldest":
      sortQuery = { createdAt: 1 };
      break;
    case "price-asc":
      sortQuery = { price: 1 };
      break;
    case "price-desc":
      sortQuery = { price: -1 };
      break;
    case "name-asc":
      sortQuery = { name: 1 };
      break;
    case "name-desc":
      sortQuery = { name: -1 };
      break;
    case "newest":
    default:
      sortQuery = { createdAt: -1 };
      break;
  }

  // Fetch products from database with populated fields
  const products = await Product.find(query)
    .populate("category", "name")
    .populate("brand", "name") // Populate brand name
    .sort(sortQuery);
  const categories = await Category.find({ isActive: true });

  const serializedCategories = JSON.parse(JSON.stringify(categories));
  const serializedProducts = JSON.parse(JSON.stringify(products));

  const pageTitle = search ? `Search results` : activeCategoryName;

  return (
    <div className="bg-white min-h-screen">
      {/* Page header */}
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <Link href="/" className="hover:text-gray-700 transition">Home</Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">Shop</span>
            {activeCategoryName !== "All Products" && (
              <>
                <span>›</span>
                <span className="text-gray-700 font-medium">{activeCategoryName}</span>
              </>
            )}
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            {pageTitle}
          </h1>
          {search && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Showing results for <span className="font-semibold text-gray-800">&quot;{search}&quot;</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Filter Bar */}
      <FilterBar
        categories={serializedCategories}
        totalProducts={serializedProducts.length}
      />

      {/* Product Grid - Full Width */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {serializedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mb-5">
              🔍
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-sm text-gray-500 mb-6">
              Try adjusting your filters or search term.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-700 transition"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {serializedProducts.map(
              (prod: {
                _id: string;
                name: string;
                slug: string;
                price: number;
                discountPrice?: number;
                images: string[];
                category?: { name: string };
              }) => (
                <ProductCard key={prod._id} product={prod} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}