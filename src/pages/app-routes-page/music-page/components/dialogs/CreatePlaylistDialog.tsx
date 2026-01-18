import { useState } from "react";
import { playlistApi } from "@/services/music/playlistApi.ts";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { toast } from "sonner";

interface CreatePlaylistDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function CreatePlaylistDialog({
    open,
    onOpenChange,
    onSuccess,
}: Readonly<CreatePlaylistDialogProps>) {
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [creating, setCreating] = useState(false);

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;

        try {
            setCreating(true);
            await playlistApi.createPlaylist({
                name: newPlaylistName,
                isPublic: isPublic,
            });
            toast.success("Playlist đã được tạo thành công!");
            onOpenChange(false);
            setNewPlaylistName("");
            setIsPublic(false);
            onSuccess?.();
        } catch (err) {
            console.error("Error creating playlist:", err);
            toast.error("Không thể tạo playlist");
        } finally {
            setCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                            className="h-4 w-4 rounded border-zinc-600 accent-purple-600"
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
                        onClick={() => onOpenChange(false)}
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
    );
}
