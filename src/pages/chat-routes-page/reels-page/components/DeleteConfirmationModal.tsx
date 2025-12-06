"use client";

import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  isLoading = false,
  onConfirm,
  onCancel,
  title = "Xóa bình luận?",
  message = "Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.",
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            disabled={isLoading}
            className="h-10 w-10 rounded-full hover:bg-white/80 transition-all hover:rotate-90"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-base text-gray-700 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end bg-gray-50">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 h-11 rounded-full border-2 hover:bg-white font-semibold"
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 h-11 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-full shadow-md hover:shadow-lg transition-all font-semibold"
          >
            {isLoading ? "Đang xóa..." : "Xóa"}
          </Button>
        </div>
      </div>
    </div>
  );
}