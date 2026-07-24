// src/app/api/admin/newsletter/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Newsletter from "@/models/Newsletter";
import Setting from "@/models/Setting";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 1. GET - Fetch all subscribers
export async function GET() {
  try {
    await connectDB();
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    return NextResponse.json(subscribers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}

// 2. DELETE - Remove/Unsubscribe a user
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const subId = searchParams.get("id");

    if (!subId) {
      return NextResponse.json({ error: "Subscriber ID is required" }, { status: 400 });
    }

    await Newsletter.findByIdAndDelete(subId);
    return NextResponse.json({ message: "Subscriber removed successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove subscriber" }, { status: 500 });
  }
}

// 3. POST - Send Personalized Individual Email Campaign Concurrently (BCC වෙනුවට)
export async function POST(req: Request) {
  try {
    await connectDB();
    const { subject, content } = await req.json();

    if (!subject || !content) {
      return NextResponse.json({ error: "Subject and content are required" }, { status: 400 });
    }

    const subscribers = await Newsletter.find({});
    if (subscribers.length === 0) {
      return NextResponse.json({ error: "No active subscribers found to send email" }, { status: 400 });
    }

    const settings = await Setting.findOne();
    const storeName = settings?.storeName || "THE STORE";
    const storeNameUpper = storeName.toUpperCase();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // ⚡ හැම පාරිභෝගිකයෙකුටම තනි තනිව (BCC නැතුව) යැවීමට Promises array එකක් සාදා ගැනීම ⚡
    const emailPromises = subscribers.map((sub) => {
      const recipientEmail = sub.email;

      // මෙම පාරිභෝගිකයාගේ ඊමේල් එක සෘජුවම Unsubscribe ලින්ක් එකට එකතු කරයි (Personalized Link)
      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 16px; color: #1f2937; background-color: #ffffff;">
          
          <div style="text-align: center; border-bottom: 2px solid #111827; padding-bottom: 20px;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #111827; text-transform: uppercase;">${storeNameUpper}</h1>
            <p style="margin: 5px 0 0 0; font-size: 11px; font-weight: 600; color: #6b7280; letter-spacing: 1px; text-transform: uppercase;">Newsletter & Updates</p>
          </div>
          
          <div style="padding: 25px 0; font-size: 14px; color: #4b5563; line-height: 1.6; white-space: pre-line;">
            ${content.replace(/\n/g, "<br/>")}
          </div>

          <div style="text-align: center; border-top: 1px solid #f3f4f6; padding-top: 20px; font-size: 11px; color: #9ca3af; margin-top: 25px;">
            <p style="margin: 0 0 5px 0;">You are receiving this email because you subscribed to our newsletter on our website.</p>
            <p style="margin: 0;">
              No longer want to receive these emails? 
              <a href="${baseUrl}/unsubscribe?email=${recipientEmail}" style="color: #ef4444; text-decoration: underline; font-weight: bold;">Unsubscribe from this list</a>
            </p>
            <p style="margin-top: 8px;">&copy; ${new Date().getFullYear()} ${storeNameUpper}. All rights reserved.</p>
          </div>
        </div>
      `;

      return transporter.sendMail({
        from: `"${storeName}" <${process.env.EMAIL_USER}>`,
        to: recipientEmail, // සෘජුවම පාරිභෝගිකයාගේ ලිපිනයට
        subject: subject,
        html: emailHtml,
      });
    });

    // Promise.all භාවිතයෙන් සියලුම ඊමේල්ස් එකවර ඉතාමත් වේගයෙන් යවයි (Timeout වීම් වළක්වයි)
    await Promise.all(emailPromises);

    return NextResponse.json({ message: "Newsletter campaign sent successfully!" }, { status: 200 });

  } catch (error) {
    console.error("Failed to send newsletter campaign:", error);
    return NextResponse.json({ error: "Failed to send email campaign" }, { status: 500 });
  }
}