import { useState } from "react";
import { useTranslation } from "react-i18next";
import { votePollApi } from "@/services/chat";
import type { MessageResponse } from "@/types/chat/message";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";

interface MessagePollProps {
  message: MessageResponse;
  currentUserId: number;
}

export const MessagePoll = ({ message, currentUserId }: MessagePollProps) => {
  const { t } = useTranslation("chat");
  const poll = message.poll;
  const [isVoting, setIsVoting] = useState(false);
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>([]);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  if (!poll) return null;

  const currentSelectedIds = poll.options
    .filter(o => o.voterIds.includes(currentUserId))
    .map(o => o.id);

  const selectedIds = hasLocalChanges ? localSelectedIds : currentSelectedIds;

  const isExpired = poll.expired || (poll.expiresAt && new Date(poll.expiresAt).getTime() < Date.now());
  const canVote = message.isActive && !isExpired;

  const handleOptionClick = async (optionId: string) => {
    if (!canVote || isVoting) return;

    let newSelectedIds: string[];
    
    if (poll.allowMultiple) {
      if (selectedIds.includes(optionId)) {
        newSelectedIds = selectedIds.filter(id => id !== optionId);
      } else {
        newSelectedIds = [...selectedIds, optionId];
      }
      // For multi-select, we don't send API immediately if we want a "Confirm" button.
      // But the spec says: "send current selected optionIds after each change, or use a confirm button if easier"
      // Let's just send immediately on click for better UX.
    } else {
      if (selectedIds.includes(optionId)) {
        // Clear vote
        newSelectedIds = [];
      } else {
        newSelectedIds = [optionId];
      }
    }

    setLocalSelectedIds(newSelectedIds);
    setHasLocalChanges(true);
    setIsVoting(true);

    try {
      await votePollApi(message.id, { optionIds: newSelectedIds });
      // We rely on websocket MESSAGE_UPDATED to eventually reconcile the UI.
    } catch (err) {
      toast.error(getErrorMessage(err, t("bubbles.messages.voteError", "Failed to vote")));
      setHasLocalChanges(false); // Revert local changes on error
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="w-full max-w-[280px] sm:max-w-[320px] flex flex-col gap-3">
      {/* Poll Header */}
      <div className="flex flex-col gap-1">
        <h4 className="font-semibold text-base wrap-break-word leading-tight">
          {poll.question}
        </h4>
        <div className="flex items-center gap-2 text-[11px] opacity-80">
          <span>
            {poll.allowMultiple 
              ? t("bubbles.messages.multiChoice", "Multiple choice") 
              : t("bubbles.messages.singleChoice", "Single choice")}
          </span>
          {isExpired && (
            <span className="bg-gray-500/20 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide">
              {t("bubbles.messages.pollExpired", "Expired")}
            </span>
          )}
        </div>
      </div>

      {/* Poll Options */}
      <div className="flex flex-col gap-2">
        {poll.options.map((option) => {
          const isSelected = selectedIds.includes(option.id);
          const percentage = poll.totalVotes > 0 
            ? Math.round((option.voteCount / poll.totalVotes) * 100) 
            : 0;

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              disabled={!canVote || isVoting}
              className={`relative w-full text-left overflow-hidden rounded-lg border p-2 transition-all duration-200
                ${isSelected ? "border-current border-[1.5px]" : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"}
                ${!canVote ? "cursor-default opacity-80" : "cursor-pointer"}
              `}
            >
              {/* Progress Bar Background */}
              <div 
                className="absolute inset-y-0 left-0 bg-current opacity-10 transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />

              {/* Content */}
              <div className="relative flex items-center justify-between gap-3 z-10">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-4 h-4 shrink-0 border rounded-full flex items-center justify-center transition-colors
                    ${poll.allowMultiple ? "rounded" : "rounded-full"}
                    ${isSelected ? "bg-current border-current text-white dark:text-gray-900" : "border-black/20 dark:border-white/20"}
                  `}>
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <span className="font-medium text-sm wrap-break-word">{option.text}</span>
                </div>
                
                {poll.totalVotes > 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Only show count if > 0 or if we voted for it? Usually show for all if total > 0 */}
                    {option.voteCount > 0 && (
                      <span className="text-xs font-semibold opacity-90">
                        {option.voteCount}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-xs opacity-80">
        {poll.totalVotes} {poll.totalVotes === 1 ? t("bubbles.messages.vote", "vote") : t("bubbles.messages.votes", "votes")}
      </div>
    </div>
  );
};
