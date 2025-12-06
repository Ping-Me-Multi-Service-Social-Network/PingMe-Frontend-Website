import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Hash } from "lucide-react";
import { reelsApi } from "@/services/reels";
import { toast } from "sonner";

interface CreateReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateReelModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateReelModalProps) {
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const suggestedHashtags = [
    "#viral",
    "#trending",
    "#fyp",
    "#foryou",
    "#love",
    "#funny",
    "#music",
    "#dance",
    "#food",
    "#travel",
    "#fashion",
    "#beauty",
    "#fitness",
    "#gaming",
    "#art",
    "#photography",
  ];

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const preview = URL.createObjectURL(file);
      setVideoPreview(preview);
    }
  };

  const handleAddHashtag = () => {
    const trimmed = hashtagInput.trim();
    if (!trimmed) return;

    // Ensure hashtag starts with #
    const hashtag = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;

    // Check if hashtag already exists
    if (hashtags.includes(hashtag.toLowerCase())) {
      toast.error("Hashtag đã tồn tại");
      return;
    }

    // Validate hashtag format (only alphanumeric and underscore after #)
    if (!/^#[a-zA-Z0-9_]+$/.test(hashtag)) {
      toast.error("Hashtag chỉ được chứa chữ cái, số và dấu gạch dưới");
      return;
    }

    setHashtags([...hashtags, hashtag]);
    setHashtagInput("");
  };

  const handleRemoveHashtag = (hashtag: string) => {
    setHashtags(hashtags.filter((h) => h !== hashtag));
  };

  const handleSuggestedHashtagClick = (hashtag: string) => {
    if (hashtags.includes(hashtag)) {
      handleRemoveHashtag(hashtag);
    } else {
      setHashtags([...hashtags, hashtag]);
    }
  };

  const handleHashtagInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddHashtag();
    }
  };

  const handleSubmit = async () => {
    if (!videoFile || !caption.trim()) {
      toast.error("Vui lòng chọn video và thêm caption");
      return;
    }

    if (hashtags.length === 0) {
      toast.error("Vui lòng thêm ít nhất một hashtag");
      return;
    }

    setIsLoading(true);
    try {
      // Combine caption with hashtags
      const fullCaption = `${caption.trim()} ${hashtags.join(" ")}`;

      await reelsApi.createReel({
        video: videoFile,
        caption: fullCaption,
      });
      toast.success("Tạo reel thành công");
      setCaption("");
      setHashtags([]);
      setHashtagInput("");
      setVideoFile(null);
      setVideoPreview("");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.log("[PingMe] Create reel error:", error);
      toast.error("Không thể tạo reel");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Tạo Reel Mới</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Video Upload */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition"
            onClick={() => videoInputRef.current?.click()}
          >
            {videoPreview ? (
              <div className="space-y-2">
                <video
                  src={videoPreview}
                  className="w-full h-40 object-cover rounded-md"
                  controls
                />
                <p className="text-sm text-gray-600">Nhấp để thay đổi video</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <p className="text-gray-600">Kéo thả video hoặc nhấp để chọn</p>
                <p className="text-sm text-gray-500">MP4, WebM (tối đa 20MB)</p>
              </div>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
            />
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Viết caption cho reel của bạn..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={4}
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">{caption.length}/300</p>
          </div>

          {/* Hashtag Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Hashtags
              <span className="text-red-500">*</span>
            </label>

            {/* Selected Hashtags */}
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveHashtag(tag)}
                      className="hover:text-purple-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Hashtag Input Field */}
            <div className="flex gap-2">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={handleHashtagInputKeyDown}
                placeholder="Nhập hashtag (vd: viral hoặc #viral)"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Button
                type="button"
                onClick={handleAddHashtag}
                variant="outline"
                size="sm"
                className="px-4 bg-transparent"
              >
                Thêm
              </Button>
            </div>

            {/* Suggested Hashtags */}
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-2">Hashtags phổ biến:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedHashtags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleSuggestedHashtagClick(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      hashtags.includes(tag)
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-transparent"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !videoFile}
              className="flex-1"
            >
              {isLoading ? "Đang tải lên..." : "Tạo Reel"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
