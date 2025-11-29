import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Users,
  FileText,
  BarChart3,
  Shield,
  Music,
  Disc3,
  User,
  Tag,
} from "lucide-react";

const navItems = [
  {
    path: "/admin/accounts",
    label: "Quản lý tài khoản",
    icon: Users,
  },
  {
    path: "/admin/blogs",
    label: "Quản lý blog",
    icon: FileText,
  },
  {
    path: "/admin/statistics",
    label: "Thống kê",
    icon: BarChart3,
  },
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
];

export default function AdminNavigation() {
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2 text-purple-600">
          <Shield className="w-6 h-6" />
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-purple-50 text-purple-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link
          to="/home"
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}
