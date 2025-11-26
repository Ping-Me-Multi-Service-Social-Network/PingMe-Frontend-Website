import {
  MessageCircle,
  Users,
  Home,
  BookOpen,
  Music4Icon,
  Wallet,
  Film,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import UserMenu from "@/pages/commons/UserMenu";

const socialNavigationItems = [
  {
    title: "Tin nhắn",
    icon: MessageCircle,
    href: "/chat/messages",
    description: "Trò chuyện với bạn bè",
    external: false,
  },
  {
    title: "Danh bạ",
    icon: Users,
    href: "/chat/contacts",
    description: "Quản lý danh bạ",
    external: false,
  },
];

const mediaNavigationItems = [
  {
    title: "Ping Music",
    icon: Music4Icon,
    href: "/music",
    description: "Đắm chìm trong âm nhạc",
    external: false,
  },
  {
    title: "Reels",
    icon: Film,
    href: "/reels",
    description: "Video giải trí",
    external: false,
  },
];

const contentNavigationItems = [
  {
    title: "Blog",
    icon: BookOpen,
    href: "/blogs",
    description: "Khám phá bài viết",
    external: false,
  },
  {
    title: "Chi tiêu",
    icon: Wallet,
    href: "/expenses",
    description: "Quản lý chi tiêu",
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

export default function ChatNavigation() {
  const location = useLocation();

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
      <div className="w-16 bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 flex flex-col items-center py-4 shadow-xl">
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

        <div className="w-10 h-px bg-purple-400/30 my-2" />

        <div className="flex-1 flex flex-col space-y-2 py-3">
          {contentNavigationItems.map((item) => renderNavItem(item))}
        </div>

        <div className="w-10 h-px bg-purple-400/30 my-2" />

        {/* Bottom Section - Logo & User */}
        <div className="flex flex-col space-y-3 pt-3">
          {/* Logo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink
                to="/"
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

          {/* UserMenu */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center">
                <UserMenu openInNewTab={true} />
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
