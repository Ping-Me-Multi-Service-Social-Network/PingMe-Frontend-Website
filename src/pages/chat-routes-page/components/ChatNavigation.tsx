import {
  MessageCircle,
  Users,
  Home,
  BookOpen,
  NotebookPen,
  Music4Icon,
  Wallet,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import UserMenu from "@/pages/commons/UserMenu";

const topNavigationItems = [
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

const middleNavigationItems = [
  {
    title: "Trang chủ",
    icon: Home,
    href: "/",
    description: "Về trang chủ",
    external: true,
  },
  {
    title: "Blog",
    icon: BookOpen,
    href: "/blogs",
    description: "Khám phá bài viết",
    external: true,
  },
  {
    title: "Nhật ký",
    icon: NotebookPen,
    href: "/diaries",
    description: "Chia sẻ khoảnh khắc",
    external: true,
  },
];

const middleInternalNavigationItems = [
  {
    title: "Ping Music",
    icon: Music4Icon,
    href: "/music",
    description: "Đắm chìm trong âm nhạc",
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

export default function ChatNavigation() {
  const location = useLocation();
  const currentPath = location.pathname.split("/").pop();

  const handleNavigation = (href: string, external: boolean) => {
    if (external) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <TooltipProvider>
      <div className="w-16 bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 flex flex-col items-center py-4 shadow-xl">
        {/* Top Section - Chat Navigation */}
        <div className="flex flex-col space-y-2 pb-4">
          {topNavigationItems.map((item) => {
            const isActive = currentPath === item.href.split("/").pop();
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
          })}
        </div>

        {/* Divider */}
        <div className="w-10 h-px bg-purple-400/30 my-2" />

        {/* Middle Section - Main Navigation */}
        <div className="flex-1 flex flex-col space-y-2 py-4">
          {middleNavigationItems.map((item) => (
            <Tooltip key={item.title}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleNavigation(item.href, item.external)}
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 text-purple-200 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:scale-105 hover:shadow-lg"
                >
                  <item.icon className="w-6 h-6" />
                </button>
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
          ))}
          {middleInternalNavigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Tooltip key={item.title}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.href}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-white text-purple-600 shadow-lg scale-110"
                        : "text-purple-200 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:scale-105 hover:shadow-lg"
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
          })}
        </div>

        {/* Divider */}
        <div className="w-10 h-px bg-purple-400/30 my-2" />

        {/* Bottom Section - Logo & User */}
        <div className="flex flex-col space-y-3 pt-4">
          {/* Logo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() =>
                  window.open("/", "_blank", "noopener,noreferrer")
                }
                className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <img
                  src="/logo.png"
                  alt="PingMe Logo"
                  className="w-8 h-8 drop-shadow-lg"
                />
              </button>
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
