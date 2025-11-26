import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Home,
  MessageCircle,
  Users,
  Music,
  Film,
  BookOpen,
  Wallet,
  ChevronDown,
} from "lucide-react";
import { useAppSelector } from "@/features/hooks";
import UserMenu from "./UserMenu";
import { Link, useLocation } from "react-router-dom";

const navigationGroups = [
  {
    id: "social",
    label: "Kết nối",
    icon: MessageCircle,
    items: [
      {
        name: "Chat",
        href: "/chat/messages",
        icon: MessageCircle,
        description: "Trò chuyện với bạn bè",
        requireAuth: true,
        openInNewTab: true,
      },
      {
        name: "Danh Bạ",
        href: "/chat/contacts",
        icon: Users,
        description: "Quản lý danh bạ của bạn",
        requireAuth: true,
        openInNewTab: true,
      },
    ],
  },
  {
    id: "media",
    label: "Giải trí",
    icon: Music,
    items: [
      {
        name: "Music",
        href: "/music",
        icon: Music,
        description: "Nghe nhạc thư giãn",
        requireAuth: true,
        openInNewTab: true,
      },
      {
        name: "Reels",
        href: "/reels",
        icon: Film,
        description: "Xem video ngắn",
        requireAuth: true,
        openInNewTab: true,
      },
    ],
  },
  {
    id: "content",
    label: "Nội dung",
    icon: BookOpen,
    items: [
      {
        name: "Blog",
        href: "/blogs",
        icon: BookOpen,
        description: "Đọc và viết blog",
        requireAuth: true,
      },
      {
        name: "Expense Tracker",
        href: "/expenses",
        icon: Wallet,
        description: "Quản lý chi tiêu",
        requireAuth: true,
      },
    ],
  },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const location = useLocation();

  const { isLogin } = useAppSelector((state) => state.auth);

  const isActiveLink = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const isGroupActive = (items: (typeof navigationGroups)[0]["items"]) => {
    return items.some((item) => isActiveLink(item.href));
  };

  const handleNavClick = (
    e: React.MouseEvent,
    item: { openInNewTab?: boolean; href: string }
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

          <nav className="hidden md:flex items-center space-x-1">
            {/* Home Link */}
            <Link
              to="/"
              className={`
                relative px-4 py-2 font-medium transition-all duration-300 rounded-lg flex items-center gap-2
                ${
                  location.pathname === "/"
                    ? "text-purple-600 bg-purple-50"
                    : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"
                }
                group
              `}
            >
              <Home className="w-4 h-4" />
              Trang chủ
              <span
                className={`
                  absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300
                  ${
                    location.pathname === "/"
                      ? "w-3/4"
                      : "w-0 group-hover:w-3/4"
                  }
                `}
              />
            </Link>

            {/* Navigation Groups with Dropdown */}
            {navigationGroups.map((group) => {
              if (!isLogin) return null;

              const GroupIcon = group.icon;
              const isActive = isGroupActive(group.items);

              return (
                <div
                  key={group.id}
                  className="relative"
                  onMouseEnter={() => setHoveredGroup(group.id)}
                  onMouseLeave={() => setHoveredGroup(null)}
                >
                  <button
                    className={`
                      relative px-4 py-2 font-medium transition-all duration-300 rounded-lg flex items-center gap-2
                      ${
                        isActive || hoveredGroup === group.id
                          ? "text-purple-600 bg-purple-50"
                          : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"
                      }
                      group
                    `}
                  >
                    <GroupIcon className="w-4 h-4" />
                    {group.label}
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-300 ${
                        hoveredGroup === group.id ? "rotate-180" : ""
                      }`}
                    />
                    <span
                      className={`
                        absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300
                        ${
                          isActive || hoveredGroup === group.id
                            ? "w-3/4"
                            : "w-0 group-hover:w-3/4"
                        }
                      `}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {hoveredGroup === group.id && (
                    <div className="absolute top-full left-0 pt-2">
                      <div className="w-72 bg-white rounded-lg shadow-xl border border-purple-100/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-2">
                          {group.items.map((item) => {
                            const ItemIcon = item.icon;
                            const isItemActive = isActiveLink(item.href);

                            return (
                              <Link
                                key={item.name}
                                to={item.href}
                                onClick={(e) => handleNavClick(e, item)}
                                className={`
                                  flex items-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 group/item
                                  ${
                                    isItemActive
                                      ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600"
                                      : "hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50/50 text-gray-700 hover:text-purple-600"
                                  }
                                `}
                              >
                                <ItemIcon
                                  className={`w-5 h-5 mt-0.5 flex-shrink-0 transition-all duration-200 ${
                                    isItemActive
                                      ? "text-purple-600"
                                      : "text-gray-500 group-hover/item:text-purple-600 group-hover/item:scale-110"
                                  }`}
                                />
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`font-medium transition-colors duration-200 ${
                                      isItemActive
                                        ? "text-purple-600"
                                        : "text-gray-900 group-hover/item:text-purple-600"
                                    }`}
                                  >
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5 transition-colors duration-200 group-hover/item:text-gray-600">
                                    {item.description}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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

        {isMobileMenuOpen && (
          <div className="md:hidden animate-in slide-in-from-top duration-300">
            <div className="px-2 pt-2 pb-3 space-y-3 bg-white/95 backdrop-blur-lg border-t border-purple-100/50">
              {/* Home Link Mobile */}
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all duration-300
                  ${
                    location.pathname === "/"
                      ? "text-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-600"
                      : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"
                  }
                `}
              >
                <Home className="w-5 h-5" />
                Trang chủ
              </Link>

              {/* Navigation Groups Mobile */}
              {isLogin &&
                navigationGroups.map((group) => (
                  <div key={group.id} className="space-y-1">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <group.icon className="w-4 h-4" />
                      {group.label}
                    </div>
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
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
                          flex items-center gap-3 px-4 py-3 ml-4 text-base font-medium rounded-lg transition-all duration-300
                          ${
                            isActive
                              ? "text-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-600"
                              : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"
                          }
                        `}
                        >
                          <ItemIcon className="w-5 h-5" />
                          <div>
                            <p>{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ))}

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
