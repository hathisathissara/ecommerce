// src/app/(store)/refund-policy/page.tsx
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";
import Link from "next/link";

export const revalidate = 3600;

export default async function RefundPolicyPage() {
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
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">Refund & Return Policy</h1>
          <p className="text-xs text-gray-400 mt-2">Last Updated: August 2026</p>
        </div>
      </div>

      {/* Policy Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-sm text-gray-600 leading-relaxed space-y-8 font-sans">
        <p>
          Thank you for shopping at <strong>{settings.storeName}</strong>. If you are not entirely satisfied with your purchase, we are here to help. Our Refund and Return Policy is outlined below.
        </p>

        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="text-base font-black uppercase text-gray-900 border-b pb-1.5">1. Returns & Exchange Period</h2>
          <p>
            We offer a **7-Day Return and Exchange Policy** [2]. You have 7 calendar days from the date of delivery to request a return or exchange for an eligible item.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="text-base font-black uppercase text-gray-900 border-b pb-1.5">2. Eligibility for Returns</h2>
          <p>To be eligible for a return or exchange, please ensure that:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>The item is completely unused, unopened, and in its original, sealed packaging.</li>
            <li>All tags, labels, and protective wrapping are fully intact.</li>
            <li>You have the original receipt, invoice, or proof of purchase.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h2 className="text-base font-black uppercase text-gray-900 border-b pb-1.5">3. Non-Returnable Items (Exceptions)</h2>
          <p>Certain items cannot be returned or refunded due to hygiene and customization reasons:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Opened Cosmetics & Perfumes:</strong> Due to hygiene standards, we cannot accept returns on opened, sampled, or tested cosmetics or fragrances.</li>
            <li><strong>Custom Gift Boxes:</strong> Custom gift sets created using our **Gift Box Builder** are highly personalized and cannot be returned, refunded, or exchanged unless they arrive physically damaged.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <h2 className="text-base font-black uppercase text-gray-900 border-b pb-1.5">4. Damaged or Incorrect Items</h2>
          <p>
            If you receive a damaged, broken, or incorrect product, please contact us immediately within **24 hours of delivery**. Please share clear photos of the damaged item and the package box. We will arrange a free exchange or a full refund at no extra shipping cost to you.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-3">
          <h2 className="text-base font-black uppercase text-gray-900 border-b pb-1.5">5. Refund Processing</h2>
          <p>
            Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. If approved, we will process your refund via Bank Transfer to your bank account within **3-5 business days**.
          </p>
        </div>

        {/* Section 6 */}
        <div className="space-y-3 border-t pt-6">
          <h2 className="text-base font-black uppercase text-gray-900">Get Help with Returns</h2>
          <p>To initiate a return or exchange, please contact our customer support team:</p>
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