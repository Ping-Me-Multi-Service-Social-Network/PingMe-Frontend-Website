import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Music, Lock, Globe, Trash2, Edit2, Compass } from "lucide-react";
import { playlistApi } from "@/services/music/playlistApi.ts";
import { EmptyState } from "@/components/custom/EmptyState.tsx";
import type { PlaylistDto } from "@/types/music/playlist.ts";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog.tsx";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { LoadingState, ErrorState } from "./LoadingErrorStates";

export default function PlaylistsPage() {
    const navigate = useNavigate();
    const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingPlaylist, setDeletingPlaylist] = useState<PlaylistDto | null>(null);
    const [editingPlaylist, setEditingPlaylist] = useState<PlaylistDto | null>(null);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const data = await playlistApi.getPlaylists();
            setPlaylists(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching playlists:", err);
            setError("Failed to load playlists");
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;

        try {
            setCreating(true);
            const newPlaylist = await playlistApi.createPlaylist({
                name: newPlaylistName,
                isPublic: isPublic,
            });
            console.log("Created playlist:", newPlaylist);
            setPlaylists(prev => {
                const updated = [...prev, newPlaylist];
                console.log("Updated playlists:", updated);
                return updated;
            });
            setShowCreateDialog(false);
            setNewPlaylistName("");
            setIsPublic(false);
        } catch (err) {
            console.error("Error creating playlist:", err);
        } finally {
            setCreating(false);
        }
    };

    const handleDeletePlaylist = (playlist: PlaylistDto) => {
        setDeletingPlaylist(playlist);
        setShowDeleteDialog(true);
    };

    const confirmDeletePlaylist = async () => {
        if (!deletingPlaylist) return;

        try {
            setDeleting(true);
            await playlistApi.deletePlaylist(deletingPlaylist.id);
            setPlaylists(prev => prev.filter(p => p.id !== deletingPlaylist.id));
            setShowDeleteDialog(false);
            setDeletingPlaylist(null);
        } catch (err) {
            console.error("Error deleting playlist:", err);
        } finally {
            setDeleting(false);
        }
    };

    const handleEditPlaylist = (playlist: PlaylistDto, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingPlaylist(playlist);
        setNewPlaylistName(playlist.name);
        setIsPublic(playlist.isPublic);
        setShowEditDialog(true);
    };

    const handleUpdatePlaylist = async () => {
        if (!editingPlaylist || !newPlaylistName.trim()) return;

        try {
            setUpdating(true);
            const updated = await playlistApi.updatePlaylist(editingPlaylist.id, {
                name: newPlaylistName,
                isPublic: isPublic,
            });
            setPlaylists(prev => prev.map(p => p.id === updated.id ? updated : p));
            setShowEditDialog(false);
            setEditingPlaylist(null);
            setNewPlaylistName("");
            setIsPublic(false);
        } catch (err) {
            console.error("Error updating playlist:", err);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;

    return (
        <div className="bg-gray-900 pb-32" style={{ minHeight: '100vh' }}>
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/app/music")}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Quay Lại
                    </button>

                    <div className="flex items-center justify-between">
                        <h1 className="text-4xl font-bold text-white">Danh Sách Phát Của Bạn</h1>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => navigate("/app/music/playlists/discover")}
                                variant="outline"
                                className="flex items-center gap-2 bg-green-900/20 border-green-700 text-green-400 hover:bg-green-900/40 hover:text-green-300"
                            >
                                <Compass className="w-5 h-5" />
                                Khám Phá Playlist Công Khai
                            </Button>
                            <Button
                                onClick={() => setShowCreateDialog(true)}
                                className="flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Tạo Playlist
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Playlists Grid */}
                {playlists.length === 0 ? (
                    <EmptyState
                        icon={Music}
                        title="Chưa có playlist nào"
                        description="Tạo playlist đầu tiên của bạn để bắt đầu"
                        action={
                            <Button onClick={() => setShowCreateDialog(true)}>
                                Tạo Playlist
                            </Button>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {playlists.map((playlist) => (
                            <button
                                key={playlist.id}
                                className="group relative rounded-lg bg-zinc-800/50 p-4 hover:bg-zinc-700/50 transition-colors cursor-pointer w-full text-left"
                                onClick={() => navigate(`/app/music/playlists/${playlist.id}`)}
                            >
                                <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-4">
                                    <Music className="w-12 h-12 text-white" />
                                </div>

                                <h3 className="font-semibold text-white mb-1 truncate">
                                    {playlist.name}
                                </h3>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                                        {playlist.isPublic ? (
                                            <>
                                                <Globe className="w-3 h-3" />
                                                <span>Công khai</span>
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-3 h-3" />
                                                <span>Riêng tư</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => handleEditPlaylist(playlist, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 transition-all"
                                            title="Chỉnh sửa playlist"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeletePlaylist(playlist);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                                            title="Xóa playlist"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Playlist Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent
                    className=" bg-zinc-900 
                                border border-zinc-800 
                                text-white
                                shadow-2xl
                                backdrop-blur-xl
                                rounded-2xl
                                max-w-md  
                                data-[state=open]:animate-in
                                data-[state=closed]:animate-out
                                data-[state=open]:fade-in-0
                                data-[state=closed]:fade-out-0
                                data-[state=open]:zoom-in-95
                                data-[state=closed]:zoom-out-95
                                duration-200"
                >
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold tracking-tight">
                            Tạo Playlist Mới
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                        {/* Playlist Name */}
                        <div className="space-y-2">
                            <label
                                htmlFor="playlist-name"
                                className="text-sm font-medium text-zinc-300"
                            >
                                Tên Playlist
                            </label>

                            <Input
                                id="playlist-name"
                                placeholder="Playlist Tuyệt Vời Của Tôi"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
                                className=" bg-zinc-800
                                        border border-zinc-700
                                        text-white
                                        placeholder:text-zinc-500
                                        focus-visible:ring-2
                                        focus-visible:ring-purple-600
                                        focus-visible:ring-offset-0
                                        rounded-lg"
                            />
                        </div>

                        {/* Public Checkbox */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="is-public"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="h-4 w-4 rounded border-zinc-600accent-purple-600"
                            />
                            <label
                                htmlFor="is-public"
                                className="text-sm text-zinc-300 cursor-pointer select-none"
                            >
                                Chia sẻ playlist này công khai
                            </label>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setShowCreateDialog(false)}
                            disabled={creating}
                            className="text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full px-6"
                        >
                            Hủy
                        </Button>

                        <Button
                            onClick={handleCreatePlaylist}
                            disabled={!newPlaylistName.trim() || creating}
                            className="bg-purple-600
                                    hover:bg-purple-500
                                    text-white
                                    rounded-full
                                    px-6
                                    font-medium
                                    disabled:opacity-50"
                        >
                            {creating ? "Đang tạo..." : "Tạo"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Playlist Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="bg-zinc-900 border border-zinc-800 text-white shadow-2xl backdrop-blur-xl rounded-2xl max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold tracking-tight">
                            Chỉnh sửa Playlist
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                        {/* Playlist Name */}
                        <div className="space-y-2">
                            <label
                                htmlFor="edit-playlist-name"
                                className="text-sm font-medium text-zinc-300"
                            >
                                Tên Playlist
                            </label>
                            <Input
                                id="edit-playlist-name"
                                placeholder="Playlist Tuyệt Vời Của Tôi"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleUpdatePlaylist()}
                                className="bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-0 rounded-lg"
                            />
                        </div>

                        {/* Public Checkbox */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="edit-is-public"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="h-4 w-4 rounded border-zinc-600 accent-purple-600"
                            />
                            <label
                                htmlFor="edit-is-public"
                                className="text-sm text-zinc-300 cursor-pointer select-none"
                            >
                                Chia sẻ playlist này công khai
                            </label>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setShowEditDialog(false);
                                setEditingPlaylist(null);
                                setNewPlaylistName("");
                                setIsPublic(false);
                            }}
                            disabled={updating}
                            className="text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full px-6"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleUpdatePlaylist}
                            disabled={!newPlaylistName.trim() || updating}
                            className="bg-purple-600 hover:bg-purple-500 text-white rounded-full px-6 font-medium disabled:opacity-50"
                        >
                            {updating ? "Đang cập nhật..." : "Cập nhật"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-white">
                            Xóa Playlist
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            Bạn có chắc chắn muốn xóa playlist <span className="font-semibold text-purple-400">"{deletingPlaylist?.name}"</span>?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border-zinc-700 rounded-full px-6"
                            disabled={deleting}
                        >
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeletePlaylist}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-500 text-white rounded-full px-6 font-medium disabled:opacity-50"
                        >
                            {deleting ? "Đang xóa..." : "Xóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
