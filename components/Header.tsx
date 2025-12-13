"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-white/98 backdrop-blur-lg shadow-md border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className={`container mx-auto px-6 transition-all duration-300 ${
        isScrolled ? "py-2.5" : "py-4"
      }`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 transition-all duration-300">
            <Image
              src="/assets/hudder-logo.png"
              alt="Huddersfield Town AFC Logo"
              width={isScrolled ? 40 : 56}
              height={isScrolled ? 40 : 56}
              className="object-contain transition-all duration-300"
            />
          </Link>

          {/* Sign In Button */}
          <Link
            href="/signin"
            className={`group relative flex items-center gap-2 text-base font-medium transition-all duration-300 hover:text-primary px-4 py-2 rounded-lg ${
              isScrolled 
                ? "hover:bg-gray-50" 
                : "hover:bg-white/10"
            }`}
          >
            {/* White border on hover */}
            <div className={`absolute inset-0 rounded-lg border-2 border-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105 ${isScrolled ? "border-gray-900" : "border-white"}`}></div>
            
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke={isScrolled ? "currentColor" : "white"}
              className={`relative z-10 transition-all duration-300 group-hover:scale-110 ${isScrolled ? "w-5 h-5 text-gray-900" : "w-6 h-6 text-white"}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            <span className={`relative z-10 transition-all duration-300 group-hover:scale-105 ${isScrolled ? "text-gray-900 text-sm" : "text-white text-base"}`}>
              Sign In
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

