import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import {
  Edit2,
  Trash2,
  MoreVertical,
  Bookmark,
  BookMarked as BookmarkOpen,
} from "lucide-react";
import { reelsApi } from "@/services/reels";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";

interface ReelActionsProps {
  reelId: number;
  userId?: number;
  currentUserId?: number;
  isSavedByMe?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  onSaveChange?: (isSaved: boolean) => void;
}

export function ReelActions({
  reelId,
  userId,
  currentUserId,
  isSavedByMe = false,
  onDelete,
  onEdit,
  onSaveChange,
}: ReelActionsProps) {
  const { t } = useTranslation("reels");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaved, setIsSaved] = useState(isSavedByMe);
  const [isTogglingSave, setIsTogglingSave] = useState(false);

  // Only show edit/delete if current user owns the reel
  const isOwnReel = userId === currentUserId;

  const handleDelete = async () => {
    if (!confirm(t("manage.deleteConfirm"))) return;

    setIsDeleting(true);
    try {
      await reelsApi.deleteReel(reelId);
      toast.success(t("edit.success_delete"));
      onDelete?.();
    } catch (error) {
      console.log("[PingMe] Delete reel error:", error);
      toast.error(t("edit.error_delete"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleSave = async () => {
    setIsTogglingSave(true);
    try {
      const result = await reelsApi.toggleSave(reelId);
      setIsSaved(result.isSavedByMe);
      onSaveChange?.(result.isSavedByMe);
      toast.success(result.isSavedByMe ? t("edit.success_save") : t("edit.success_unsave"));
    } catch (error) {
      console.log("[PingMe] Toggle save error:", error);
      toast.error(t("edit.error_save"));
    } finally {
      setIsTogglingSave(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Save button */}
      <Button
        variant="ghost"
        size="sm"
        className="p-1 h-auto hover:bg-gray-100"
        onClick={handleToggleSave}
        disabled={isTogglingSave}
      >
        {isSaved ? (
          <BookmarkOpen className="w-5 h-5 text-yellow-400" />
        ) : (
          <Bookmark className="w-5 h-5 text-gray-400" />
        )}
      </Button>

      {isOwnReel && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto hover:bg-gray-100"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={onEdit}
              className="flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              {t("comments.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              {t("comments.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
