"use client";

import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Users,
  FileText,
  BarChart3,
  Music,
  Disc3,
  User,
  Tag,
  ChevronLeft,
  ChevronRight,
  Home,
  Video,
} from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navGroups = [
  {
    name: "Ping Profile",
    items: [
      {
        path: "/admin/accounts",
        label: "Quản lý tài khoản",
        icon: Users,
      },
    ],
  },
  {
    name: "Ping Blog",
    items: [
      {
        path: "/admin/blogs",
        label: "Quản lý blog",
        icon: FileText,
      },
    ],
  },
  {
    name: "Ping Music",
    items: [
      {
        path: "/admin/music",
        label: "Quản lý nhạc",
        icon: Music,
      },
      {
        path: "/admin/albums",
        label: "Quản lý album",
        icon: Disc3,
      },
      {
        path: "/admin/artists",
        label: "Quản lý nghệ sĩ",
        icon: User,
      },
      {
        path: "/admin/genres",
        label: "Quản lý thể loại",
        icon: Tag,
      },
    ],
  },
  {
    name: "Ping Reel",
    items: [
      {
        path: "/admin/reels",
        label: "Quản lý reels",
        icon: Video,
      },
    ],
  },
  {
    name: "Thống kê",
    items: [
      {
        path: "/admin/statistics",
        label: "Thống kê",
        icon: BarChart3,
      },
    ],
  },
];

export default function AdminNavigation() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div
          className={cn(
            "border-b border-gray-200 flex items-center transition-all duration-300",
            isCollapsed ? "p-3 justify-center" : "p-6 justify-between"
          )}
        >
          {!isCollapsed && (
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Ping Admin
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0 border border-gray-200"
            )}
            aria-label={isCollapsed ? "Mở sidebar" : "Đóng sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-6">
            {navGroups.map((group) => (
              <div key={group.name}>
                {!isCollapsed && (
                  <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.name}
                  </h3>
                )}
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    const linkContent = (
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                          isActive
                            ? "bg-purple-50 text-purple-600 font-medium"
                            : "text-gray-700 hover:bg-gray-50",
                          isCollapsed && "justify-center px-2"
                        )}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </Link>
                    );

                    return (
                      <li key={item.path}>
                        {isCollapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {linkContent}
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>{item.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          linkContent
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/home"
                  className="flex items-center justify-center px-2 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                >
                  <Home className="w-4 h-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Quay lại trang chủ</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              to="/home"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50 justify-center"
            >
              <Home className="w-4 h-4" />
              <span>Quay lại trang chủ</span>
            </Link>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
