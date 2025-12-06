import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, User } from "lucide-react";
import type { ArtistResponse } from "@/types/music";
import { DeleteConfirmDialog } from "@/components/custom/DeleteConfirmationDialog";
import { EmptyState } from "@/components/custom/EmptyState";

interface ArtistTableProps {
  artists: ArtistResponse[];
  onEdit: (artist: ArtistResponse) => void;
  onDelete: (id: number) => void;
}

export function ArtistTable({ artists, onEdit, onDelete }: ArtistTableProps) {
  if (!artists || artists.length === 0) {
    return (
      <EmptyState
        icon={User}
        title="Chưa có nghệ sĩ"
        description="Thêm nghệ sĩ đầu tiên để bắt đầu"
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Ảnh</TableHead>
            <TableHead>Tên nghệ sĩ</TableHead>
            <TableHead>Tiểu sử</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {artists.map((artist) => (
            <TableRow key={artist.id}>
              <TableCell>
                <img
                  src={artist.imgUrl || "/placeholder.svg?height=40&width=40"}
                  alt={artist.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">{artist.name}</TableCell>
              <TableCell className="max-w-md truncate">{artist.bio}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(artist)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <DeleteConfirmDialog
                    onConfirm={() => onDelete(artist.id)}
                    title="Xóa nghệ sĩ"
                    description="Bạn có chắc chắn muốn xóa nghệ sĩ này không?"
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
