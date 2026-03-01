import type React from "react";

import {
  MessageCircle,
  Users,
  Music4Icon,
  Film,
  Menu,
  X,
  Stars,
  HelpCircle,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import UserMenu from "@/pages/commons/UserMenu.tsx";
import { useGlobalTour } from "@/hooks/tours";

const socialNavigationItems = [
  {
    id: "nav-chat",
    titleKey: "nav.chat.title",
    icon: MessageCircle,
    href: "/app/chat",
    descriptionKey: "nav.chat.desc",
    external: false,
  },
  {
    id: "nav-contacts",
    titleKey: "nav.contacts.title",
    icon: Users,
    href: "/app/contacts",
    descriptionKey: "nav.contacts.desc",
    external: false,
  },
];

const mediaNavigationItems = [
  {
    id: "nav-music",
    titleKey: "nav.music.title",
    icon: Music4Icon,
    href: "/app/music",
    descriptionKey: "nav.music.desc",
    external: false,
  },
  {
    id: "nav-reels",
    titleKey: "nav.reels.title",
    icon: Film,
    href: "/app/reels",
    descriptionKey: "nav.reels.desc",
    external: false,
  },
  {
    id: "nav-ping-ai",
    titleKey: "nav.pingAi.title",
    icon: Stars,
    href: "/app/ping-ai",
    descriptionKey: "nav.pingAi.desc",
    external: false,
  },
];

export default function AppNavigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { startTour, isTourCompleted } = useGlobalTour();
  const { t } = useLanguage("common");

  const isItemActive = (href: string) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const renderNavItem = (item: (typeof socialNavigationItems)[0]) => {
    const isActive = isItemActive(item.href);

    return (
      <Tooltip key={item.id}>
        <TooltipTrigger asChild>
          <NavLink
            id={item.id}
            to={item.href}
            onClick={() => setIsOpen(false)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive
              ? "bg-white text-purple-600 shadow-lg scale-110"
              : "text-purple-200 hover:bg-purple-500 hover:text-white hover:scale-105"
              }`}
          >
            <item.icon className="w-6 h-6" />
          </NavLink>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-purple-600 text-white border-none shadow-xl"
        >
          <div>
            <div className="font-semibold">{t(item.titleKey)}</div>
            <div className="text-xs text-purple-100 mt-0.5">
              {t(item.descriptionKey)}
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
          className="lg:hidden fixed top-4 left-4 z-40 w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label={t("nav.closeMenu")}
          className="lg:hidden fixed inset-0 bg-black/50 z-60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          onKeyDown={handleOverlayKeyDown}
        />
      )}

      <div
        className={`
          fixed lg:relative
          h-screen bg-purple-700 
          flex flex-col items-center py-4 shadow-xl
          transition-transform duration-300 ease-in-out
          z-70
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

        <div className="flex flex-col space-y-2 py-3">
          {socialNavigationItems.map((item) => renderNavItem(item))}
        </div>

        <div className="w-10 h-px bg-purple-400/30 my-2" />

        <div className="flex flex-col space-y-2 py-3">
          {mediaNavigationItems.map((item) => renderNavItem(item))}
        </div>

        <div className="mt-auto flex flex-col space-y-3 pt-3">
          <div className="w-10 h-px bg-purple-400/30 mb-2" />

          {isTourCompleted() && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => startTour(true)}
                  className="w-10 h-10 mx-auto rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all duration-200"
                  aria-label={t("nav.guide.aria")}
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-purple-600 text-white border-none shadow-xl"
              >
                <div>
                  <div className="font-semibold">{t("nav.guide.title")}</div>
                  <div className="text-xs text-purple-100 mt-0.5">
                    {t("nav.guide.desc")}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <div id="nav-user-menu" className="flex justify-center">
                <UserMenu openInNewTab={false} />
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-purple-600 text-white border-none shadow-xl"
            >
              <div>
                <div className="font-semibold">{t("nav.account.title")}</div>
                <div className="text-xs text-purple-100 mt-0.5">
                  {t("nav.account.desc")}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
