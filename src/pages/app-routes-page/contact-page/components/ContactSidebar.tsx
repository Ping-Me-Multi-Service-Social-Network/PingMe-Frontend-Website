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

import { Compass } from "lucide-react"; // Add some icons

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

      {/* Footer Banner Illustrations / Decorative ornaments */}
      <div className="mt-8 space-y-4">
        {/* Banner 1 */}
        <div className="relative rounded-2xl overflow-hidden shadow-md group cursor-pointer hover:shadow-lg transition-all duration-300">
          <img 
            src="/images/friends-illustration.jpg" 
            alt="Friends" 
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4">
            <h4 className="font-bold text-sm text-white">{t("sidebarFooter.suggestTitle")}</h4>
            <p className="text-[11px] text-gray-200 mt-1 leading-relaxed">{t("sidebarFooter.suggestDesc")}</p>
          </div>
        </div>

        {/* Small stats / status note */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 animate-pulse">
            <Compass className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{t("sidebarFooter.syncTitle")}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{t("sidebarFooter.syncDesc")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
