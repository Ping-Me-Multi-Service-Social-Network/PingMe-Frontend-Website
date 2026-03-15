import type { LucideIcon } from "lucide-react";
import { Users, Send, Inbox } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Tab {
  id: string;
  titleKey: string;
  icon: LucideIcon;
  descriptionKey: string;
}

const tabs: Tab[] = [
  {
    id: "friends",
    titleKey: "sidebar.friends.title",
    icon: Users,
    descriptionKey: "sidebar.friends.desc",
  },
  {
    id: "received-invitations",
    titleKey: "sidebar.received.title",
    icon: Inbox,
    descriptionKey: "sidebar.received.desc",
  },
  {
    id: "sent-invitations",
    titleKey: "sidebar.sent.title",
    icon: Send,
    descriptionKey: "sidebar.sent.desc",
  },
];

interface ContactSidebarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  stats: {
    totalFriends: number;
    totalReceivedInvites: number;
    totalSentInvites: number;
  };
}



export function ContactSidebar({
  activeTab,
  setActiveTab,
  stats,
}: ContactSidebarProps) {
  const { t } = useTranslation("contacts");

  const getTabCount = (tabId: string) => {
    switch (tabId) {
      case "friends":
        return stats.totalFriends;
      case "received-invitations":
        return stats.totalReceivedInvites;
      case "sent-invitations":
        return stats.totalSentInvites;
      default:
        return 0;
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col justify-between h-[calc(100%-60px)]">
      {/* Tabs */}
      <div className="space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = getTabCount(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${isActive
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <Icon className="w-5 h-5" />
              <div className="flex-1">
                <div className="font-medium flex items-center justify-between">
                  {t(tab.titleKey)}
                  {count > 0 && (
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${isActive
                          ? "bg-purple-200 text-purple-800"
                          : "bg-gray-200 text-gray-600"
                        }`}
                    >
                      {count}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {t(tab.descriptionKey)}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Banner Illustrations */}
      <div className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 mt-auto -mx-4 -mb-4 cursor-pointer">
        {/* Top edge glowing gradient line effect */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-purple-500 via-pink-400 to-blue-500 opacity-80 group-hover:opacity-100 animate-pulse transition-opacity"></div>
        <img 
          src="/images/friends-illustration.jpg" 
          alt="Friends" 
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
        />
      </div>
    </div>
  );
}
