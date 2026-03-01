import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { getUserInitials } from "@/utils/authFieldHandler.ts";
import type { UserSummaryResponse } from "@/types/common/userSummary";

interface InvitationUserCardProps {
    invitation: UserSummaryResponse;
    actions: React.ReactNode;
}

export function InvitationUserCard({ invitation, actions }: Readonly<InvitationUserCardProps>) {
    return (
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                    <AvatarImage
                        src={invitation.avatarUrl || "/placeholder.svg"}
                        alt={invitation.name}
                    />
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                        {getUserInitials(invitation.name)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-medium text-gray-900">{invitation.name}</h3>
                    <p className="text-sm text-gray-500">{invitation.email}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">{actions}</div>
        </div>
    );
}
