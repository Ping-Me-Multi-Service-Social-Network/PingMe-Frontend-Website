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
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation("music");

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;

        try {
            setCreating(true);
            await playlistApi.createPlaylist({
                name: newPlaylistName,
                isPublic: isPublic,
            });
            toast.success(t("pages.playlists.createSuccess"));
            onOpenChange(false);
            setNewPlaylistName("");
            setIsPublic(false);
            onSuccess?.();
        } catch (err) {
            console.error("Error creating playlist:", err);
            toast.error(t("pages.playlists.createError"));
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
                        {t("pages.playlists.createTitle")}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {/* Playlist Name */}
                    <div className="space-y-2">
                        <label
                            htmlFor="playlist-name"
                            className="text-sm font-medium text-zinc-300"
                        >
                            {t("pages.playlists.nameLabel")}
                        </label>

                        <Input
                            id="playlist-name"
                            placeholder={t("pages.playlists.namePlaceholder")}
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
                            {t("pages.playlists.sharePublic")}
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
                        {t("common.cancel")}
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
                        {creating ? t("pages.playlists.creating") : t("pages.playlists.create")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
