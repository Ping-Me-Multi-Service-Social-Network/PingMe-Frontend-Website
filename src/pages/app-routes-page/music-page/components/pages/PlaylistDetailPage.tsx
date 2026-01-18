import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Play, Trash2, GripVertical, Music2, Lock, Globe, Edit, Save, X } from "lucide-react";
import { playlistApi } from "@/services/music/playlistApi.ts";
import { songApi } from "@/services/music/songApi.ts";
import { useAudioPlayer } from "@/contexts/useAudioPlayer.tsx";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import { EmptyState } from "@/components/custom/EmptyState.tsx";
import type { PlaylistDetailDto, PlaylistSongDto } from "@/types/music/playlist.ts";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";

// Sortable Item Component
interface SortableItemProps {
    item: PlaylistSongDto;
    index: number;
    isEditMode: boolean;
    onPlay: (item: PlaylistSongDto) => void;
    onRemove: (songId: number) => void;
}

function SortableItem({ item, index, isEditMode, onPlay, onRemove }: Readonly<SortableItemProps>) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id, disabled: !isEditMode });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center gap-4 p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors ${isDragging ? "z-50 shadow-2xl" : ""
                }`}
        >
            <div
                {...attributes}
                {...listeners}
                className={`${isEditMode ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
            >
                <GripVertical
                    className={`w-5 h-5 ${isEditMode ? "text-purple-400" : "text-zinc-500"}`}
                />
            </div>

            <span className="text-zinc-400 font-medium w-8 text-center">
                {index + 1}
            </span>

            <button
                onClick={() => !isEditMode && onPlay(item)}
                className="flex-1 flex items-center gap-4 text-left"
                disabled={isEditMode}
            >
                <div className="flex-1">
                    <h3 className={`font-medium transition-colors ${isEditMode
                        ? "text-white"
                        : "text-white group-hover:text-purple-400"
                        }`}>
                        {item.title}
                    </h3>
                </div>
            </button>

            {!isEditMode && (
                <button
                    onClick={() => onRemove(item.songId)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                    title="Xóa khỏi playlist"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}

export default function PlaylistDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { playSong, setPlaylist: setAudioPlaylist } = useAudioPlayer();
    const [playlistDetail, setPlaylistDetail] = useState<PlaylistDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [items, setItems] = useState<PlaylistSongDto[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (id) {
            fetchPlaylistDetail(Number.parseInt(id));
        }
    }, [id]);

    // Listen for playlist updates from GlobalAudioPlayer
    useEffect(() => {
        const handlePlaylistUpdate = (event: Event) => {
            const customEvent = event as CustomEvent<{ playlistId: number; songId: number }>;
            if (id && customEvent.detail.playlistId === Number.parseInt(id)) {
                fetchPlaylistDetail(Number.parseInt(id));
            }
        };

        globalThis.addEventListener('playlist-updated', handlePlaylistUpdate);
        return () => {
            globalThis.removeEventListener('playlist-updated', handlePlaylistUpdate);
        };
    }, [id]);

    const fetchPlaylistDetail = async (playlistId: number) => {
        try {
            setLoading(true);
            const data = await playlistApi.getPlaylistDetail(playlistId);
            setPlaylistDetail(data);
            const sortedItems = [...data.items].sort((a, b) => a.position - b.position);
            setItems(sortedItems);
            setError(null);
        } catch (err) {
            console.error("Error fetching playlist details:", err);
            setError("Failed to load playlist");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSong = async (songId: number) => {
        if (!playlistDetail) return;

        try {
            await playlistApi.removeSongFromPlaylist(playlistDetail.id, songId);
            const newItems = items.filter(item => item.songId !== songId);
            setItems(newItems);
            setPlaylistDetail({
                ...playlistDetail,
                items: newItems
            });
            toast.success("Đã xóa bài hát khỏi playlist");
        } catch (err) {
            console.error("Error removing song:", err);
            toast.error("Không thể xóa bài hát");
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSaveOrder = async () => {
        if (!playlistDetail) return;

        try {
            setIsSaving(true);
            const orderedSongIds = items.map(item => item.songId);

            // Try the reorder endpoint first
            try {
                await playlistApi.reorderPlaylist(playlistDetail.id, orderedSongIds);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error_: any) {
                // If reorder endpoint doesn't exist, use alternative method
                if (error_?.response?.status === 404 || error_?.message?.includes('Network Error')) {
                    console.log("Reorder endpoint not available, using alternative method");

                    // Get current songs
                    const currentSongs = [...playlistDetail.items];

                    // Remove all songs
                    for (const song of currentSongs) {
                        await playlistApi.removeSongFromPlaylist(playlistDetail.id, song.songId);
                    }

                    // Add songs back in new order
                    for (const songId of orderedSongIds) {
                        await playlistApi.addSongToPlaylist(playlistDetail.id, songId);
                    }
                } else {
                    throw error_;
                }
            }

            // Update playlist detail with new order
            await fetchPlaylistDetail(playlistDetail.id);

            setIsEditMode(false);
            toast.success("Đã cập nhật thứ tự bài hát");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Error saving order:", err);
        }
    };

    const handleCancelEdit = () => {
        if (playlistDetail) {
            const sortedItems = [...playlistDetail.items].sort((a, b) => a.position - b.position);
            setItems(sortedItems);
        }
        setIsEditMode(false);
    };

    const handlePlaySong = async (playlistSong: PlaylistSongDto) => {
        try {
            const songDetails = await songApi.getSongById(playlistSong.songId);
            playSong(songDetails);

            // Set playlist to all songs in order
            if (playlistDetail) {
                const allSongs = await Promise.all(
                    playlistDetail.items.map(item => songApi.getSongById(item.songId))
                );
                setAudioPlaylist(allSongs);
            }
        } catch (err) {
            console.error("Error playing song:", err);
        }
    };

    const handlePlayAll = async () => {
        if (!playlistDetail || playlistDetail.items.length === 0) return;

        try {
            const allSongs = await Promise.all(
                playlistDetail.items.map(item => songApi.getSongById(item.songId))
            );
            setAudioPlaylist(allSongs);
            playSong(allSongs[0]);
        } catch (err) {
            console.error("Error playing playlist:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-900">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !playlistDetail) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-900">
                <p className="text-red-400">{error || "Playlist not found"}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 pb-32" style={{ minHeight: '100vh' }}>
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/app/music/playlists")}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Quay Lại Danh Sách
                    </button>

                    <div className="flex items-start gap-6 mb-6">
                        <div className="w-48 h-48 rounded-lg bg-linear-to-br from-purple-500 to-purple-700 flex items-center justify-center shrink-0">
                            <Music2 className="w-24 h-24 text-white" />
                        </div>

                        <div className="flex-1">
                            <p className="text-sm text-zinc-400 mb-2">PLAYLIST</p>
                            <h1 className="text-5xl font-bold text-white mb-4">{playlistDetail.name}</h1>
                            <div className="flex items-center gap-4 text-zinc-400">
                                <div className="flex items-center gap-2">
                                    {playlistDetail.isPublic ? (
                                        <>
                                            <Globe className="w-4 h-4" />
                                            <span>Công khai</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            <span>Riêng tư</span>
                                        </>
                                    )}
                                </div>
                                <span>•</span>
                                <span>{playlistDetail.items.length} bài hát</span>
                            </div>
                        </div>
                    </div>

                    {/* Play All Button */}
                    {playlistDetail.items.length > 0 && (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handlePlayAll}
                                disabled={isEditMode}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-colors ${isEditMode
                                    ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                                    : "bg-purple-600 hover:bg-purple-500 text-white"
                                    }`}
                            >
                                <Play className="w-5 h-5 fill-white" />
                                Phát Tất Cả
                            </button>

                            {isEditMode ? (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleSaveOrder}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-full text-white font-semibold transition-colors disabled:opacity-50"
                                    >
                                        <Save className="w-5 h-5" />
                                        {isSaving ? "Đang lưu..." : "Lưu"}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white font-semibold transition-colors disabled:opacity-50"
                                    >
                                        <X className="w-5 h-5" />
                                        Hủy
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditMode(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white font-semibold transition-colors"
                                >
                                    <Edit className="w-5 h-5" />
                                    Chỉnh Sửa
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Songs List */}
                {playlistDetail.items.length === 0 ? (
                    <EmptyState
                        icon={Music2}
                        title="Không có bài hát trong playlist"
                        description="Thêm bài hát để bắt đầu xây dựng playlist của bạn"
                    />
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={items.map(item => item.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {items.map((item, index) => (
                                    <SortableItem
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        isEditMode={isEditMode}
                                        onPlay={handlePlaySong}
                                        onRemove={handleRemoveSong}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
}
