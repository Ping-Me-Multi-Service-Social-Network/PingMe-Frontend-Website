import type React from "react";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { genreService } from "@/services/music/musicService";
import type { GenreResponse } from "@/types/music";
import { toast } from "sonner";

interface GenreFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  genre: GenreResponse | null;
  onSuccess: () => void;
}

export function GenreFormDialog({
  open,
  onOpenChange,
  genre,
  onSuccess,
}: GenreFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      setName(genre?.name || "");
    }
  }, [open, genre]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên thể loại");
      return;
    }

    try {
      setLoading(true);
      if (genre) {
        await genreService.update(genre.id, { name });
        toast.success("Cập nhật thể loại thành công");
      } else {
        await genreService.create({ name });
        toast.success("Thêm thể loại thành công");
      }
      onSuccess();
    } catch (error) {
      toast.error(
        genre ? "Không thể cập nhật thể loại" : "Không thể thêm thể loại"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {genre ? "Chỉnh sửa thể loại" : "Thêm thể loại mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Tên thể loại *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên thể loại"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : genre ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
