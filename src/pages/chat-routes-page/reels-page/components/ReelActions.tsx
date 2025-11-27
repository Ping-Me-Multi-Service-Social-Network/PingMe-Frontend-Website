"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, MoreVertical } from "lucide-react";
import { reelsApi } from "@/services/reels";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReelActionsProps {
  reelId: number;
  userId?: number;
  currentUserId?: number;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function ReelActions({
  reelId,
  userId,
  currentUserId,
  onDelete,
  onEdit,
}: ReelActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Only show actions if current user owns the reel
  const isOwnReel = userId === currentUserId;
  if (!isOwnReel) return null;

  const handleDelete = async () => {
    if (!confirm("Bạn chắc chắn muốn xóa reel này?")) return;

    setIsDeleting(true);
    try {
      await reelsApi.deleteReel(reelId);
      toast.success("Xóa reel thành công");
      onDelete?.();
    } catch (error) {
      console.log("[v0] Delete reel error:", error);
      toast.error("Không thể xóa reel");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
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
        <DropdownMenuItem onClick={onEdit} className="flex items-center gap-2">
          <Edit2 className="w-4 h-4" />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 text-red-600"
        >
          <Trash2 className="w-4 h-4" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
