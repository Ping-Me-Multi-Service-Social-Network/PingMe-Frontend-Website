import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useState } from "react";

interface MessageFileProps {
  src: string;
  fileName: string;
  isSent?: boolean;
}

export default function MessageFile({
  src,
  fileName,
  isSent = false,
}: MessageFileProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = src;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  const bgColor = isSent
    ? "bg-blue-100 dark:bg-blue-900/30"
    : "bg-gray-100 dark:bg-gray-800";
  const textColor = isSent
    ? "text-blue-900 dark:text-blue-100"
    : "text-gray-900 dark:text-white";
  const subtextColor = isSent
    ? "text-blue-700 dark:text-blue-300"
    : "text-gray-600 dark:text-gray-400";

  return (
    <div
      className={`flex items-center gap-3 p-4 ${bgColor} rounded-lg max-w-md shadow-md`}
    >
      <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
        <FileText className="w-6 h-6 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${textColor} truncate`}>
          {fileName}
        </p>
        <p className={`text-xs ${subtextColor} mt-0.5`}>
          {isDownloading && (
            <span className="text-red-500">• Đang tải xuống</span>
          )}
        </p>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleDownload}
          disabled={isDownloading}
          className={`h-8 w-8 ${
            isSent
              ? "text-blue-700 hover:text-blue-900 hover:bg-blue-200"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
          } dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700`}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
