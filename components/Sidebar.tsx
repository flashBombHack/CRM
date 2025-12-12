"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiHome,
  HiCube,
  HiServer,
  HiChartBar,
  HiUserGroup,
  HiTicket,
  HiShoppingBag,
  HiHand,
  HiSpeakerphone,
  HiChevronDown,
  HiChevronRight,
  HiMenu,
  HiX,
} from "react-icons/hi";

interface NavItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  hasDropdown?: boolean;
  badge?: string;
  badgeColor?: string;
}

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { name: "Home", icon: <HiHome className="w-5 h-5" />, href: "/dashboard" },
    { name: "Products & Assets", icon: <HiCube className="w-5 h-5" />, href: "/products" },
    { name: "Services", icon: <HiServer className="w-5 h-5" />, href: "/services" },
    { name: "Reports & Analytics", icon: <HiChartBar className="w-5 h-5" />, href: "/reports" },
    { name: "Accounts", icon: <HiUserGroup className="w-5 h-5" />, href: "/accounts" },
    { name: "Ticketing", icon: <HiTicket className="w-5 h-5" />, href: "/ticketing" },
    { name: "Sales", icon: <HiShoppingBag className="w-5 h-5" />, href: "/sales", hasDropdown: true },
    { name: "Partnership", icon: <HiHand className="w-5 h-5" />, href: "/partnership", hasDropdown: true, badge: "Partnership", badgeColor: "bg-green-500" },
    { name: "Marketing", icon: <HiSpeakerphone className="w-5 h-5" />, href: "/marketing", hasDropdown: true, badge: "Marketing", badgeColor: "bg-yellow-500" },
  ];

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-primary transition-all duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "w-20" : "w-64"} h-screen overflow-y-auto`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-4 border-b border-primary-600">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <Image
                  src="/assets/hudder-logo.png"
                  alt="Huddersfield Town AFC Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <span className="text-white font-semibold text-sm">Huddersfield Town AFC</span>
              </div>
            )}
            {isCollapsed && (
              <div className="flex justify-center w-full">
                <Image
                  src="/assets/hudder-logo.png"
                  alt="Huddersfield Town AFC Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block text-white hover:text-gray-300 p-1.5 bg-white/10 rounded"
            >
              <span className="text-white font-bold text-xs">K</span>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => {
                    if (item.hasDropdown) {
                      toggleDropdown(item.name);
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-primary-600 text-white"
                      : "text-gray-300 hover:bg-primary-600 hover:text-white"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">{item.name}</span>
                      {item.hasDropdown && (
                        <span>
                          {openDropdowns.includes(item.name) ? (
                            <HiChevronDown className="w-4 h-4" />
                          ) : (
                            <HiChevronRight className="w-4 h-4" />
                          )}
                        </span>
                      )}
                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${item.badgeColor} text-white`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

