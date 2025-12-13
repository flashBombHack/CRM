"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [textRevealed, setTextRevealed] = useState(false);

  useEffect(() => {
    // Trigger logo animation
    const logoTimer = setTimeout(() => setLogoLoaded(true), 100);
    
    // Trigger text reveal
    const textTimer = setTimeout(() => setTextRevealed(true), 600);

    // Show splash for 2 seconds, then fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 500); // Fade out duration
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-800 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500">
        {/* Animated mesh gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-400 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full blur-3xl opacity-10 animate-pulse-slow delay-500"></div>
        </div>

        {/* Animated geometric shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-2 h-2 bg-white rounded-full opacity-60 animate-float"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-white rounded-full opacity-40 animate-float-delay-1"></div>
          <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-white rounded-full opacity-50 animate-float-delay-2"></div>
          <div className="absolute bottom-20 right-1/3 w-3 h-3 bg-white rounded-full opacity-30 animate-float-delay-3"></div>
          <div className="absolute top-1/2 right-10 w-2 h-2 bg-white rounded-full opacity-40 animate-float"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
        {/* Logo Container with sophisticated animation */}
        <div className="mb-12 md:mb-16">
          <div
            className={`relative transition-all duration-1000 ease-out ${
              fadeOut
                ? "opacity-0 scale-75 translate-y-[-50px] rotate-[-5deg]"
                : logoLoaded
                ? "opacity-100 scale-100 translate-y-0 rotate-0"
                : "opacity-0 scale-50 translate-y-20 rotate-12"
            }`}
          >
            {/* Glowing ring around logo */}
            <div
              className={`absolute inset-0 -m-8 rounded-full bg-white/20 blur-xl transition-all duration-1000 ${
                logoLoaded ? "opacity-100 scale-100" : "opacity-0 scale-50"
              }`}
            ></div>
            
            {/* Logo shadow/glow effect */}
            <div
              className={`absolute inset-0 -m-4 rounded-full bg-primary-200/30 blur-2xl transition-all duration-1000 ${
                logoLoaded ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDelay: logoLoaded ? "300ms" : "0ms" }}
            ></div>

            {/* Logo Image */}
            <div className="relative z-10">
              <Image
                src="/assets/hudder-logo.png"
                alt="Huddersfield Town AFC Logo"
                width={200}
                height={200}
                className="object-contain drop-shadow-2xl filter brightness-110"
                priority
                onLoad={() => setLogoLoaded(true)}
              />
            </div>
          </div>
        </div>

        {/* Text with elegant reveal animation */}
        <div className="text-center max-w-4xl mx-auto">
          <div
            className={`overflow-hidden transition-all duration-1000 ease-out ${
              fadeOut
                ? "opacity-0 translate-y-[50px]"
                : textRevealed
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white tracking-tight leading-tight mb-4">
              <span className="inline-block bg-gradient-to-r from-white via-primary-100 to-white bg-clip-text text-transparent animate-gradient-shift">
                Huddersfield Town
              </span>
            </h1>
            <div
              className={`h-1 w-0 mx-auto bg-gradient-to-r from-transparent via-white to-transparent transition-all duration-1000 ${
                textRevealed ? "w-full" : "w-0"
              }`}
              style={{ transitionDelay: textRevealed ? "500ms" : "0ms" }}
            ></div>
            <p
              className={`mt-6 text-xl md:text-2xl lg:text-3xl font-light text-primary-100 tracking-wider transition-all duration-1000 ${
                textRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}
              style={{ transitionDelay: textRevealed ? "700ms" : "0ms" }}
            >
              AFC
            </p>
          </div>
        </div>

        {/* Subtle loading indicator */}
        <div
          className={`absolute bottom-16 left-1/2 transform -translate-x-1/2 transition-opacity duration-500 ${
            textRevealed && !fadeOut ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: textRevealed ? "1s" : "0s" }}
        >
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

