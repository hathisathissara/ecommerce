// src/lib/email.ts
import nodemailer from "nodemailer";
import Setting from "@/models/Setting";
import connectDB from "@/lib/db";

// Creating Gmail SMTP Config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface OrderItem {
  _id: string;
  name: string;
  description?: string;
  quantity: number;
  originalPrice: number;
  productDiscount: number;
  finalPrice: number;
  total: number;
  sku?: string;
  size?: string;
  color?: string;
  
  // Legacy fields
  price: number;
  discountPrice?: number;
}

interface OrderData {
  _id: string;
  orderNumber?: string;
  invoiceNumber?: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  paymentMethod: string;
  paymentStatus?: string;
  coupon?: {
    code?: string;
    discountType?: string;
    discountValue?: number;
    discountAmount?: number;
  };
  subtotal?: number;
  totalProductDiscount?: number;
  couponDiscount?: number;
  shippingFee: number;
  tax?: number;
  grandTotal?: number;
  
  // Legacy fields
  totalAmount: number;
  couponCode?: string;
  discountAmount?: number;
}

export async function sendOrderEmail(order: OrderData) {
  await connectDB();
  const settings = await Setting.findOne();
  const storeName = settings?.storeName || "THE STORE";
  const storeNameUpper = storeName.toUpperCase();
  const contactEmail = settings?.contactEmail || "";

  const orderNumber = order.orderNumber || `#${order._id.toString().substring(18)}`;
  const invoiceNumber = order.invoiceNumber || `INV-${order._id.toString().substring(18)}`;

  const subtotal = typeof order.subtotal === "number"
    ? order.subtotal
    : order.items.reduce((sum, item) => sum + ((item.originalPrice || item.price) * item.quantity), 0);

  const totalProductDiscount = typeof order.totalProductDiscount === "number"
    ? order.totalProductDiscount
    : order.items.reduce((sum, item) => sum + ((item.productDiscount || (item.discountPrice ? (item.price - item.discountPrice) : 0)) * item.quantity), 0);

  const couponDiscount = typeof order.couponDiscount === "number"
    ? order.couponDiscount
    : (order.discountAmount || 0);

  const shippingFee = order.shippingFee || 0;
  const tax = order.tax || 0;
  const grandTotal = typeof order.grandTotal === "number"
    ? order.grandTotal
    : order.totalAmount;

  const displayCouponCode = order.coupon?.code || order.couponCode || "";

  // Formatting the list of purchased items as an HTML table
  const itemsHtml = order.items
    .map((item: OrderItem) => {
      const itemOriginalPrice = typeof item.originalPrice === "number" ? item.originalPrice : item.price;
      const itemProductDiscount = typeof item.productDiscount === "number" ? item.productDiscount : (item.discountPrice ? (item.price - item.discountPrice) : 0);
      const itemFinalPrice = typeof item.finalPrice === "number" ? item.finalPrice : (item.discountPrice || item.price);
      const itemTotal = typeof item.total === "number" ? item.total : (itemFinalPrice * item.quantity);

      const variantStr = [item.size, item.color].filter(Boolean).join(" / ");

      return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 10px; vertical-align: top;">
          <strong style="color: #111827; font-size: 14px;">${item.name}</strong>
          ${variantStr ? `<br/><span style="font-size: 11px; color: #4b5563; font-weight: 500;">${variantStr} &times; ${item.quantity}</span>` : `<br/><span style="font-size: 11px; color: #4b5563; font-weight: 500;">Qty &times; ${item.quantity}</span>`}
          ${item.sku ? `<br/><span style="font-size: 10px; color: #9ca3af;">SKU: ${item.sku}</span>` : ""}
          ${item.description ? `<br/><span style="font-size: 11px; color: #6b7280; line-height: 1.4; display: inline-block; margin-top: 4px;">${item.description.replace(/\n/g, "<br/>")}</span>` : ""}
        </td>
        <td style="padding: 12px 10px; text-align: center; vertical-align: top; color: #4b5563; font-weight: bold;">${item.quantity}</td>
        <td style="padding: 12px 10px; text-align: right; vertical-align: top; color: #4b5563;">
          <div style="font-weight: bold;">LKR ${itemOriginalPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</div>
          ${itemProductDiscount > 0 ? `<div style="font-size: 11px; color: #dc2626; font-weight: 600; margin-top: 2px;">Product Discount: -LKR ${itemProductDiscount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</div>` : ""}
        </td>
        <td style="padding: 12px 10px; text-align: right; font-weight: bold; vertical-align: top; color: #111827;">
          LKR ${itemTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </td>
      </tr>
      `;
    })
    .join("");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://lumos-perfume.vercel.app";

  // A beautifully styled HTML Invoice
  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 16px; color: #1f2937; background-color: #ffffff;">
      
      <div style="text-align: center; border-bottom: 2px solid #111827; padding-bottom: 20px;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #111827; text-transform: uppercase;">${storeNameUpper}</h1>
        <p style="margin: 5px 0 0 0; font-size: 11px; font-weight: 600; color: #6b7280; letter-spacing: 1px; text-transform: uppercase;">Luxury Perfumes & Cosmetics</p>
      </div>
      
      <div style="padding: 25px 0;">
        <h2 style="font-size: 18px; font-weight: 800; color: #111827; margin-top: 0; text-align: center;">🎉 ORDER CONFIRMED</h2>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">Thank you for your purchase, <strong>${order.customer.name}</strong>!</p>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 25px;">Your order has been successfully placed. Below is your detailed invoice:</p>
        
        <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 20px; border-radius: 12px; margin-bottom: 25px; font-size: 13px; line-height: 1.8; color: #374151;">
          <p style="margin: 0 0 8px 0;"><strong>INVOICE NUMBER:</strong> <span style="font-family: monospace; font-weight: bold; color: #111827;">${invoiceNumber}</span></p>
          <p style="margin: 0 0 8px 0;"><strong>ORDER NUMBER:</strong> <span style="font-family: monospace; font-weight: bold; color: #111827;">${orderNumber}</span></p>
          <p style="margin: 0 0 8px 0;"><strong>ORDER ID:</strong> <span style="font-family: monospace; color: #6b7280; font-size: 11px;">${order._id}</span></p>
          <p style="margin: 0 0 8px 0;"><strong>ORDER DATE:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p style="margin: 0 0 8px 0;"><strong>PAYMENT METHOD:</strong> ${order.paymentMethod === "COD" ? "Cash on Delivery (COD) 💵" : "Bank Transfer 🏦"}</p>
          <p style="margin: 0 0 8px 0;"><strong>PAYMENT STATUS:</strong> <span style="text-transform: uppercase; font-weight: bold; color: #047857;">✓ ${order.paymentStatus || (order.paymentMethod === "COD" ? "Pending" : "Paid")}</span></p>
          <p style="margin: 0 0 8px 0;"><strong>CONTACT PHONE:</strong> ${order.customer.phone}</p>
          <p style="margin: 0;"><strong>SHIPPING ADDRESS:</strong> ${order.customer.address}</p>
        </div>

        <h3 style="font-size: 14px; font-weight: 800; color: #111827; text-transform: uppercase; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 12px; tracking-wider: 1px;">Order Summary</h3>
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

        <div style="text-align: right; font-size: 13px; line-height: 1.8; color: #4b5563; border-top: 2px solid #e5e7eb; padding-top: 15px;">
          <p style="margin: 0;"><strong>Subtotal:</strong> LKR ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
          ${totalProductDiscount > 0 ? `<p style="margin: 0; color: #dc2626;"><strong>Product Discount:</strong> -LKR ${totalProductDiscount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>` : ""}
          ${couponDiscount > 0 ? `<p style="margin: 0; color: #dc2626; font-weight: 600;"><strong>Coupon (${displayCouponCode}):</strong> -LKR ${couponDiscount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>` : ""}
          <p style="margin: 0;"><strong>Shipping:</strong> ${shippingFee === 0 ? "FREE" : `LKR ${shippingFee.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}</p>
          ${tax > 0 ? `<p style="margin: 0;"><strong>Tax:</strong> LKR ${tax.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>` : ""}
          <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 800; color: #111827; border-top: 1px solid #e5e7eb; padding-top: 8px;">TOTAL: LKR ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 35px; margin-bottom: 15px; border-top: 1px solid #f3f4f6; padding-top: 25px;">
        <a href="${baseUrl}/track-order?orderId=${order._id}" style="background-color: #111827; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
          View Your Order
        </a>
      </div>

      <div style="text-align: center; padding-top: 15px; font-size: 11px; color: #9ca3af;">
        <p>Thank you for shopping with us! ❤️</p>
        <p>If you have any questions, contact our support team. ${contactEmail}</p>
        <p style="margin-top: 5px;">&copy; ${new Date().getFullYear()} ${storeNameUpper}. All rights reserved.</p>
      </div>
    </div>
  `;

  // 1. Sending the invoice to the customer
  await transporter.sendMail({
    from: `"${storeName}" <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `Order Confirmed – #${orderNumber} | ${storeNameUpper}`,
    html: emailHtml,
  });

  // 2. Sending a copy informing you (Admin) that you have received a new order
  await transporter.sendMail({
    from: `"${storeName}" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `🚨 NEW ORDER RECEIVED - #${orderNumber}`,
    html: emailHtml,
  });
}