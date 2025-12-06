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
import {
  songService,
  artistService,
  genreService,
  albumService,
  commonService,
} from "@/services/music/musicService";
import type {
  SongResponseWithAllAlbum,
  ArtistResponse,
  GenreResponse,
  AlbumResponse,
  SongArtistRequest,
  ArtistRole,
  SongRequest,
} from "@/types/music";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SongFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song: SongResponseWithAllAlbum | null;
  onSuccess: () => void;
}

export function SongFormDialog({
  open,
  onOpenChange,
  song,
  onSuccess,
}: SongFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState<ArtistResponse[]>([]);
  const [genres, setGenres] = useState<GenreResponse[]>([]);
  const [albums, setAlbums] = useState<AlbumResponse[]>([]);
  const [artistRoles, setArtistRoles] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    duration: 0,
    mainArtistId: 0,
    otherArtists: [] as SongArtistRequest[],
    genreIds: [] as number[],
    albumIds: [] as number[],
    musicFile: undefined as File | undefined,
    imgFile: undefined as File | undefined,
  });

  useEffect(() => {
    if (open) {
      fetchData();
      if (song) {
        console.log("[v0] Song data received:", song);
        console.log("[v0] Song otherArtists:", song.otherArtists);

        const mappedOtherArtists =
          song.otherArtists?.map((a) => {
            console.log(
              "[v0] Mapping artist - id:",
              a.id,
              "name:",
              a.name,
              "role:",
              a.role
            );
            return {
              artistId: a.id,
              role: a.role,
            };
          }) || [];

        console.log("[v0] Mapped otherArtists for form:", mappedOtherArtists);

        setFormData({
          title: song.title,
          duration: song.duration,
          mainArtistId: song.mainArtist.id,
          otherArtists: mappedOtherArtists,
          genreIds: song.genres?.map((g) => g.id) || [],
          albumIds: song.albums?.map((a) => a.id) || [],
          musicFile: undefined,
          imgFile: undefined,
        });
      } else {
        setFormData({
          title: "",
          duration: 0,
          mainArtistId: 0,
          otherArtists: [],
          genreIds: [],
          albumIds: [],
          musicFile: undefined,
          imgFile: undefined,
        });
      }
    }
  }, [open, song]);

  const fetchData = async () => {
    try {
      const [artistsData, genresData, albumsData, rolesData] =
        await Promise.all([
          artistService.getAll(),
          genreService.getAll(),
          albumService.getAll(),
          commonService.getArtistRoles(),
        ]);
      setArtists(artistsData);
      setGenres(genresData);
      setAlbums(albumsData);
      setArtistRoles(rolesData);
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || formData.duration <= 0 || !formData.mainArtistId) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      if (song) {
        await songService.update(song.id, formData);
        toast.success("Cập nhật bài hát thành công");
      } else {
        if (!formData.musicFile) {
          toast.error("Vui lòng chọn file nhạc");
          return;
        }
        await songService.create(formData as SongRequest);
        toast.success("Thêm bài hát thành công");
      }
      onSuccess();
    } catch (error) {
      toast.error(
        song ? "Không thể cập nhật bài hát" : "Không thể thêm bài hát"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addOtherArtist = () => {
    setFormData({
      ...formData,
      otherArtists: [
        ...formData.otherArtists,
        { artistId: 0, role: "FEATURED" as ArtistRole },
      ],
    });
  };

  const removeOtherArtist = (index: number) => {
    setFormData({
      ...formData,
      otherArtists: formData.otherArtists.filter((_, i) => i !== index),
    });
  };

  const updateOtherArtist = (
    index: number,
    field: "artistId" | "role",
    value: number | string
  ) => {
    const updated = [...formData.otherArtists];
    if (field === "artistId") {
      updated[index].artistId = value as number;
    } else {
      updated[index].role = value as ArtistRole;
    }
    setFormData({ ...formData, otherArtists: updated });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {song ? "Chỉnh sửa bài hát" : "Thêm bài hát mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Tên bài hát *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Nhập tên bài hát"
            />
          </div>

          <div>
            <Label htmlFor="duration">Thời lượng (giây) *</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  duration: Number.parseInt(e.target.value) || 0,
                })
              }
              placeholder="180"
            />
          </div>

          <div>
            <Label htmlFor="mainArtist">Nghệ sĩ chính *</Label>
            <Select
              value={formData.mainArtistId.toString()}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  mainArtistId: Number.parseInt(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn nghệ sĩ chính" />
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
            <div className="flex items-center justify-between mb-2">
              <Label>Nghệ sĩ khác</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addOtherArtist}
              >
                <Plus className="w-4 h-4 mr-1" />
                Thêm nghệ sĩ
              </Button>
            </div>
            <div className="space-y-2">
              {formData.otherArtists.length > 0 ? (
                formData.otherArtists.map((artist, index) => {
                  console.log(
                    "[v0] Rendering otherArtist at index",
                    index,
                    ":",
                    artist
                  );
                  console.log(
                    "[v0] Artist value for Select:",
                    artist.artistId.toString()
                  );
                  console.log(
                    "[v0] Available artists:",
                    artists.map((a) => a.id)
                  );

                  return (
                    <div key={index} className="flex gap-2 items-start">
                      <Select
                        value={
                          artist.artistId > 0
                            ? artist.artistId.toString()
                            : undefined
                        }
                        onValueChange={(value) =>
                          updateOtherArtist(
                            index,
                            "artistId",
                            Number.parseInt(value)
                          )
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Chọn nghệ sĩ" />
                        </SelectTrigger>
                        <SelectContent>
                          {artists.map((a) => (
                            <SelectItem key={a.id} value={a.id.toString()}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={artist.role}
                        onValueChange={(value) =>
                          updateOtherArtist(index, "role", value)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                          {artistRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeOtherArtist(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  Chưa có nghệ sĩ khác
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Thể loại</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {genres.map((genre) => (
                <label
                  key={genre.id}
                  className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.genreIds.includes(genre.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          genreIds: [...formData.genreIds, genre.id],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          genreIds: formData.genreIds.filter(
                            (id) => id !== genre.id
                          ),
                        });
                      }
                    }}
                  />
                  <span className="text-sm">{genre.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Albums</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {albums.map((album) => (
                <label
                  key={album.id}
                  className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.albumIds.includes(album.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          albumIds: [...formData.albumIds, album.id],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          albumIds: formData.albumIds.filter(
                            (id) => id !== album.id
                          ),
                        });
                      }
                    }}
                  />
                  <span className="text-sm">{album.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="musicFile">File nhạc {!song && "*"}</Label>
            <Input
              id="musicFile"
              type="file"
              accept="audio/*"
              onChange={(e) =>
                setFormData({ ...formData, musicFile: e.target.files?.[0] })
              }
            />
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
              {loading ? "Đang lưu..." : song ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
