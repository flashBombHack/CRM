"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import SplashScreen from "@/components/SplashScreen";
import Header from "@/components/Header";
import Link from "next/link";

const SPLASH_SCREEN_SEEN_KEY = "splash_screen_seen";

export default function Home() {
  const [showSplash, setShowSplash] = useState(false);
  const [splashComplete, setSplashComplete] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if splash screen has been shown in this session
    if (typeof window !== "undefined") {
      const hasSeenSplash = sessionStorage.getItem(SPLASH_SCREEN_SEEN_KEY);
      if (!hasSeenSplash) {
        // First visit in this session - show splash screen
        setShowSplash(true);
        // Mark as seen for this session
        sessionStorage.setItem(SPLASH_SCREEN_SEEN_KEY, "true");
      } else {
        // Already seen in this session - skip splash and show hero animations immediately
        setSplashComplete(true);
      }
      setIsChecking(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Delay hero animations after splash completes to ensure visibility
    setTimeout(() => {
      setSplashComplete(true);
    }, 300);
  };

  // Don't render until we've checked localStorage
  if (isChecking) {
    return null;
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      
      <div className="relative min-h-screen">
        <Header />
        
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/HeroBG.png"
              alt="Team Collaboration"
              fill
              className="object-cover"
              priority
              quality={90}
            />
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 container mx-auto px-6 py-32">
            <div className="max-w-5xl mx-auto text-center">
              {/* Top Tagline */}
              <div className={`mb-6 ${splashComplete ? "animate-fade-in" : "opacity-0"}`}>
                <p className="text-white text-lg font-light tracking-wide">
                  Efficiency Insight. Growth.
                </p>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                <span className={`inline-block ${splashComplete ? "animate-text-reveal" : "opacity-0"}`}>
                  The All-In-One CRM Powering HTAFC&apos;s{" "}
                </span>
                <span className={`relative inline-block text-[#4DA3E0] ${splashComplete ? "animate-text-reveal-delay" : "opacity-0"}`}>
                  Growth
                  <span className={`absolute -bottom-2 left-0 w-full h-0.5 bg-[#4DA3E0] ${splashComplete ? "animate-underline-expand" : ""}`}></span>
                  <span className="absolute -bottom-2 left-full ml-0.5 inline-block">
                    <svg 
                      className="text-[#4DA3E0]" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      <path d="M3 3L3 11L7 10L10 13L13 3L3 3Z" />
                    </svg>
                  </span>
                </span>
              </h1>

              {/* Description */}
              <p className={`text-white/90 text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed ${splashComplete ? "animate-text-reveal-delay-2" : "opacity-0"}`}>
                Manage sponsorship products, track donor engagement, monitor
                campaign performance, and unlock deeper insights.
              </p>

              {/* CTA Button */}
              <div className="animate-fade-in-delay-3">
                <Link
                  href="/get-started"
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-semibold rounded-lg shadow-lg hover:bg-primary-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Teaser Section */}
        <section className="bg-[#F2F8FC] py-20 md:py-28">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto text-center">
              {/* Marketing Slogan */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                See Everything That Matters — Instantly
              </h2>
              
              {/* Descriptive Text */}
              <p className="text-lg md:text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
                HTAFC&apos;s CRM gives commercial, marketing, and sponsorship teams the visibility they need to grow revenue and fan loyalty.
              </p>

              {/* Dashboard Teaser Image */}
              <div className={`relative w-full max-w-6xl mx-auto ${splashComplete ? "animate-slow-bounce" : ""}`}>
                <div className={`relative overflow-hidden rounded-lg shadow-2xl ${splashComplete ? "animate-dashboard-reveal" : "opacity-0"}`}>
                  <Image
                    src="/assets/DashboardTeaser.png"
                    alt="HTAFC CRM Dashboard Preview"
                    width={1200}
                    height={800}
                    className="w-full h-auto rounded-lg"
                    priority
                    quality={90}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative bg-primary py-6 md:py-8">
          {/* Light Blue Horizontal Line - positioned slightly above center */}
          <div className="absolute top-[45%] left-0 right-0 h-px bg-[#4DA3E0]"></div>
          
          <div className="relative container mx-auto px-6">
            <div className="flex flex-col items-center justify-center min-h-[100px]">
              {/* Huddersfield Town AFC Crest/Logo - positioned below the line */}
              <div className="mt-8 mb-4">
                <Image
                  src="/assets/hudder-logo.png"
                  alt="Huddersfield Town AFC Crest"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>

              {/* Copyright Text */}
              <p className="text-white text-xs md:text-sm text-center">
                Copyright © HTAFC&apos;s 2025 All rights reserved
              </p>
            </div>
          </div>

          {/* Thin Black Line at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-black"></div>
        </footer>
      </div>
    </>
  );
}
