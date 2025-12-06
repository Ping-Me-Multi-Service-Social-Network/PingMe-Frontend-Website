import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Tag } from "lucide-react";
import type { GenreResponse } from "@/types/music";
import { DeleteConfirmDialog } from "@/components/custom/DeleteConfirmationDialog";
import { EmptyState } from "@/components/custom/EmptyState";

interface GenreTableProps {
  genres: GenreResponse[];
  onEdit: (genre: GenreResponse) => void;
  onDelete: (id: number) => void;
}

export function GenreTable({ genres, onEdit, onDelete }: GenreTableProps) {
  if (!genres || genres.length === 0) {
    return (
      <EmptyState
        icon={Tag}
        title="Chưa có thể loại"
        description="Thêm thể loại đầu tiên để bắt đầu"
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên thể loại</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {genres.map((genre) => (
            <TableRow key={genre.id}>
              <TableCell className="font-medium">{genre.name}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(genre)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <DeleteConfirmDialog
                    onConfirm={() => onDelete(genre.id)}
                    title="Xóa thể loại"
                    description="Bạn có chắc chắn muốn xóa thể loại này không?"
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
