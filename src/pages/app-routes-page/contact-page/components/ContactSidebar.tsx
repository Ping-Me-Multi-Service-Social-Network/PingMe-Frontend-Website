import type { LucideIcon } from "lucide-react";
import { Users, Send, Inbox } from "lucide-react";

interface Tab {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
}

const tabs: Tab[] = [
  {
    id: "friends",
    title: "Bạn bè",
    icon: Users,
    description: "Danh sách bạn bè đã kết nối",
  },
  {
    id: "received-invitations",
    title: "Lời mời nhận",
    icon: Inbox,
    description: "Lời mời kết bạn từ người khác",
  },
  {
    id: "sent-invitations",
    title: "Lời mời gửi",
    icon: Send,
    description: "Lời mời bạn đã gửi đi",
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
    <div className="flex-1 p-4">
      <div className="space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = getTabCount(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                isActive
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              <div className="flex-1">
                <div className="font-medium flex items-center justify-between">
                  {tab.title}
                  {count > 0 && (
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        isActive
                          ? "bg-purple-200 text-purple-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {tab.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
