"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show splash for 2.5 seconds, then fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 500); // Fade out duration
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-8 px-8">
        {/* Logo */}
        <div
          className={`transition-all duration-700 ease-out ${
            fadeOut
              ? "opacity-0 scale-90 translate-y-[-30px]"
              : "opacity-100 scale-100 translate-y-0"
          }`}
        >
          <Image
            src="/assets/hudder-logo.png"
            alt="Huddersfield Town AFC Logo"
            width={160}
            height={160}
            className="object-contain drop-shadow-lg"
            priority
          />
        </div>

        {/* Text - Centered with elegant styling */}
        <div
          className={`transition-all duration-700 delay-200 ease-out ${
            fadeOut
              ? "opacity-0 translate-y-[30px]"
              : "opacity-100 translate-y-0"
          }`}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-primary tracking-wide text-center leading-tight">
            Huddersfield Town AFC
          </h1>
        </div>
      </div>
    </div>
  );
}

