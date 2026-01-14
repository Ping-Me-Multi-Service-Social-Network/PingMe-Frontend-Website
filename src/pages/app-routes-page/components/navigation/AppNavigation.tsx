import {
  MessageCircle,
  Users,
  Home,
  BookOpen,
  Music4Icon,
  Film,
  Menu,
  X,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import UserMenu from "@/pages/commons/UserMenu.tsx";

const socialNavigationItems = [
  {
    title: "Tin Nhắn",
    icon: MessageCircle,
    href: "/app/chat",
    description: "Trò chuyện với bạn bè",
    external: false,
  },
  {
    title: "Danh Bạ",
    icon: Users,
    href: "/app/contacts",
    description: "Quản lý danh bạ",
    external: false,
  },
];

const mediaNavigationItems = [
  {
    title: "Nghe Nhạc",
    icon: Music4Icon,
    href: "/app/music",
    description: "Đắm chìm trong âm nhạc",
    external: false,
  },
  {
    title: "Thước Phim",
    icon: Film,
    href: "/app/reels",
    description: "Video giải trí",
    external: false,
  },
];

const contentNavigationItems = [
  {
    title: "Blog",
    icon: BookOpen,
    href: "/app/blogs",
    description: "Khám phá bài viết",
    external: false,
  },
];

const homeNavigationItem = {
  title: "Trang chủ",
  icon: Home,
  href: "/",
  description: "Về trang chủ",
  external: false,
};

export default function AppNavigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isItemActive = (href: string) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  const renderNavItem = (item: (typeof socialNavigationItems)[0]) => {
    const isActive = isItemActive(item.href);

    return (
      <Tooltip key={item.title}>
        <TooltipTrigger asChild>
          <NavLink
            to={item.href}
            onClick={() => setIsOpen(false)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isActive
                ? "bg-white text-purple-600 shadow-lg scale-110"
                : "text-purple-200 hover:bg-purple-500 hover:text-white hover:scale-105"
            }`}
          >
            <item.icon className="w-6 h-6" />
          </NavLink>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none shadow-xl"
        >
          <div>
            <div className="font-semibold">{item.title}</div>
            <div className="text-xs text-purple-100 mt-0.5">
              {item.description}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`
          fixed lg:relative
          h-screen bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 
          flex flex-col items-center py-4 shadow-xl
          transition-transform duration-300 ease-in-out
          z-[70]
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-16
        `}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="flex flex-col space-y-2 pb-3">
          {renderNavItem(homeNavigationItem)}
        </div>

        <div className="w-10 h-px bg-purple-400/30 my-2" />

        <div className="flex flex-col space-y-2 py-3">
          {socialNavigationItems.map((item) => renderNavItem(item))}
        </div>

        <div className="w-10 h-px bg-purple-400/30 my-2" />

        <div className="flex flex-col space-y-2 py-3">
          {mediaNavigationItems.map((item) => renderNavItem(item))}
        </div>

        <div className="flex-1 flex flex-col space-y-2 py-3">
          {contentNavigationItems.map((item) => renderNavItem(item))}
        </div>

        <div className="w-10 h-px bg-purple-400/30 my-2" />

        <div className="flex flex-col space-y-3 pt-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink
                to="/public"
                onClick={() => setIsOpen(false)}
                className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <img
                  src="/logo.png"
                  alt="PingMe Logo"
                  className="w-8 h-8 drop-shadow-lg"
                />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none shadow-xl"
            >
              <div>
                <div className="font-semibold">PingMe</div>
                <div className="text-xs text-purple-100 mt-0.5">
                  Về trang chủ
                </div>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center">
                <UserMenu openInNewTab={false} />
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none shadow-xl"
            >
              <div>
                <div className="font-semibold">Tài khoản</div>
                <div className="text-xs text-purple-100 mt-0.5">
                  Quản lý tài khoản
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
