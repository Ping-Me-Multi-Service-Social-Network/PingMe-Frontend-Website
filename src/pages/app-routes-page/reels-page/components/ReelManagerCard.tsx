import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import type { Reel } from "@/types/reels";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

interface ReelManagerCardProps {
    reel: Reel;
    onEdit: (reel: Reel) => void;
    onDelete: (reelId: number) => void;
}

export function ReelManagerCard({ reel, onEdit, onDelete }: Readonly<ReelManagerCardProps>) {
    const { t, i18n } = useTranslation("reels");
    const dateLocale = i18n.language === "vi" ? vi : enUS;

    return (
        <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition group">
            {/* Video Thumbnail */}
            <div className="flex-shrink-0 w-24 h-24 bg-gray-900 rounded-lg overflow-hidden">
                <video
                    src={reel.videoUrl}
                    className="w-full h-full object-cover"
                    onMouseEnter={(e) => {
                        const video = e.target as HTMLVideoElement;
                        video.play();
                    }}
                    onMouseLeave={(e) => {
                        const video = e.target as HTMLVideoElement;
                        video.pause();
                        video.currentTime = 0;
                    }}
                >
                    <track kind="captions" />
                </video>
            </div>

            {/* Video Info */}
            <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">
                    {reel.caption || t("manage.untitled")}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                    {t("manage.stats.views")}{" "}
                    <span className="font-semibold">{reel.viewCount}</span>
                </p>
                <p className="text-sm text-gray-400">
                    {t("manage.stats.likes")}{" "}
                    <span className="font-semibold">{reel.likeCount}</span> •
                    {t("manage.stats.comments")}{" "}
                    <span className="font-semibold">{reel.commentCount}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(reel.createdAt), {
                        addSuffix: true,
                        locale: dateLocale,
                    })}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500/20 bg-transparent"
                    onClick={() => onEdit(reel)}
                >
                    <Edit2 className="w-4 h-4 mr-1" />
                    {t("comments.edit")}
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-400 hover:bg-red-500/20 bg-transparent"
                    onClick={() => onDelete(reel.id)}
                >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {t("comments.delete")}
                </Button>
            </div>
        </div>
    );
}
