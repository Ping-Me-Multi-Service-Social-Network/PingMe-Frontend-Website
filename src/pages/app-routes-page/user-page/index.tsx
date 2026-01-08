import { User, Key, Monitor } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import UserAvatarPanel from "./components/UserAvatarPanel.tsx";

const navigationItems = [
  {
    title: "Thông tin cá nhân",
    icon: User,
    href: "user-info",
    description: "Quản lý thông tin cá nhân của bạn",
  },
  {
    title: "Thay đổi mật khẩu",
    icon: Key,
    href: "change-password",
    description: "Bảo mật tài khoản với mật khẩu mới",
  },
  {
    title: "Quản lý thiết bị",
    icon: Monitor,
    href: "device-management",
    description: "Xem và quản lý các thiết bị đăng nhập",
  },
];

export default function UserPage() {
  const location = useLocation();
  const currentPath = location.pathname.split("/").pop();

  return (
    <div className="min-h-screen ">
      <UserAvatarPanel />

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto my-8 relative lg:w-2/3 md:w-3/4 w-4/5">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[400px]">
            <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-gray-200">
              <div className="p-4 lg:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Cài đặt tài khoản
                </h2>
              </div>
              <nav className="px-3 pb-4 lg:pb-0">
                <ul className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto lg:overflow-x-visible">
                  {navigationItems.map((item) => {
                    const isActive = currentPath === item.href;
                    return (
                      <li
                        key={item.title}
                        className="flex-shrink-0 lg:flex-shrink"
                      >
                        <NavLink
                          to={item.href}
                          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap lg:whitespace-normal ${
                            isActive
                              ? "bg-purple-100 text-purple-700 shadow-sm border-l-4 lg:border-l-4 border-purple-500"
                              : "text-gray-700 hover:bg-gray-100 hover:text-purple-600"
                          }`}
                        >
                          <item.icon
                            className={`w-5 h-5 mr-3 ${
                              isActive ? "text-purple-600" : "text-gray-400"
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
            <div className="flex-1 flex flex-col min-h-full">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
