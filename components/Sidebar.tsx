"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import SvgIcon from "./SvgIcon";
import {
  HiChevronDown,
  HiChevronRight,
  HiMenu,
  HiX,
} from "react-icons/hi";

interface NavItem {
  name: string;
  iconSrc: string;
  href: string;
  hasDropdown?: boolean;
  subItems?: { name: string; href: string }[];
}

interface BottomNavItem {
  name: string;
  iconSrc: string;
  href?: string;
  onClick?: () => void;
}

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>(["Sales"]); // Sales open by default
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    { name: "Home", iconSrc: "/assets/icons/HomeIcon.svg", href: "/dashboard" },
    { name: "Products & Assets", iconSrc: "/assets/icons/ProductIcon.svg", href: "/products" },
    { name: "Services", iconSrc: "/assets/icons/ServicesIcon.svg", href: "/services" },
    { name: "Reports & Analytics", iconSrc: "/assets/icons/ReportsIcon.svg", href: "/reports" },
    { name: "Accounts", iconSrc: "/assets/icons/AccountsIcon.svg", href: "/accounts" },
    { name: "Ticketing", iconSrc: "/assets/icons/TicketingIcon.svg", href: "/ticketing" },
    { 
      name: "Sales", 
      iconSrc: "/assets/icons/SalesIcon.svg", 
      href: "/sales/leads", 
      hasDropdown: true,
      subItems: [
        { name: "Stage 1 – Leads", href: "/sales/leads" },
        { name: "Stage 2 – Qualification", href: "/sales/qualification" },
        { name: "Stage 3 – Opportunity", href: "/sales/opportunity" },
        { name: "Stage 4 – Discovery", href: "/sales/discovery" },
        { name: "Stage 5 – Proposal", href: "/sales/proposal" },
        { name: "Stage 6 – Contracts", href: "/sales/contracts" },
        { name: "Stage 7 – Activation", href: "/sales/activation" },
        { name: "Stage 8 – Invoice", href: "/sales/invoice" },
        { name: "Stage 9 – Customer", href: "/sales/customer" },
        { name: "Stage 10 – Renewal", href: "/sales/renewal" },
      ]
    },
    { name: "Partnership", iconSrc: "/assets/icons/PartnershipIcon.svg", href: "/partnership", hasDropdown: true },
    { name: "Marketing", iconSrc: "/assets/icons/MarketingIcon.svg", href: "/marketing", hasDropdown: true },
  ];

  const bottomNavItems: BottomNavItem[] = [
    { name: "Help & Support", iconSrc: "/assets/icons/HelpIcon.svg", href: "/help" },
    { name: "Settings", iconSrc: "/assets/icons/SettingsIcon.svg", href: "/settings" },
    { name: "Logout", iconSrc: "/assets/icons/LogoutIcon.svg", onClick: async () => {
      await logout();
      router.push("/signin");
    }},
  ];

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isSalesSubRouteActive = () => {
    return pathname.startsWith("/sales/") && pathname !== "/sales";
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
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm leading-tight">Huddersfield Town</span>
                  <span className="text-white font-semibold text-sm leading-tight">AFC</span>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="flex justify-center w-full">
                <Image
                  src="/assets/hudder-logo.png"
                  alt="Huddersfield Town AFC Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block text-white hover:text-gray-300 p-1.5 rounded"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                {isCollapsed ? (
                  // Arrow pointing right with vertical line on the right
                  <>
                    <line x1="3" y1="9" x2="12" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M9 4.5L12 9L9 13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="15" y1="3" x2="15" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </>
                ) : (
                  // Arrow pointing left with vertical line on the left
                  <>
                    <line x1="15" y1="9" x2="6" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M9 4.5L6 9L9 13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="3" y1="3" x2="3" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </>
                )}
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto sidebar-nav-scroll">
            {navItems.map((item) => {
              const isDropdownOpen = openDropdowns.includes(item.name);
              const isSalesItem = item.name === "Sales";
              const hasActiveSubRoute = isSalesItem && isSalesSubRouteActive();
              
              // Mark Sales parent as active when any sub-route is active, or use normal active logic
              const active = (isSalesItem && hasActiveSubRoute) || isActive(item.href);
              
              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      if (item.hasDropdown) {
                        e.preventDefault();
                        toggleDropdown(item.name);
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      active
                        ? "bg-white"
                        : "text-white hover:bg-white/10"
                    } ${isCollapsed ? "justify-center" : ""}`}
                  >
                    <span className="flex-shrink-0">
                      <SvgIcon
                        src={item.iconSrc}
                        color={active ? "#0072CE" : "white"}
                        width={18}
                        height={18}
                      />
                    </span>
                    {!isCollapsed && (
                      <>
                        <span className={`flex-1 text-sm font-medium ${active ? "text-primary" : "text-white"}`}>
                          {item.name}
                        </span>
                        {item.hasDropdown && (
                          <span className={active ? "text-primary" : "text-white"}>
                            {isDropdownOpen ? (
                              <HiChevronDown className="w-4 h-4" />
                            ) : (
                              <HiChevronRight className="w-4 h-4" />
                            )}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                  
                  {/* Sub-items for Sales */}
                  {isDropdownOpen && item.subItems && !isCollapsed && (
                    <div className="relative ml-4 mt-1">
                      {/* Dotted line on the left */}
                      <div className="absolute left-0 top-0 bottom-0 w-px border-l-2 border-dashed border-white/30"></div>
                      
                      <div className="space-y-1 pl-6">
                        {item.subItems.map((subItem) => {
                          const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + "/");
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`block py-2 text-sm transition-colors ${
                                isSubActive
                                  ? "font-bold text-white"
                                  : "font-normal text-white/70 hover:text-white"
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom Navigation Items */}
          <div className="p-4 border-t border-primary-600 space-y-1">
            {bottomNavItems.map((item) => {
              const active = item.href ? isActive(item.href) : false;
              const className = `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${
                active
                  ? "bg-white"
                  : "text-white hover:bg-white/10"
              } ${isCollapsed ? "justify-center" : ""}`;

              if (item.href) {
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={className}
                  >
                    <span className="flex-shrink-0">
                      <SvgIcon
                        src={item.iconSrc}
                        color={active ? "#0072CE" : "white"}
                        width={18}
                        height={18}
                      />
                    </span>
                    {!isCollapsed && (
                      <span className={`text-sm font-medium ${active ? "text-primary" : "text-white"}`}>
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              }

              return (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  type="button"
                  className={className}
                >
                  <span className="flex-shrink-0">
                    <SvgIcon
                      src={item.iconSrc}
                      color={active ? "#0072CE" : "white"}
                      width={18}
                      height={18}
                    />
                  </span>
                  {!isCollapsed && (
                    <span className={`text-sm font-medium ${active ? "text-primary" : "text-white"}`}>
                      {item.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
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

