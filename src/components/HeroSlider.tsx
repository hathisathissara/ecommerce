// src/components/HeroSlider.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image"; // <-- Next.js Image import කළා [1]

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

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  if (banners.length === 0) {
    return (
      <section className="relative bg-gray-100 py-24 sm:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-none">Elevate Your Senses ✨</h1>
            <p className="mt-4 text-lg text-gray-600">Explore our premium collection of imported luxury perfumes and cosmetics.</p>
          </div>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];
  const hasText = !!(currentBanner.title || currentBanner.subtitle);
  const hasLink = !!currentBanner.link;

  const Wrapper = hasLink ? Link : "div";
  const wrapperProps = hasLink
    ? { href: currentBanner.link as string }
    : {};

  return (
    <div className="relative w-full aspect-[3/2] sm:aspect-[21/8] max-h-[560px] overflow-hidden bg-gray-950">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          <Wrapper
            {...(wrapperProps as any)}
            className={`absolute inset-0 w-full h-full block z-20 ${hasLink ? "cursor-pointer" : ""}`}
          >
            <Image
              src={currentBanner.image}
              alt={currentBanner.title || "Banner"}
              fill
              priority
              unoptimized
              className="absolute inset-0 w-full h-full object-cover object-center transition duration-300 hover:scale-[1.01]"
            />
            {hasText && (
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />
            )}
            {hasText && (
              <div className="absolute inset-0 flex items-end sm:items-center pointer-events-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-6 sm:pb-0">
                  <div className="max-w-xl text-white space-y-3 sm:space-y-6">
                    {currentBanner.title && (
                      <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-2xl sm:text-5xl font-extrabold tracking-tight leading-tight"
                      >
                        {currentBanner.title}
                      </motion.h1>
                    )}
                    {currentBanner.subtitle && (
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-sm sm:text-lg text-gray-200"
                      >
                        {currentBanner.subtitle}
                      </motion.p>
                    )}
                    {hasLink && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <span className="inline-block bg-white text-black px-6 py-3 rounded-lg font-bold text-sm shadow-md">
                          Shop Now
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Wrapper>
        </motion.div>
      </AnimatePresence>

      {/* Dots Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-30">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition ${currentIndex === idx ? "bg-white scale-110" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}