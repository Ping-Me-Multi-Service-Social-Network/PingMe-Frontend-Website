import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Music, Lock, Globe, Trash2, Edit2 } from "lucide-react";
import { playlistApi } from "@/services/music/playlistApi";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import { EmptyState } from "@/components/custom/EmptyState";
import type { PlaylistDto } from "@/types/music/playlist";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PlaylistsPage() {
    const navigate = useNavigate();
    const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editingPlaylist, setEditingPlaylist] = useState<PlaylistDto | null>(null);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);

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
            setPlaylists(prev => [...prev, newPlaylist]);
            setShowCreateDialog(false);
            setNewPlaylistName("");
            setIsPublic(false);
        } catch (err) {
            console.error("Error creating playlist:", err);
        } finally {
            setCreating(false);
        }
    };

    const handleDeletePlaylist = async (id: number) => {
        if (!confirm("Are you sure you want to delete this playlist?")) return;

        try {
            await playlistApi.deletePlaylist(id);
            setPlaylists(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error("Error deleting playlist:", err);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-900">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-900">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 pb-32" style={{ minHeight: '100vh' }}>
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/music")}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Music
                    </button>

                    <div className="flex items-center justify-between">
                        <h1 className="text-4xl font-bold text-white">Your Playlists</h1>
                        <Button
                            onClick={() => setShowCreateDialog(true)}
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Playlist
                        </Button>
                    </div>
                </div>

                {/* Playlists Grid */}
                {playlists.length === 0 ? (
                    <EmptyState
                        icon={Music}
                        title="No playlists yet"
                        description="Create your first playlist to get started"
                        action={{
                            label: "Create Playlist",
                            onClick: () => setShowCreateDialog(true),
                        }}
                    />
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {playlists.map((playlist) => (
                            <div
                                key={playlist.id}
                                className="group relative rounded-lg bg-zinc-800/50 p-4 hover:bg-zinc-700/50 transition-colors cursor-pointer"
                                onClick={() => navigate(`/music/playlists/${playlist.id}`)}
                            >
                                <div className="aspect-square rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
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
                                                <span>Public</span>
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-3 h-3" />
                                                <span>Private</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => handleEditPlaylist(playlist, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all"
                                            title="Edit playlist"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeletePlaylist(playlist.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                                            title="Delete playlist"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Playlist Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Playlist</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="playlist-name">Playlist Name</Label>
                            <Input
                                id="playlist-name"
                                placeholder="My Awesome Playlist"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is-public"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="rounded"
                            />
                            <Label htmlFor="is-public" className="cursor-pointer">
                                Make this playlist public
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCreateDialog(false)}
                            disabled={creating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreatePlaylist}
                            disabled={!newPlaylistName.trim() || creating}
                        >
                            {creating ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Playlist Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Playlist</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-playlist-name">Playlist Name</Label>
                            <Input
                                id="edit-playlist-name"
                                placeholder="My Awesome Playlist"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdatePlaylist()}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="edit-is-public"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="rounded"
                            />
                            <Label htmlFor="edit-is-public" className="cursor-pointer">
                                Make this playlist public
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowEditDialog(false);
                                setEditingPlaylist(null);
                                setNewPlaylistName("");
                                setIsPublic(false);
                            }}
                            disabled={updating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdatePlaylist}
                            disabled={!newPlaylistName.trim() || updating}
                        >
                            {updating ? "Updating..." : "Update"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
