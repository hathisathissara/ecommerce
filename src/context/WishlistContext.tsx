// src/context/WishlistContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const loadWishlist = async () => {
      const savedWishlist = localStorage.getItem("wishlist");
      if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist));
    };
    loadWishlist();
  }, []);

  useEffect(() => {
    if (wishlistItems.length > 0) {
      localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
    } else {
      localStorage.removeItem("wishlist");
    }
  }, [wishlistItems]);

  const toggleWishlist = (item: WishlistItem) => {
    setWishlistItems((prev) => {
      const exists = prev.find((i) => i._id === item._id);
      if (exists) {
        return prev.filter((i) => i._id !== item._id); // දැනටමත් තිබේ නම් අයින් කරයි
      }
      return [...prev, item]; // නැත්නම් එකතු කරයි
    });
  };

  const isInWishlist = (id: string) => wishlistItems.some((i) => i._id === id);

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist, wishlistCount: wishlistItems.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}