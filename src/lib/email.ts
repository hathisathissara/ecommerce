// src/lib/email.ts
import nodemailer from "nodemailer";
import Setting from "@/models/Setting";
import connectDB from "@/lib/db";

// Gmail SMTP Config එක සාදාගැනීම
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOrderEmail(order: any) {
  await connectDB();
  const settings = await Setting.findOne();
  const storeName = settings?.storeName || "THE STORE";
  const storeNameUpper = storeName.toUpperCase();
  const contactEmail = settings?.contactEmail || "";

  // මිලදී ගත් භාණ්ඩ ලැයිස්තුව HTML table එකක් ලෙස සැකසීම
  const itemsHtml = order.items
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong>
          ${item.description ? `<br/><span style="font-size: 11px; color: #6b7280; line-height: 1.4; display: inline-block; margin-top: 4px;">${item.description.replace(/\n/g, "<br/>")}</span>` : ""}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">LKR ${(item.price).toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">LKR ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join("");

  // ලස්සනට මෝස්තර කර ඇති HTML Invoice එක
  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 16px; color: #1f2937; background-color: #ffffff;">
      
      <div style="text-align: center; border-bottom: 2px solid #111827; padding-bottom: 20px;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #111827; text-transform: uppercase;">${storeNameUpper}</h1>
        <p style="margin: 5px 0 0 0; font-size: 11px; font-weight: 600; color: #6b7280; letter-spacing: 1px; text-transform: uppercase;">Luxury Perfumes & Cosmetics</p>
      </div>
      
      <div style="padding: 25px 0;">
        <h2 style="font-size: 18px; font-weight: 800; color: #111827; margin-top: 0; text-align: center;">Order Confirmed! 🎉</h2>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">Hello <strong>${order.customer.name}</strong>,</p>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 25px;">Thank you for shopping with us! We have successfully received your order. Below is your detailed invoice:</p>
        
        <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 20px; border-radius: 12px; margin-bottom: 25px; font-size: 13px; line-height: 1.8; color: #374151;">
          <p style="margin: 0 0 8px 0;"><strong>Order ID:</strong> <span style="font-family: monospace;">${order._id}</span></p>
          <p style="margin: 0 0 8px 0;"><strong>Placed Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p style="margin: 0 0 8px 0;"><strong>Payment Method:</strong> ${order.paymentMethod === "COD" ? "Cash on Delivery (COD) 💵" : "Bank Transfer 🏦"}</p>
          <p style="margin: 0 0 8px 0;"><strong>Contact Phone:</strong> ${order.customer.phone}</p>
          <p style="margin: 0;"><strong>Shipping Address:</strong> ${order.customer.address}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 25px;">
          <thead>
            <tr style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
              <th style="padding: 12px 10px; text-align: left; font-weight: 700; color: #374151;">Item</th>
              <th style="padding: 12px 10px; text-align: center; font-weight: 700; color: #374151;">Qty</th>
              <th style="padding: 12px 10px; text-align: right; font-weight: 700; color: #374151;">Unit Price</th>
              <th style="padding: 12px 10px; text-align: right; font-weight: 700; color: #374151;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; font-size: 13px; line-height: 1.8; color: #4b5563;">
          ${order.discountAmount > 0 ? `<p style="margin: 0; color: #dc2626; font-weight: 600;"><strong>Discount (${order.couponCode}):</strong> - LKR ${order.discountAmount.toLocaleString()}</p>` : ""}
          <p style="margin: 0;"><strong>Shipping Fee:</strong> ${order.shippingFee === 0 ? "FREE" : `LKR ${order.shippingFee.toLocaleString()}`}</p>
          <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 800; color: #111827; border-top: 1px solid #e5e7eb; padding-top: 8px;">Grand Total: LKR ${order.totalAmount.toLocaleString()}</p>
      </div>

      <div style="text-align: center; margin-top: 35px; margin-bottom: 15px;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000'}/track-order?orderId=${order._id}" style="background-color: #111827; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
          Track Your Order
        </a>
      </div>

      <div style="text-align: center; border-top: 1px solid #f3f4f6; padding-top: 20px; font-size: 11px; color: #9ca3af; margin-top: 25px;">
        <p>If you have any questions or concerns, please reply to this email.${contactEmail}</p>
        <p style="margin-top: 5px;">&copy; ${new Date().getFullYear()} ${storeNameUpper}. All rights reserved.</p>
      </div>
    </div>
  `;

  // 1. පාරිභෝගිකයාට (Customer) Invoice එක යැවීම
  await transporter.sendMail({
    from: `"${storeName}" <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `Order Confirmation #${order._id.toString().substring(18)} - ${storeNameUpper}`,
    html: emailHtml,
  });

  // 2. ඔයාට (Admin) අලුත් ඕඩර් එකක් ලැබුණු බව දන්වා Copy එකක් යැවීම
  await transporter.sendMail({
    from: `"${storeName}" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `🚨 NEW ORDER RECEIVED - #${order._id.toString().substring(18)}`,
    html: emailHtml,
  });
}