import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { getUserInitials } from "@/utils/authFieldHandler.ts";
import type { UserSummaryResponse } from "@/types/common/userSummary";
import { motion } from "framer-motion";

interface InvitationUserCardProps {
    invitation: UserSummaryResponse;
    actions: React.ReactNode;
    index?: number;
}

export function InvitationUserCard({ invitation, actions, index = 0 }: Readonly<InvitationUserCardProps>) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.25,
                delay: Math.min(index * 0.04, 0.4),
                ease: [0.25, 0.1, 0.25, 1],
            }}
            className="
                group flex items-center justify-between p-4
                bg-card border border-border rounded-xl
                hover:border-primary/20 hover:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)]
                dark:hover:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.3)]
                transition-all duration-200 ease-out
            "
        >
            <div className="flex items-center gap-3 min-w-0">
                <Avatar className="w-11 h-11 shrink-0 ring-2 ring-border group-hover:ring-primary/20 transition-all duration-200">
                    <AvatarImage
                        src={invitation.avatarUrl || "/placeholder.svg"}
                        alt={invitation.name}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {getUserInitials(invitation.name)}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">
                        {invitation.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {invitation.email}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">{actions}</div>
        </motion.div>
    );
}
