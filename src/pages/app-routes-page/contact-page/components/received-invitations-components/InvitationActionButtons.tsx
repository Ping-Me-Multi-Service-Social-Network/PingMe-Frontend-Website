
import { Button } from "@/components/ui/button.tsx";
import { Check, X } from "lucide-react";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";

interface InvitationActionButtonsProps {
  friendshipId: number;
  isProcessing: boolean;
  onAccept: (friendshipId: number) => void;
  onReject: (friendshipId: number) => void;
  acceptLabel: string;
  rejectLabel: string;
}

export function InvitationActionButtons({
  friendshipId,
  isProcessing,
  onAccept,
  onReject,
  acceptLabel,
  rejectLabel,
}: InvitationActionButtonsProps) {
  return (
    <>
      <Button
        size="sm"
        onClick={() => onAccept(friendshipId)}
        disabled={isProcessing}
        className="
          bg-emerald-600 hover:bg-emerald-700 text-white
          h-8 px-3 text-xs font-medium
          transition-colors duration-150
        "
      >
        {isProcessing ? (
          <LoadingSpinner className="w-3.5 h-3.5 mr-1.5" />
        ) : (
          <Check className="w-3.5 h-3.5 mr-1.5" />
        )}
        {acceptLabel}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onReject(friendshipId)}
        disabled={isProcessing}
        className="
          text-destructive hover:text-destructive hover:bg-destructive/10
          h-8 px-3 text-xs font-medium
          transition-colors duration-150
        "
      >
        <X className="w-3.5 h-3.5 mr-1.5" />
        {rejectLabel}
      </Button>
    </>
  );
}
