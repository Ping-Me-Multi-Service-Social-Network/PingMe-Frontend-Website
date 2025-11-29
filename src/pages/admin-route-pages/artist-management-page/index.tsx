import { useState, useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { ArtistTable } from "./components/ArtistTable";
import { ArtistFormDialog } from "./components/ArtistFormDialog";
import { artistService } from "@/services/music/musicService";
import type { ArtistResponse } from "@/types/music";
import { toast } from "sonner";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import { Input } from "@/components/ui/input";

const ITEMS_PER_PAGE = 6;

export default function ArtistManagementPage() {
  const [artists, setArtists] = useState<ArtistResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<ArtistResponse | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const data = await artistService.getAll();
      setArtists(data);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Không thể tải danh sách nghệ sĩ");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredArtists.length / ITEMS_PER_PAGE);
  const paginatedArtists = filteredArtists.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCreate = () => {
    setEditingArtist(null);
    setDialogOpen(true);
  };

  const handleEdit = (artist: ArtistResponse) => {
    setEditingArtist(artist);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await artistService.softDelete(id);
      toast.success("Đã xóa nghệ sĩ");
      fetchArtists();
    } catch (error) {
      toast.error("Không thể xóa nghệ sĩ");
      console.error(error);
    }
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    fetchArtists();
  };

  return (
    <div className="flex-1 overflow-auto">
      <PageHeader
        title="Quản lý Nghệ sĩ"
        description="Quản lý thông tin nghệ sĩ"
        actions={
          <Button
            onClick={handleCreate}
            className="bg-white text-purple-600 hover:bg-purple-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm nghệ sĩ
          </Button>
        }
      />

      <div className="p-8">
        <div className="mb-6 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên nghệ sĩ..."
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
            <ArtistTable
              artists={paginatedArtists}
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

      <ArtistFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        artist={editingArtist}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
