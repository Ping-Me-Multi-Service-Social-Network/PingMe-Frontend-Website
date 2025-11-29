import { useState, useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { GenreTable } from "./components/GenreTable";
import { GenreFormDialog } from "./components/GenreFormDialog";
import { genreService } from "@/services/music/musicService";
import type { GenreResponse } from "@/types/music";
import { toast } from "sonner";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import { Input } from "@/components/ui/input";

const ITEMS_PER_PAGE = 6;

export default function GenreManagementPage() {
  const [genres, setGenres] = useState<GenreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<GenreResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchGenres = async () => {
    try {
      setLoading(true);
      const data = await genreService.getAll();
      setGenres(data);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Không thể tải danh sách thể loại");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const filteredGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGenres.length / ITEMS_PER_PAGE);
  const paginatedGenres = filteredGenres.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCreate = () => {
    setEditingGenre(null);
    setDialogOpen(true);
  };

  const handleEdit = (genre: GenreResponse) => {
    setEditingGenre(genre);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await genreService.softDelete(id);
      toast.success("Đã xóa thể loại");
      fetchGenres();
    } catch (error) {
      toast.error("Không thể xóa thể loại");
      console.error(error);
    }
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    fetchGenres();
  };

  return (
    <div className="flex-1 overflow-auto">
      <PageHeader
        title="Quản lý Thể loại"
        description="Quản lý thể loại nhạc"
        actions={
          <Button
            onClick={handleCreate}
            className="bg-white text-purple-600 hover:bg-purple-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm thể loại
          </Button>
        }
      />

      <div className="p-8">
        <div className="mb-6 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên thể loại..."
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
            <GenreTable
              genres={paginatedGenres}
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

      <GenreFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        genre={editingGenre}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
