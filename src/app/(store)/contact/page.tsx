// src/app/(store)/contact/page.tsx
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";
import ContactFormClient from "./ContactFormClient";

export const revalidate = 10;

export default async function ContactPage() {
  await connectDB();
  let settings = await Setting.findOne();
  if (!settings) {
    settings = {
      contactEmail: "info@thestore.com",
      contactPhone: "0771234567",
      contactAddress: "Colombo, Sri Lanka",
    };
  }

  // Making the Mongoose settings object a serializable JSON
  const serializedSettings = JSON.parse(JSON.stringify(settings));

  return <ContactFormClient settings={serializedSettings} />;
}