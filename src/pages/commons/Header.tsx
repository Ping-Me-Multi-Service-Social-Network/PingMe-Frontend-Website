"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAppSelector } from "@/features/hooks";
import UserMenu from "./UserMenu";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const { isLogin } = useAppSelector((state) => state.auth);

  const navigationItems = [
    { name: "Trang chủ", href: "/" },
    { name: "Nhật ký", href: "/diary", requireAuth: true },
    { name: "Blog", href: "/blogs", requireAuth: true },
    { name: "Chi tiêu", href: "/expenses", requireAuth: true },
    {
      name: "Trò chuyện",
      href: "/chat/messages",
      requireAuth: true,
      openInNewTab: true,
    },
    {
      name: "Danh bạ",
      href: "/chat/contacts",
      requireAuth: true,
      openInNewTab: true,
    },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const handleNavClick = (
    e: React.MouseEvent,
    item: (typeof navigationItems)[0]
  ) => {
    if (item.openInNewTab) {
      e.preventDefault();
      window.open(item.href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-lg border-b border-purple-100/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={"/"}>
            <div className="flex items-center space-x-3 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full group-hover:scale-110 transition-all duration-300">
                <img
                  src="/logo.png"
                  alt="PingMe Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  PingMe
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Chat & Connect</p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => {
              if (!isLogin && item.requireAuth) {
                return null;
              }
              const isActive = isActiveLink(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`
                    relative px-4 py-2 font-medium transition-all duration-300 rounded-lg
                    ${
                      isActive
                        ? "text-purple-600 bg-purple-50"
                        : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"
                    }
                    group
                  `}
                >
                  {item.name}
                  <span
                    className={`
                      absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300
                      ${isActive ? "w-3/4" : "w-0 group-hover:w-3/4"}
                    `}
                  />
                </Link>
              );
            })}

            {isLogin ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-3 ml-4">
                <Link to={"/auth?mode=login"}>
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300"
                  >
                    Đăng nhập
                  </Button>
                </Link>
                <Link to={"/auth?mode=register"}>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-300">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button and UserMenu */}
          <div className="md:hidden flex items-center space-x-2">
            {isLogin && <UserMenu />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hover:bg-purple-50 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-purple-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden animate-in slide-in-from-top duration-300">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-lg border-t border-purple-100/50">
              {navigationItems.map((item) => {
                if (!isLogin && item.requireAuth) {
                  return null;
                }
                const isActive = isActiveLink(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={(e) => {
                      handleNavClick(e, item);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      block px-4 py-3 text-base font-medium rounded-lg transition-all duration-300
                      ${
                        isActive
                          ? "text-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-600"
                          : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                );
              })}

              {!isLogin && (
                <div className="flex flex-col gap-3 px-3 pt-4 border-t border-purple-100 mt-4">
                  <Link
                    to={"/auth?mode=login"}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-center border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent transition-all duration-300"
                    >
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link
                    to={"/auth?mode=register"}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md transition-all duration-300">
                      Đăng ký
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
