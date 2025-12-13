"use client";

import { useEffect } from "react";

export default function ImagePreloader() {
  useEffect(() => {
    // Critical images that must be loaded before rendering
    const criticalImages = [
      "/assets/hudder-logo.png",
      "/assets/HeroBG.png",
      "/assets/SideBG.png",
      "/assets/DashboardTeaser.png",
    ];

    // Aggressive preloading - create Image objects to force browser to fetch
    const imagePromises = criticalImages.map((src) => {
      return new Promise((resolve, reject) => {
        // Add preload link to head
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = src;
        link.fetchPriority = "high";
        document.head.appendChild(link);

        // Also create Image object to force actual loading
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(new Error(`Failed to load ${src}`));
        img.src = src;
      });
    });

    // Wait for all critical images to load
    Promise.all(imagePromises).catch((error) => {
      console.warn("Some images failed to preload:", error);
    });
  }, []);

  return null;
}

