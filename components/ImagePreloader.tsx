"use client";

import { useEffect } from "react";

export default function ImagePreloader() {
  useEffect(() => {
    // Preload critical images for landing page and signin screen
    const imagesToPreload = [
      "/assets/HeroBG.png",
      "/assets/SideBG.png",
      "/assets/DashboardTeaser.png",
      "/assets/hudder-logo.png",
    ];

    imagesToPreload.forEach((src) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      document.head.appendChild(link);
    });

    // Cleanup function to remove preload links when component unmounts
    return () => {
      imagesToPreload.forEach((src) => {
        const links = document.querySelectorAll(`link[href="${src}"]`);
        links.forEach((link) => link.remove());
      });
    };
  }, []);

  return null;
}

