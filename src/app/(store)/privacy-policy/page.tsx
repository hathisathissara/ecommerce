// src/app/(store)/privacy-policy/page.tsx
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";
import Link from "next/link";

export const revalidate = 3600; // පැයකට වරක් Cache එක අලුත් කරයි (නීතිමය දත්ත නිතර වෙනස් නොවන නිසා)

export default async function PrivacyPolicyPage() {
  await connectDB();
  let settings = await Setting.findOne();
  if (!settings) {
    settings = {
      storeName: "THE STORE",
      contactEmail: "info@thestore.com",
      contactPhone: "0771234567",
      contactAddress: "Colombo, Sri Lanka",
    };
  }

  const storeNameUpper = settings.storeName.toUpperCase();

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 uppercase tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-gray-400 mt-2">Last Updated: August 2026</p>
        </div>
      </div>

      {/* Policy Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-sm text-gray-600 leading-relaxed space-y-8 font-sans">
        <p>
          At <strong>{settings.storeName}</strong>, we are committed to protecting your privacy and ensuring a secure shopping experience. This Privacy Policy outlines how we collect, use, and safeguard your personal information when you visit and purchase from our e-commerce storefront.
        </p>

        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="text-base font-black uppercase text-gray-900 border-b pb-1.5">1. Information We Collect</h2>
          <p>
            When you place an order, make a purchase, or subscribe to our newsletter, we collect certain personal information necessary to process your transaction. This includes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Personal Details:</strong> Full name, shipping address, billing address, phone number, and email address.</li>
            <li><strong>Payment Records:</strong> If paying via Bank Transfer, we collect the bank deposit slip image uploaded by you as proof of payment. We do not store or process direct credit card information.</li>
            <li><strong>Device Information:</strong> Technical data including your IP address and browser type to optimize storefront rendering.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="text-base font-black uppercase text-gray-900 border-b pb-1.5">2. How We Use Your Information</h2>
          <p>We utilize the collected information strictly for business operations, including:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Processing, packing, and dispatching your orders.</li>
            <li>Sending transactional invoice receipts to your email address and enabling order tracking.</li>
            <li>Verifying bank deposit slips to approve bank-transfer orders.</li>
            <li>Sending news, updates, and exclusive discount coupons via our newsletter (only if you subscribed).</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h2 className="text-base font-black uppercase text-gray-900 border-b pb-1.5">3. Information Sharing & Third Parties</h2>
          <p>
            We respect your privacy. <strong>{settings.storeName}</strong> will never sell, rent, or trade your personal information. We only share essential shipping details with our trusted domestic courier partners to ensure safe delivery to your address.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <h2 className="text-base font-black uppercase text-gray-900 border-b pb-1.5">4. Security of Your Data</h2>
          <p>
            Your trust is paramount. We employ secure socket layer (SSL) encryption, secure databases, and cloud asset storage (Cloudinary) to protect your personal details, order history, and uploaded bank slips from unauthorized access.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-3">
          <h2 className="text-base font-black uppercase text-gray-900 border-b pb-1.5">5. Your Rights & Unsubscribing</h2>
          <p>
            You have the right to request access to the information we store about you or request its deletion. If you no longer wish to receive our marketing newsletter, you can easily click the <strong>&quot;Unsubscribe&quot;</strong> link at the bottom of any campaign email to remove your address instantly.
          </p>
        </div>

        {/* Section 6 */}
        <div className="space-y-3 border-t pt-6">
          <h2 className="text-base font-black uppercase text-gray-900">Contact Us</h2>
          <p>If you have any questions about this Privacy Policy or wish to modify your information, please contact us:</p>
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