"use client";

import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login"); // Logout වුණාම ආයේ Login page එකට යනවා
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome to Admin Dashboard ⚙️</h1>
          <p className="text-gray-500 mt-1">Here you can manage categories, products, and orders.</p>
        </div>
        
        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}