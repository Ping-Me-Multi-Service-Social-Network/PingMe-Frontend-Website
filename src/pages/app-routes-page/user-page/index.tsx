import { User, Key, Monitor, HelpCircle } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import UserAvatarPanel from "./components/UserAvatarPanel.tsx";
import { useProfileTour } from "@/hooks/tours";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const navigationItems = [
  {
    id: "profile-nav-user-info",
    titleKey: "nav.userInfo",
    icon: User,
    href: "user-info",
    descriptionKey: "nav.userInfoDesc",
  },
  {
    id: "profile-nav-change-password",
    titleKey: "nav.changePassword",
    icon: Key,
    href: "change-password",
    descriptionKey: "nav.changePasswordDesc",
  },
  {
    id: "profile-nav-device-management",
    titleKey: "nav.deviceManagement",
    icon: Monitor,
    href: "device-management",
    descriptionKey: "nav.deviceManagementDesc",
  },
];

export default function UserPage() {
  const { t } = useTranslation("profile");
  const location = useLocation();
  const currentPath = location.pathname.split("/").pop();
  const { startTour, isTourCompleted } = useProfileTour();
  const tourStarted = useRef(false);

  // Auto-start tour khi vào trang Profile lần đầu
  useEffect(() => {
    if (tourStarted.current) return;
    tourStarted.current = true;

    // Delay để đảm bảo trang đã render xong
    const timer = setTimeout(() => {
      startTour();
    }, 800);

    return () => clearTimeout(timer);
  }, [startTour]);

  const handleRestartTour = () => {
    startTour(true);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="shrink-0">
        <UserAvatarPanel />
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto my-8 relative lg:w-2/3 md:w-3/4 w-4/5 pb-8">
        <div className="bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border bg-muted/20">
              <div className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <h2
                    id="profile-settings-title"
                    className="text-lg font-semibold text-foreground mb-4"
                  >
                    {t("common.accountSettings")}
                  </h2>
                  {isTourCompleted() && (
                    <button
                      onClick={handleRestartTour}
                      className="mb-4 p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                      title={t("common.restartTourTooltip")}
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <nav className="px-3 pb-4 lg:pb-0">
                <motion.ul 
                  className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto lg:overflow-x-visible"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                  }}
                >
                  {navigationItems.map((item) => {
                    const isActive = currentPath === item.href;
                    return (
                      <motion.li
                        key={item.titleKey}
                        id={item.id}
                        className="shrink-0 lg:shrink relative group"
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          visible: { opacity: 1, x: 0 }
                        }}
                      >
                        <NavLink
                          to={item.href}
                          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap lg:whitespace-normal ${isActive
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                        >
                          {isActive && (
                            <motion.div 
                              layoutId="profile-nav-indicator"
                              className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full hidden lg:block" 
                              initial={false}
                              transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            />
                          )}
                          <item.icon
                            className={`w-5 h-5 mr-3 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                              }`}
                          />
                          <div className="hidden sm:block lg:block">
                            <div className="font-medium">{t(item.titleKey)}</div>
                            <div className="text-xs text-muted-foreground/80 mt-0.5 hidden lg:block">
                              {t(item.descriptionKey)}
                            </div>
                          </div>
                          <div className="block sm:hidden lg:hidden">
                            <div className="font-medium text-xs">
                              {t(item.titleKey)}
                            </div>
                          </div>
                        </NavLink>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </nav>
            </div>

            {/* Outlet */}
            <div id="profile-content-area" className="flex-1 flex flex-col">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
