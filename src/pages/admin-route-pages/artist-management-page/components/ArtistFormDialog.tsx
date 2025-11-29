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
import { Textarea } from "@/components/ui/textarea";
import { artistService } from "@/services/music/musicService";
import type { ArtistResponse } from "@/types/music";
import { toast } from "sonner";

interface ArtistFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artist: ArtistResponse | null;
  onSuccess: () => void;
}

export function ArtistFormDialog({
  open,
  onOpenChange,
  artist,
  onSuccess,
}: ArtistFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    imgFile: undefined as File | undefined,
  });

  useEffect(() => {
    if (open) {
      if (artist) {
        setFormData({
          name: artist.name,
          bio: artist.bio,
          imgFile: undefined,
        });
      } else {
        setFormData({
          name: "",
          bio: "",
          imgFile: undefined,
        });
      }
    }
  }, [open, artist]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Vui lòng nhập tên nghệ sĩ");
      return;
    }

    try {
      setLoading(true);
      if (artist) {
        await artistService.update(artist.id, formData);
        toast.success("Cập nhật nghệ sĩ thành công");
      } else {
        await artistService.create(formData);
        toast.success("Thêm nghệ sĩ thành công");
      }
      onSuccess();
    } catch (error) {
      toast.error(
        artist ? "Không thể cập nhật nghệ sĩ" : "Không thể thêm nghệ sĩ"
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
            {artist ? "Chỉnh sửa nghệ sĩ" : "Thêm nghệ sĩ mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Tên nghệ sĩ *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Nhập tên nghệ sĩ"
            />
          </div>

          <div>
            <Label htmlFor="bio">Tiểu sử</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Nhập tiểu sử nghệ sĩ"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="imgFile">Ảnh đại diện</Label>
            <Input
              id="imgFile"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, imgFile: e.target.files?.[0] })
              }
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
              {loading ? "Đang lưu..." : artist ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
