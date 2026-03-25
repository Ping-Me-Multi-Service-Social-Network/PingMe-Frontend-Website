import type { LucideIcon } from "lucide-react";
import { Users, Send, Inbox } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

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
    <div className="flex-1 p-3 flex flex-col justify-between h-[calc(100%-60px)]">
      {/* Tabs */}
      <nav className="space-y-1" role="tablist" aria-label="Contacts navigation">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = getTabCount(tab.id);

          return (
            <motion.button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.06,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className={`
                relative w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left
                transition-all duration-200 ease-out cursor-pointer
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
                ${isActive
                  ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }
              `}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="contact-active-indicator"
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <div
                className={`
                  flex items-center justify-center w-9 h-9 rounded-lg shrink-0
                  transition-colors duration-200
                  ${isActive
                    ? "bg-primary/15 text-primary dark:bg-primary/20"
                    : "bg-muted text-muted-foreground"
                  }
                `}
              >
                <Icon className="w-[18px] h-[18px]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-medium truncate ${isActive ? "text-primary" : ""}`}>
                    {t(tab.titleKey)}
                  </span>
                  {count > 0 && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className={`
                        inline-flex items-center justify-center min-w-[20px] h-5
                        px-1.5 text-[11px] font-semibold rounded-full tabular-nums shrink-0
                        ${isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                        }
                      `}
                    >
                      {count}
                    </motion.span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {t(tab.descriptionKey)}
                </p>
              </div>
            </motion.button>
          );
        })}
      </nav>

      {/* Footer Banner Illustration */}
      <div className="relative overflow-hidden rounded-xl group mt-auto -mx-1 cursor-pointer">
        <img
          src="/images/friends-illustration.jpg"
          alt="Friends"
          className="w-full h-44 object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  );
}
