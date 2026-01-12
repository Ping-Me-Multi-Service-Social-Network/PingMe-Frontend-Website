import { useState, useEffect } from "react";
import { Search, Plus, ListPlus, Music2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
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
import { playlistApi } from "@/services/music/playlistApi";
import type { PlaylistDto } from "@/types/music/playlist";
import { toast } from "sonner";

interface PlaylistDropdownProps {
    songId: number;
    trigger: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    variant?: "full" | "simple"; // full = with search, simple = without search
}

interface CreatePlaylistDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    playlistName: string;
    onPlaylistNameChange: (name: string) => void;
    isPublic: boolean;
    onIsPublicChange: (isPublic: boolean) => void;
    onCreatePlaylist: () => void;
    isLoading: boolean;
    idSuffix?: string;
}

function CreatePlaylistDialog({
    open,
    onOpenChange,
    playlistName,
    onPlaylistNameChange,
    isPublic,
    onIsPublicChange,
    onCreatePlaylist,
    isLoading,
    idSuffix = "",
}: Readonly<CreatePlaylistDialogProps>) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                    <DialogTitle>Tạo danh sách phát mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="playlistName">Tên danh sách phát</Label>
                        <Input
                            id="playlistName"
                            placeholder="Nhập tên danh sách phát"
                            value={playlistName}
                            onChange={(e) => onPlaylistNameChange(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    onCreatePlaylist();
                                }
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id={`is-public${idSuffix}`}
                            checked={isPublic}
                            onChange={(e) => onIsPublicChange(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-600 accent-purple-600"
                        />
                        <label
                            htmlFor={`is-public${idSuffix}`}
                            className="text-sm text-gray-300 cursor-pointer select-none"
                        >
                            Chia sẻ playlist này công khai
                        </label>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            onOpenChange(false);
                            onPlaylistNameChange("");
                            onIsPublicChange(false);
                        }}
                        className="text-gray-400 hover:text-white"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={onCreatePlaylist}
                        disabled={isLoading || !playlistName.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {isLoading ? "Đang tạo..." : "Tạo"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function PlaylistDropdown({
    songId,
    trigger,
    open,
    onOpenChange,
    variant = "full",
}: Readonly<PlaylistDropdownProps>) {
    const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Load playlists when dropdown opens
    useEffect(() => {
        if (open) {
            loadPlaylists();
        }
    }, [open]);

    // Listen for playlist updates from other components
    useEffect(() => {
        const handlePlaylistUpdated = () => {
            if (open) {
                loadPlaylists();
            }
        };

        globalThis.addEventListener("playlist-updated", handlePlaylistUpdated);
        return () => {
            globalThis.removeEventListener("playlist-updated", handlePlaylistUpdated);
        };
    }, [open]);

    const loadPlaylists = async () => {
        try {
            const data = await playlistApi.getPlaylists();
            setPlaylists(data);
        } catch (error) {
            console.error("Error loading playlists:", error);
            toast.error("Không thể tải danh sách playlist");
        }
    };

    const handleAddToPlaylist = async (playlistId: number) => {
        try {
            const result = await playlistApi.addSongToPlaylist(playlistId, songId);
            if (result.alreadyExists) {
                toast.info("Bài hát đã có trong playlist");
            } else {
                toast.success("Đã thêm vào playlist");
            }

            // Dispatch event to notify other components
            globalThis.dispatchEvent(
                new CustomEvent("playlist-updated", {
                    detail: { playlistId, songId },
                })
            );

            onOpenChange?.(false);
        } catch (error) {
            console.error("Error adding to playlist:", error);
            toast.error("Không thể thêm vào playlist");
        }
    };

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) {
            toast.error("Vui lòng nhập tên playlist");
            return;
        }

        setIsLoading(true);
        try {
            const newPlaylist = await playlistApi.createPlaylist({
                name: newPlaylistName,
                isPublic: isPublic,
            });
            await playlistApi.addSongToPlaylist(newPlaylist.id, songId);

            // Add to local state immediately
            setPlaylists((prev) => [...prev, newPlaylist]);

            toast.success("Đã tạo playlist và thêm bài hát");
            setShowCreateDialog(false);
            setNewPlaylistName("");
            setIsPublic(false);

            // Dispatch event to notify other components
            globalThis.dispatchEvent(
                new CustomEvent("playlist-updated", {
                    detail: { playlist: newPlaylist },
                })
            );

            onOpenChange?.(false);
        } catch (error) {
            console.error("Error creating playlist:", error);
            toast.error("Không thể tạo playlist");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPlaylists = playlists.filter((playlist) =>
        playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (variant === "simple") {
        return (
            <>
                <DropdownMenu open={open} onOpenChange={onOpenChange}>
                    <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-[280px] bg-gray-800 border-gray-700"
                    >
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="text-white hover:bg-gray-700">
                                <ListPlus className="mr-2 h-4 w-4" />
                                <span>Thêm vào danh sách phát</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-[280px] bg-gray-800 border-gray-700 max-h-[400px] overflow-y-auto">
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onOpenChange?.(false);
                                        setTimeout(() => setShowCreateDialog(true), 100);
                                    }}
                                    className="text-white hover:bg-gray-700 cursor-pointer"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    <span>Danh sách phát mới</span>
                                </DropdownMenuItem>

                                {playlists.length > 0 && (
                                    <>
                                        <DropdownMenuSeparator className="bg-gray-700" />
                                        {playlists.map((playlist) => (
                                            <DropdownMenuItem
                                                key={playlist.id}
                                                onClick={() => handleAddToPlaylist(playlist.id)}
                                                className="text-white hover:bg-gray-700 cursor-pointer"
                                            >
                                                <Music2 className="mr-2 h-4 w-4" />
                                                <span className="truncate">{playlist.name}</span>
                                            </DropdownMenuItem>
                                        ))}
                                    </>
                                )}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    </DropdownMenuContent>
                </DropdownMenu>

                <CreatePlaylistDialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                    playlistName={newPlaylistName}
                    onPlaylistNameChange={setNewPlaylistName}
                    isPublic={isPublic}
                    onIsPublicChange={setIsPublic}
                    onCreatePlaylist={handleCreatePlaylist}
                    isLoading={isLoading}
                    idSuffix="-simple"
                />
            </>
        );
    }

    // Full variant with search
    return (
        <>
            <DropdownMenu open={open} onOpenChange={onOpenChange}>
                <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-[280px] bg-gray-800 border-gray-700"
                    onEscapeKeyDown={(e) => e.stopPropagation()}
                    onPointerDownOutside={(e) => e.stopPropagation()}
                >
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="text-white hover:bg-gray-700">
                            <ListPlus className="mr-2 h-4 w-4" />
                            <span>Thêm vào danh sách phát</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-[280px] bg-gray-800 border-gray-700 max-h-[400px] overflow-y-auto">
                            {/* Search Playlist */}
                            <div className="p-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Tìm một danh sách phát"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            <DropdownMenuSeparator className="bg-gray-700" />

                            {/* Create New Playlist */}
                            <DropdownMenuItem
                                className="text-white hover:bg-gray-700 cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onOpenChange?.(false);
                                    setTimeout(() => setShowCreateDialog(true), 100);
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                <span>Danh sách phát mới</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-gray-700" />

                            {/* Playlist Items */}
                            {filteredPlaylists.length > 0 ? (
                                filteredPlaylists.map((playlist) => (
                                    <DropdownMenuItem
                                        key={playlist.id}
                                        className="text-white hover:bg-gray-700 cursor-pointer"
                                        onClick={() => handleAddToPlaylist(playlist.id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Music2 className="h-4 w-4" />
                                            <span className="truncate">{playlist.name}</span>
                                        </div>
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-400 text-sm">
                                    {searchQuery
                                        ? "Không tìm thấy playlist"
                                        : "Chưa có playlist nào"}
                                </div>
                            )}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>

            <CreatePlaylistDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                playlistName={newPlaylistName}
                onPlaylistNameChange={setNewPlaylistName}
                isPublic={isPublic}
                onIsPublicChange={setIsPublic}
                onCreatePlaylist={handleCreatePlaylist}
                isLoading={isLoading}
                idSuffix="-full"
            />
        </>
    );
}
