import { useState, useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { SongTable } from "./components/SongTable";
import { SongFormDialog } from "./components/SongFormDialog";
import { songService } from "@/services/music/musicService";
import type { SongResponseWithAllAlbum } from "@/types/music";
import { toast } from "sonner";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import { Input } from "@/components/ui/input";

const ITEMS_PER_PAGE = 6;

export default function MusicManagementPage() {
  const [songs, setSongs] = useState<SongResponseWithAllAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSong, setEditingSong] =
    useState<SongResponseWithAllAlbum | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const data = await songService.getAll();
      setSongs(data);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Không thể tải danh sách bài hát");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.mainArtist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSongs.length / ITEMS_PER_PAGE);
  const paginatedSongs = filteredSongs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCreate = () => {
    setEditingSong(null);
    setDialogOpen(true);
  };

  const handleEdit = (song: SongResponseWithAllAlbum) => {
    setEditingSong(song);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await songService.softDelete(id);
      toast.success("Đã xóa bài hát");
      fetchSongs();
    } catch (error) {
      toast.error("Không thể xóa bài hát");
      console.error(error);
    }
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    fetchSongs();
  };

  return (
    <div className="flex-1 overflow-auto">
      <PageHeader
        title="Quản lý nhạc"
        description="Quản lý bài hát, nghệ sĩ, album và thể loại"
        actions={
          <Button
            onClick={handleCreate}
            className="bg-white text-purple-600 hover:bg-purple-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm bài hát
          </Button>
        }
      />

      <div className="p-8">
        <div className="mb-6 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên bài hát hoặc nghệ sĩ..."
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
            <SongTable
              songs={paginatedSongs}
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

      <SongFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        song={editingSong}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
