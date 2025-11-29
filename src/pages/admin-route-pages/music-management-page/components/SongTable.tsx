import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Music } from "lucide-react";
import type { SongResponseWithAllAlbum } from "@/types/music";
import { DeleteConfirmDialog } from "@/components/custom/DeleteConfirmationDialog";
import { EmptyState } from "@/components/custom/EmptyState";

interface SongTableProps {
  songs: SongResponseWithAllAlbum[];
  onEdit: (song: SongResponseWithAllAlbum) => void;
  onDelete: (id: number) => void;
}

export function SongTable({ songs, onEdit, onDelete }: SongTableProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!songs || songs.length === 0) {
    return (
      <EmptyState
        icon={Music}
        title="Chưa có bài hát"
        description="Thêm bài hát đầu tiên để bắt đầu"
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Ảnh</TableHead>
            <TableHead>Tên bài hát</TableHead>
            <TableHead>Nghệ sĩ chính</TableHead>
            <TableHead>Thời lượng</TableHead>
            <TableHead>Lượt nghe</TableHead>
            <TableHead>Thể loại</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {songs.map((song) => (
            <TableRow key={song.id}>
              <TableCell>
                <img
                  src={
                    song.coverImageUrl || "/placeholder.svg?height=40&width=40"
                  }
                  alt={song.title}
                  className="w-10 h-10 rounded object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">{song.title}</TableCell>
              <TableCell>{song.mainArtist.name}</TableCell>
              <TableCell>{formatDuration(song.duration)}</TableCell>
              <TableCell>{song.playCount.toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {song.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(song)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <DeleteConfirmDialog
                    onConfirm={() => onDelete(song.id)}
                    title="Xóa bài hát"
                    description="Bạn có chắc chắn muốn xóa bài hát này không?"
                  >
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </DeleteConfirmDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
