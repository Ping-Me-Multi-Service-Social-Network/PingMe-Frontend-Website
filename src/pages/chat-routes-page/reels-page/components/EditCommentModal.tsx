"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

interface EditCommentModalProps {
  isOpen: boolean
  isLoading?: boolean
  onConfirm: (content: string) => void
  onCancel: () => void
  initialContent?: string
}

export default function EditCommentModal({
  isOpen,
  isLoading = false,
  onConfirm,
  onCancel,
  initialContent = "",
}: EditCommentModalProps) {
  const [content, setContent] = useState(initialContent)

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent)
    }
  }, [isOpen, initialContent])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Chỉnh sửa bình luận</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            disabled={isLoading}
            className="h-8 w-8 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <Input
            type="text"
            placeholder="Chỉnh sửa bình luận của bạn..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
            maxLength={500}
            className="text-base"
          />
          <p className="text-sm text-gray-500 mt-2">{content.length}/500 ký tự</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isLoading} className="px-6 h-10 bg-transparent">
            Hủy
          </Button>
          <Button
            onClick={() => onConfirm(content)}
            disabled={isLoading || !content.trim()}
            className="px-6 h-10 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </div>
    </div>
  )
}
