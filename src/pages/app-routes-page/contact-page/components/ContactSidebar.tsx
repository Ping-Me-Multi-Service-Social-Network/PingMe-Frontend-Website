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

import { Sparkles, Compass } from "lucide-react"; // Add some icons

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
        <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white shadow-md space-y-3 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
          <div className="absolute top-2 right-2 w-12 h-12 bg-white/5 rounded-full filter blur-xl"></div>
          
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </span>
            <h4 className="font-semibold text-sm">{t("sidebarFooter.suggestTitle")}</h4>
          </div>
          
          <p className="text-xs text-purple-100/90 leading-relaxed">
            {t("sidebarFooter.suggestDesc")}
          </p>
          
          <div className="flex items-center justify-between mt-1">
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-6 h-6 rounded-full border-2 border-purple-600 flex items-center justify-center text-[10px] font-bold shadow-sm ${
                    i === 0 ? "bg-pink-300 text-pink-800" : i === 1 ? "bg-blue-300 text-blue-800" : "bg-emerald-300 text-emerald-800"
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <div className="w-6 h-6 rounded-full bg-white/20 border-2 border-purple-600 flex items-center justify-center text-[8px] font-semibold text-white">
                +9
              </div>
            </div>
            <button className="text-[10px] bg-white text-purple-700 font-bold px-2 py-1 rounded-md shadow-sm hover:bg-purple-50 active:scale-95 transition-all">
              {t("sidebarFooter.explore")}
            </button>
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
