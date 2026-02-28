import { User, Key, Monitor, HelpCircle } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

import UserAvatarPanel from "./components/UserAvatarPanel.tsx";
import { useProfileTour } from "@/hooks/tours";

const navigationItems = [
  {
    id: "profile-nav-user-info",
    title: "Thông tin cá nhân",
    icon: User,
    href: "user-info",
    description: "Quản lý thông tin cá nhân của bạn",
  },
  {
    id: "profile-nav-change-password",
    title: "Thay đổi mật khẩu",
    icon: Key,
    href: "change-password",
    description: "Bảo mật tài khoản với mật khẩu mới",
  },
  {
    id: "profile-nav-device-management",
    title: "Quản lý thiết bị",
    icon: Monitor,
    href: "device-management",
    description: "Xem và quản lý các thiết bị đăng nhập",
  },
];

export default function UserPage() {
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
      <div className="flex-shrink-0">
        <UserAvatarPanel />
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto my-8 relative lg:w-2/3 md:w-3/4 w-4/5 pb-8">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-gray-200">
              <div className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <h2
                    id="profile-settings-title"
                    className="text-lg font-semibold text-gray-900 mb-4"
                  >
                    Cài đặt tài khoản
                  </h2>
                  {isTourCompleted() && (
                    <button
                      onClick={handleRestartTour}
                      className="mb-4 p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                      title="Xem lại hướng dẫn"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <nav className="px-3 pb-4 lg:pb-0">
                <ul className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto lg:overflow-x-visible">
                  {navigationItems.map((item) => {
                    const isActive = currentPath === item.href;
                    return (
                      <li
                        key={item.title}
                        id={item.id}
                        className="flex-shrink-0 lg:flex-shrink"
                      >
                        <NavLink
                          to={item.href}
                          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap lg:whitespace-normal ${isActive
                            ? "bg-purple-100 text-purple-700 shadow-sm border-l-4 lg:border-l-4 border-purple-500"
                            : "text-gray-700 hover:bg-gray-100 hover:text-purple-600"
                            }`}
                        >
                          <item.icon
                            className={`w-5 h-5 mr-3 ${isActive ? "text-purple-600" : "text-gray-400"
                              }`}
                          />
                          <div className="hidden sm:block lg:block">
                            <div className="font-medium">{item.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5 hidden lg:block">
                              {item.description}
                            </div>
                          </div>
                          <div className="block sm:hidden lg:hidden">
                            <div className="font-medium text-xs">
                              {item.title}
                            </div>
                          </div>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
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
