# 🛍️ The Store — Luxury E-Commerce Platform

A full-stack e-commerce web application built with **Next.js 16**, **MongoDB**, and **Tailwind CSS**. Features a premium white-themed storefront and a complete admin panel for managing the entire business.

---

## ✨ Features

### 🏪 Storefront (Customer-Facing)

| Feature | Description |
|---|---|
| **Homepage** | Dynamic hero banners/slider, featured categories, product grids, newsletter signup |
| **Product Listing** | Filter by category/brand, search, sort by price/name, responsive card grid |
| **Shopping Cart** | Live quantity controls, delivery charge calculator, free-shipping progress bar |
| **Wishlist** | Save favourite products, persisted via localStorage |
| **Checkout** | Shipping form, Cash on Delivery & Bank Transfer payment methods, bank slip upload |
| **Order Tracking** | Track order status by Order ID or email, with 1-click auto-tracking links from emails |
| **Automated Emails** | Beautifully styled HTML invoice & order confirmation emails sent via Nodemailer |
| **Gift Builder** | Build custom gift boxes by picking products and a box style |
| **Contact Page** | Contact form that saves inquiries to the database, displays store info |
| **Coupon / Promo Codes** | Apply discount codes at checkout (percentage or fixed amount) |
| **Newsletter** | Email subscription captured and stored in the database |
| **Free Shipping Banner** | Dynamic threshold fetched from admin settings |

### 🔐 Admin Panel (`/admin`)

| Section | Description |
|---|---|
| **Dashboard** | Live stats — total products, categories, orders, pending orders, recent activity |
| **Products** | Add / edit / delete products with images (Cloudinary), variants (size, price, stock, SKU), category & brand linking |
| **Categories** | Create and manage product categories with images |
| **Brands** | Manage brand list with logos |
| **Boxes** | Manage gift box styles used in the Gift Builder |
| **Coupons** | Create percentage or fixed discount coupons with expiry dates and minimum order values |
| **Banners** | Upload and manage homepage hero/slider banners |
| **Orders** | Inbox-style order viewer, update order status, view bank transfer slips |
| **Reviews** | Moderate customer product reviews — approve or delete |
| **Contact Inquiries** | View and delete customer contact form messages |
| **Newsletter** | View and manage email subscribers |
| **Settings** | Configure store name, logo, contact details, bank account info, delivery charges, free-shipping threshold |
| **Secure Login** | JWT-based admin authentication with bcrypt password hashing |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | TypeScript |
| **Database** | MongoDB via [Mongoose](https://mongoosejs.com/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Image Hosting** | [Cloudinary](https://cloudinary.com/) |
| **Authentication** | JSON Web Tokens (JWT) + bcrypt |
| **UI Components** | Shadcn/UI, Radix UI, Lucide React, HugeIcons |
| **Animations** | Framer Motion |
| **Forms** | React Hook Form + Zod validation |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- A **MongoDB** database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A **Cloudinary** account (free tier is sufficient)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ecommerce.git
cd ecommerce
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT Secret (use a long, random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary (from your Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App URL (used for internal API calls)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Seed the Admin User

You need to create the initial admin account in your MongoDB database. Use **MongoDB Compass** or the Mongo shell to insert a document into the `admins` collection:

```js
// In MongoDB shell or Compass
db.admins.insertOne({
  username: "admin",
  // bcrypt hash of your password — generate at https://bcrypt-generator.com/ with 10 rounds
  password: "$2b$10$your_bcrypt_hashed_password_here"
})
```

Alternatively, you can create a one-time seed script:

```ts
// scripts/seed-admin.ts
import bcrypt from "bcrypt";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";

async function main() {
  await connectDB();
  const hash = await bcrypt.hash("your_password", 10);
  await Admin.create({ username: "admin", password: hash });
  console.log("Admin created!");
  process.exit(0);
}

main();
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront.  
Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login) to access the admin panel.

---

## 📁 Project Structure

```
ecommerce/
├── public/                     # Static assets
├── src/
│   ├── app/
│   │   ├── (store)/            # Storefront routes (grouped layout)
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── products/       # Product listing & detail
│   │   │   ├── cart/           # Shopping cart
│   │   │   ├── checkout/       # Checkout + payment
│   │   │   ├── wishlist/       # Saved items
│   │   │   ├── track-order/    # Order tracking
│   │   │   ├── gift-builder/   # Custom gift builder
│   │   │   └── contact/        # Contact form
│   │   ├── admin/              # Admin panel routes
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── login/          # Admin login
│   │   │   ├── products/       # Product management
│   │   │   ├── categories/     # Category management
│   │   │   ├── brands/         # Brand management
│   │   │   ├── boxes/          # Gift box management
│   │   │   ├── coupons/        # Coupon management
│   │   │   ├── banners/        # Banner management
│   │   │   ├── orders/         # Order management
│   │   │   ├── reviews/        # Review moderation
│   │   │   ├── contact/        # Inquiry inbox
│   │   │   ├── newsletter/     # Subscriber list
│   │   │   └── settings/       # Site settings
│   │   └── api/                # API routes (Next.js Route Handlers)
│   │       ├── admin/          # Admin CRUD endpoints
│   │       ├── checkout/       # Order placement
│   │       ├── coupons/        # Coupon validation
│   │       ├── contact/        # Contact form submission
│   │       ├── newsletter/     # Newsletter subscription
│   │       ├── orders/         # Order tracking
│   │       ├── reviews/        # Review submission
│   │       └── settings/       # Public settings endpoint
│   ├── components/             # Shared UI components
│   ├── context/                # React Context (Cart, Wishlist)
│   ├── lib/                    # Utilities (DB connection, helpers)
│   ├── models/                 # Mongoose data models
│   └── middleware.ts           # Auth middleware (admin route protection)
├── .env.local                  # Environment variables (not committed)
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 📦 Available Scripts

```bash
npm run dev       # Start development server (http://localhost:3000)
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## 🔒 Admin Authentication

The admin panel is protected by a **JWT-based middleware** (`src/middleware.ts`). All `/admin/*` routes (except `/admin/login`) require a valid token stored as an HTTP-only cookie. Tokens are issued on login and expire after 24 hours.

---

## ☁️ Image Uploads

All product images, category images, brand logos, banner images, and bank transfer slips are uploaded directly to **Cloudinary** via the `/admin/upload` API route. Images are returned as secure URLs and stored in MongoDB.

---

## 🌐 Deployment

This app can be deployed to **Vercel** in minutes:

1. Push your code to GitHub
2. Import the repository on [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Click **Deploy**

> Make sure your MongoDB Atlas cluster allows connections from Vercel's IP ranges (or use `0.0.0.0/0` for development).

---

## 📄 License

This project is for private/commercial use. All rights reserved.
