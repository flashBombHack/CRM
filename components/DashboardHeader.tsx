"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  HiPlus,
  HiChevronDown,
  HiSearch,
} from "react-icons/hi";
import { useAuth } from "@/lib/contexts/AuthContext";
import SvgIcon from "./SvgIcon";

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Get current section name from pathname
  const getSectionName = () => {
    if (pathname.startsWith("/sales/")) {
      return "Sales";
    }
    if (pathname.startsWith("/products")) {
      return "Products & Assets";
    }
    if (pathname.startsWith("/services")) {
      return "Services";
    }
    if (pathname.startsWith("/reports") || pathname.startsWith("/ai-ideas")) {
      return "Reports & Analytics";
    }
    if (pathname.startsWith("/accounts")) {
      return "Accounts";
    }
    if (pathname.startsWith("/ticketing")) {
      return "Ticketing";
    }
    if (pathname.startsWith("/partnership")) {
      return "Partnership";
    }
    if (pathname.startsWith("/marketing")) {
      return "Marketing";
    }
    return "Dashboard";
  };

  const handleLogout = async () => {
    setShowProfileDropdown(false);
    await logout();
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName.substring(0, 2).toUpperCase();
    }
    if (!user?.email) return "U";
    const parts = user.email.split("@")[0].split(".");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (!user?.email) return "User";
    return user.email.split("@")[0];
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Title and Search */}
          <div className="flex items-center gap-6 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{getSectionName()}</h1>
            <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 flex-1 max-w-md">
              <HiSearch className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent border-none outline-none flex-1 text-sm"
              />
            </div>
          </div>

          {/* Right Side - Icons and Profile */}
          <div className="flex items-center gap-3">
            {/* Action Icons */}
            <button className="p-2 text-white bg-primary hover:bg-primary-600 rounded-lg transition-colors">
              <HiPlus className="w-5 h-5" />
            </button>
            <button className="p-2 bg-[#FAFAFA] hover:bg-gray-200 rounded-lg transition-colors">
              <SvgIcon
                src="/assets/icons/HelpIcon2.svg"
                color="black"
                width={20}
                height={20}
              />
            </button>
            <button className="p-2 bg-[#FAFAFA] hover:bg-gray-200 rounded-lg transition-colors relative">
              <SvgIcon
                src="/assets/icons/NotificationIcon.svg"
                color="black"
                width={20}
                height={20}
              />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 bg-[#FAFAFA] hover:bg-gray-200 rounded-lg transition-colors relative">
              <SvgIcon
                src="/assets/icons/MessageIcon.svg"
                color="black"
                width={20}
                height={20}
              />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {getUserInitials()}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {getUserDisplayName()}
                </span>
                <HiChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email || 'User'}
                    </p>
                    {user?.email && (user?.firstName || user?.lastName) && (
                      <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowProfileDropdown(false)}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setShowProfileDropdown(false)}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}

