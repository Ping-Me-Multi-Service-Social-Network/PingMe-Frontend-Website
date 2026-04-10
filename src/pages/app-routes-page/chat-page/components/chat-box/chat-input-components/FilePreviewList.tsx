import type React from "react";
import { X, FileText, Video } from "lucide-react";

interface FilePreview {
  file: File;
  type: "IMAGE" | "VIDEO" | "FILE";
  previewUrl?: string;
}

interface FilePreviewListProps {
  theme: any;
  selectedFiles: FilePreview[];
  isSending: boolean;
  onRemoveFile: (index: number) => void;
}

export function FilePreviewList({
  theme,
  selectedFiles,
  isSending,
  onRemoveFile,
}: FilePreviewListProps) {
  if (selectedFiles.length === 0) return null;

  const getFilePreviewKey = (filePreview: FilePreview) => {
    const { file, previewUrl, type } = filePreview;
    return `${type}-${file.name}-${file.size}-${file.lastModified}-${
      previewUrl ?? "no-preview"
    }`;
  };

  return (
    <div className="p-3 border-b bg-gray-50">
      <div className="flex flex-wrap gap-2">
        {selectedFiles.map((filePreview, index) => (
          <div key={getFilePreviewKey(filePreview)} className="relative group">
            {filePreview.type === "IMAGE" && filePreview.previewUrl ? (
              <div
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${theme.input.attachmentBorder}`}
              >
                <img
                  src={filePreview.previewUrl || "/placeholder.svg"}
                  alt={filePreview.file.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => onRemoveFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isSending}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : filePreview.type === "VIDEO" && filePreview.previewUrl ? (
              <div
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${theme.input.attachmentBorder}`}
              >
                <video
                  src={filePreview.previewUrl}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <button
                  onClick={() => onRemoveFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  disabled={isSending}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                className={`relative w-20 h-20 rounded-lg border-2 ${theme.input.attachmentBorder} bg-white flex flex-col items-center justify-center p-2`}
              >
                <FileText className="w-6 h-6 text-purple-600 mb-1" />
                <span className="text-xs text-gray-600 truncate w-full text-center">
                  {filePreview.file.name.length > 10
                    ? filePreview.file.name.substring(0, 10) + "..."
                    : filePreview.file.name}
                </span>
                <button
                  onClick={() => onRemoveFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isSending}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
