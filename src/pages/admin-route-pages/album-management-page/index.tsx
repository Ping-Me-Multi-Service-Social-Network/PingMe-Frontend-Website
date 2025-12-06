import { useState, useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { AlbumTable } from "./components/AlbumTable";
import { AlbumFormDialog } from "./components/AlbumFormDialog";
import { albumService } from "@/services/music/musicService";
import type { AlbumResponse } from "@/types/music";
import { toast } from "sonner";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import { Input } from "@/components/ui/input";

const ITEMS_PER_PAGE = 6;

export default function AlbumManagementPage() {
  const [albums, setAlbums] = useState<AlbumResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<AlbumResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const data = await albumService.getAll();
      setAlbums(data);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Không thể tải danh sách album");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const filteredAlbums = albums.filter((album) =>
    album.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAlbums.length / ITEMS_PER_PAGE);
  const paginatedAlbums = filteredAlbums.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCreate = () => {
    setEditingAlbum(null);
    setDialogOpen(true);
  };

  const handleEdit = (album: AlbumResponse) => {
    setEditingAlbum(album);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await albumService.softDelete(id);
      toast.success("Đã xóa album");
      fetchAlbums();
    } catch (error) {
      toast.error("Không thể xóa album");
      console.error(error);
    }
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    fetchAlbums();
  };

  return (
    <div className="flex-1 overflow-auto">
      <PageHeader
        title="Quản lý Album"
        description="Quản lý album nhạc"
        actions={
          <Button
            onClick={handleCreate}
            className="bg-white text-purple-600 hover:bg-purple-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm album
          </Button>
        }
      />

      <div className="p-8">
        <div className="mb-6 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên album..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1"
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <AlbumTable
              albums={paginatedAlbums}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-purple-600" : ""}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <AlbumFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        album={editingAlbum}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
