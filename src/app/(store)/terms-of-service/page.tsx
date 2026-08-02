// src/app/(store)/terms-of-service/page.tsx
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";
import Link from "next/link";

export const revalidate = 3600;

export default async function TermsOfServicePage() {
  await connectDB();
  let settings = await Setting.findOne();
  if (!settings) {
    settings = {
      storeName: "THE STORE",
      contactEmail: "info@thestore.com",
      contactPhone: "0771234567",
      contactAddress: "Colombo, Sri Lanka",
      deliveryCharge: 350,
      freeDeliveryThreshold: 5000,
    };
  }

  const storeNameUpper = settings.storeName.toUpperCase();

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">Terms of Service</h1>
          <p className="text-xs text-gray-400 mt-2">Last Updated: August 2026</p>
        </div>
      </div>

      {/* Policy Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-sm text-gray-600 leading-relaxed space-y-8 font-sans">
        <p>
          Welcome to <strong>{settings.storeName}</strong>. By accessing our website and purchasing from us, you agree to comply with and be bound by the following Terms of Service. Please read them carefully before placing an order.
        </p>

        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="text-base font-black uppercase text-gray-900 border-b pb-1.5">1. General Conditions</h2>
          <p>
            By using this site, you represent that you are at least the age of majority in your province or country of residence. We reserve the right to refuse service, terminate accounts, or cancel orders at our sole discretion.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="text-base font-black uppercase text-gray-900 border-b pb-1.5">2. Products & Pricing</h2>
          <p>
            We make every effort to display the colors and details of our imported perfumes and cosmetics as accurately as possible. Prices for our products are subject to change without notice.
          </p>
          <p>
            <strong>Product Variants:</strong> Many of our products are available in multiple sizes, volumes, or shades. Price and stock levels may vary depending on the specific variant option selected.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h2 className="text-base font-black uppercase text-gray-900 border-b pb-1.5">3. Shipping & Delivery</h2>
          <p>
            We provide island-wide shipping across Sri Lanka. Our standard shipping terms are:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Standard Shipping Fee:</strong> LKR {settings.deliveryCharge} flat rate for domestic deliveries.</li>
            <li><strong>Free Shipping Threshold:</strong> Free shipping is automatically applied to all orders with a total value of <strong>LKR {settings.freeDeliveryThreshold.toLocaleString()}</strong> or above.</li>
            <li><strong>Delivery Timeline:</strong> Colombo & suburbs: 2-3 business days. Outstation: 3-5 business days. We are not liable for delayed dispatches caused by courier delays or severe weather conditions.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <h2 className="text-base font-black uppercase text-gray-900 border-b pb-1.5">4. Payment & Order Verification</h2>
          <p>
            We offer Cash on Delivery (COD) and Bank Transfer as secure payment methods:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Cash on Delivery (COD):</strong> You must pay the courier in cash upon receiving your package.</li>
            <li><strong>Bank Transfer:</strong> If you select Bank Transfer, you are required to deposit/transfer the bill amount into our designated bank account and upload a clear screenshot/image of the bank deposit slip during checkout. Bank transfer orders will only be approved and dispatched after verification of the slip.</li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="space-y-3 border-t pt-6">
          <h2 className="text-base font-black uppercase text-gray-900">Contact Information</h2>
          <p>If you have any questions regarding these Terms of Service, please reach out to us:</p>
          <p className="mt-2 space-y-1 text-xs">
            <span className="block">✉ Email: <strong>{settings.contactEmail}</strong></span>
            <span className="block">📞 Phone: <strong>{settings.contactPhone}</strong></span>
            <span className="block">📍 Address: {settings.contactAddress}</span>
          </p>
        </div>
      </div>
    </div>
  );
}