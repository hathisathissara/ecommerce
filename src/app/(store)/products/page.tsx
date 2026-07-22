// src/app/(store)/products/page.tsx
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export const revalidate = 10;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; minPrice?: string; maxPrice?: string }>;
}) {
  await connectDB();
  const { category, search, minPrice, maxPrice } = await searchParams;

  const query: {
    category?: string;
    $or?: Array<{ name?: { $regex: string; $options: string }; description?: { $regex: string; $options: string } }>;
    price?: { $gte?: number; $lte?: number };
  } = {};
  let activeCategoryName = "All Products";

  if (category) {
    const foundCategory = await Category.findOne({ slug: category });
    if (foundCategory) {
      query.category = foundCategory._id;
      activeCategoryName = foundCategory.name;
    }
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const products = await Product.find(query).populate("category", "name").sort({ createdAt: -1 });
  const categories = await Category.find({ isActive: true });

  const serializedCategories = JSON.parse(JSON.stringify(categories));
  const serializedProducts = JSON.parse(JSON.stringify(products));

  const pageTitle = search ? `Results for "${search}"` : activeCategoryName;

  return (
    <div className="bg-white min-h-screen">
      {/* Page header */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-3">
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
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
              {pageTitle}
            </h1>
            <span className="text-sm text-gray-500 font-medium">
              {serializedProducts.length} {serializedProducts.length === 1 ? "product" : "products"} found
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:grid md:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <FilterSidebar categories={serializedCategories} />
          </div>

          {/* Product Grid */}
          <div className="md:col-span-3">
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
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
      </div>
    </div>
  );
}