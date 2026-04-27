import type React from "react";
import { Inbox, Search } from "lucide-react";
import { EmptyState } from "@/components/custom/EmptyState.tsx";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import { InvitationUserCard } from "../InvitationUserCard";
import { AnimatePresence } from "framer-motion";
import type { UserSummaryResponse } from "@/types/common/userSummary";
import { InvitationActionButtons } from "./InvitationActionButtons";

interface ReceivedInvitationsListProps {
  isLoading: boolean;
  receivedInvitations: UserSummaryResponse[];
  processingInvitations: Set<number>;
  hasMoreInvitations: boolean;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  onAcceptInvitation: (friendshipId: number) => void;
  onRejectInvitation: (friendshipId: number) => void;
  searchQuery?: string;
  labels: {
    loading: string;
    emptyTitle: string;
    emptyDesc: string;
    btnAccept: string;
    btnReject: string;
    loadingMore: string;
    displayedAllInvitations: string;
  };
}

export function ReceivedInvitationsList({
  isLoading,
  receivedInvitations,
  processingInvitations,
  hasMoreInvitations,
  scrollContainerRef,
  onAcceptInvitation,
  onRejectInvitation,
  searchQuery = "",
  labels,
}: ReceivedInvitationsListProps) {
  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
      {isLoading && receivedInvitations.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-primary">
            <LoadingSpinner className="w-6 h-6" />
            <span className="text-sm font-medium">{labels.loading}</span>
          </div>
        </div>
      ) : receivedInvitations.length === 0 ? (
        searchQuery ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground animate-in fade-in zoom-in duration-300">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">Không tìm thấy kết quả</p>
            <p className="text-xs">Hãy thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          <div className="h-64">
            <EmptyState
              icon={Inbox}
              title={labels.emptyTitle}
              description={labels.emptyDesc}
            />
          </div>
        )
      ) : (
        <div className="p-3 space-y-2">
          <AnimatePresence mode="popLayout">
            {receivedInvitations.map((invitation, index) => {
              const friendshipId = invitation.friendshipSummary?.id;
              const isProcessing = friendshipId
                ? processingInvitations.has(friendshipId)
                : false;

              return (
                <InvitationUserCard
                  key={invitation.id}
                  invitation={invitation}
                  index={index}
                  actions={
                    <>
                      {friendshipId && (
                        <InvitationActionButtons
                          friendshipId={friendshipId}
                          isProcessing={isProcessing}
                          onAccept={onAcceptInvitation}
                          onReject={onRejectInvitation}
                          acceptLabel={labels.btnAccept}
                          rejectLabel={labels.btnReject}
                        />
                      )}
                    </>
                  }
                />
              );
            })}
          </AnimatePresence>

          {/* Loading indicator khi load thêm */}
          {isLoading && hasMoreInvitations && (
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <LoadingSpinner className="w-4 h-4" />
                <span className="text-xs">{labels.loadingMore}</span>
              </div>
            </div>
          )}

          {/* Thông báo hết dữ liệu */}
          {!hasMoreInvitations && receivedInvitations.length > 0 && (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground">
                {labels.displayedAllInvitations}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
