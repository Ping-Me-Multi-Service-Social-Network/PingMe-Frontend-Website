import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Disc3 } from "lucide-react";
import type { AlbumResponse } from "@/types/music";
import { DeleteConfirmDialog } from "@/components/custom/DeleteConfirmationDialog";
import { EmptyState } from "@/components/custom/EmptyState";

interface AlbumTableProps {
  albums: AlbumResponse[];
  onEdit: (album: AlbumResponse) => void;
  onDelete: (id: number) => void;
}

export function AlbumTable({ albums, onEdit, onDelete }: AlbumTableProps) {
  if (!albums || albums.length === 0) {
    return (
      <EmptyState
        icon={Disc3}
        title="Chưa có album"
        description="Thêm album đầu tiên để bắt đầu"
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Ảnh</TableHead>
            <TableHead>Tên album</TableHead>
            <TableHead>Lượt nghe</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {albums.map((album) => (
            <TableRow key={album.id}>
              <TableCell>
                <img
                  src={
                    album.coverImgUrl || "/placeholder.svg?height=40&width=40"
                  }
                  alt={album.title}
                  className="w-10 h-10 rounded object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">{album.title}</TableCell>
              <TableCell>{album.playCount.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(album)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <DeleteConfirmDialog
                    onConfirm={() => onDelete(album.id)}
                    title="Xóa album"
                    description="Bạn có chắc chắn muốn xóa album này không?"
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
