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
import { albumService, artistService } from "@/services/music/musicService";
import type { AlbumResponse, ArtistResponse } from "@/types/music";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AlbumFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  album: AlbumResponse | null;
  onSuccess: () => void;
}

export function AlbumFormDialog({
  open,
  onOpenChange,
  album,
  onSuccess,
}: AlbumFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState<ArtistResponse[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    albumOwnerId: 0,
    imgFile: undefined as File | undefined,
  });

  useEffect(() => {
    if (open) {
      fetchArtists();
      if (album) {
        setFormData({
          title: album.title,
          albumOwnerId: album.albumOwnerId || 0,
          imgFile: undefined,
        });
      } else {
        setFormData({
          title: "",
          albumOwnerId: 0,
          imgFile: undefined,
        });
      }
    }
  }, [open, album]);

  const fetchArtists = async () => {
    try {
      const data = await artistService.getAll();
      setArtists(data);
    } catch (error) {
      toast.error("Không thể tải danh sách nghệ sĩ");
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.albumOwnerId) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    console.log("[PingMe] Submitting album form with data:", formData);
    console.log("[PingMe] Is update?", !!album);
    console.log("[PingMe] Album ID:", album?.id);

    try {
      setLoading(true);
      if (album) {
        console.log("[PingMe] Calling albumService.update");
        await albumService.update(album.id, formData);
        toast.success("Cập nhật album thành công");
      } else {
        console.log("[PingMe] Calling albumService.create");
        await albumService.create(formData);
        toast.success("Thêm album thành công");
      }
      onSuccess();
    } catch (error) {
      console.error("[PingMe] Album form submission error:", error);
      toast.error(album ? "Không thể cập nhật album" : "Không thể thêm album");
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
            {album ? "Chỉnh sửa album" : "Thêm album mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Tên album *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Nhập tên album"
            />
          </div>

          <div>
            <Label htmlFor="owner">Chủ sở hữu *</Label>
            <Select
              value={formData.albumOwnerId.toString()}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  albumOwnerId: Number.parseInt(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn nghệ sĩ" />
              </SelectTrigger>
              <SelectContent>
                {artists.map((artist) => (
                  <SelectItem key={artist.id} value={artist.id.toString()}>
                    {artist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="imgFile">Ảnh bìa</Label>
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
              {loading ? "Đang lưu..." : album ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
