// src/components/HeroSlider.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface BannerType {
  _id: string;
  title?: string;
  subtitle?: string;
  image: string;
  link?: string;
}

interface HeroSliderProps {
  banners: BannerType[];
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (banners.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners, isHovered]);

  if (banners.length === 0) {
    return (
      <section className="relative bg-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-36 relative z-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">New Collection</p>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-900 leading-none">
              Elevate Your Senses ✨
            </h1>
            <p className="mt-5 text-base sm:text-lg text-gray-500 max-w-lg leading-relaxed">
              Explore our premium collection of imported luxury perfumes and cosmetics delivered across Sri Lanka.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 mt-8 bg-gray-900 text-white px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-700 transition-colors duration-200"
            >
              Shop Now <span>→</span>
            </Link>
          </div>
        </div>
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,_gray_1px,_transparent_0)] bg-[length:24px_24px]" />
      </section>
    );
  }

  const currentBanner = banners[currentIndex];

  const prevSlide = () => setCurrentIndex((i) => (i - 1 + banners.length) % banners.length);
  const nextSlide = () => setCurrentIndex((i) => (i + 1) % banners.length);

  return (
    <div
      className="relative w-full h-[340px] sm:h-[480px] lg:h-[560px] overflow-hidden bg-gray-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Banner Image */}
          <Image
            width={1920}
            height={1080}
            unoptimized
            src={currentBanner.image}
            alt={currentBanner.title || "Banner"}
            loading="eager"
            className="w-full h-full object-cover opacity-70"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

          {/* Text content */}
          {(currentBanner.title || currentBanner.subtitle) && (
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full">
                <div className="max-w-xl space-y-3 sm:space-y-5">
                  {currentBanner.title && (
                    <motion.h1
                      initial={{ y: 24, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15, duration: 0.55 }}
                      className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight"
                    >
                      {currentBanner.title}
                    </motion.h1>
                  )}
                  {currentBanner.subtitle && (
                    <motion.p
                      initial={{ y: 24, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.55 }}
                      className="text-sm sm:text-lg text-gray-200 leading-relaxed"
                    >
                      {currentBanner.subtitle}
                    </motion.p>
                  )}
                  {currentBanner.link && (
                    <motion.div
                      initial={{ y: 24, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.45, duration: 0.55 }}
                    >
                      <Link
                        href={currentBanner.link}
                        className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition shadow-lg"
                      >
                        Shop Now <span>→</span>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Prev/Next arrows (desktop only) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition hidden sm:flex items-center justify-center z-20"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition hidden sm:flex items-center justify-center z-20"
          >
            ›
          </button>
        </>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-20">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? "bg-white w-6 h-2"
                  : "bg-white/40 hover:bg-white/60 w-2 h-2"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}