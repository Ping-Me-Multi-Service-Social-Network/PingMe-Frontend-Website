import { useState, useRef, useCallback } from "react";

interface ChatInputProps {
  onSend: (prompt: string, files: File[]) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml", "image/bmp"];

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-resize
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const validateAndAddFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setError(null);
      const validFiles: File[] = [];
      const validPreviews: string[] = [];

      for (const file of Array.from(newFiles)) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError(`"${file.name}" không phải file ảnh hợp lệ.`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          setError(`"${file.name}" vượt quá 5MB.`);
          continue;
        }
        validFiles.push(file);
        validPreviews.push(URL.createObjectURL(file));
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
        setPreviews((prev) => [...prev, ...validPreviews]);
      }
    },
    []
  );

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
      e.target.value = ""; // reset so same file can be re-selected
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && files.length === 0) return;
    if (disabled) return;

    onSend(trimmed, files);
    setText("");
    setFiles([]);
    // Revoke preview URLs
    previews.forEach((p) => URL.revokeObjectURL(p));
    setPreviews([]);
    setError(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const canSend = (text.trim().length > 0 || files.length > 0) && !disabled;

  return (
    <div className="w-full">
      {/* Error message */}
      {error && (
        <div className="mb-2 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      {/* Image previews */}
      {previews.length > 0 && (
        <div className="img-preview-grid mb-2">
          {previews.map((src, idx) => (
            <div key={idx} className="img-preview-item">
              <img src={src} alt={`preview-${idx}`} />
              <button className="img-preview-remove" onClick={() => removeFile(idx)}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
        {/* Attach button */}
        <button
          type="button"
          onClick={handleFileSelect}
          className="p-2 text-gray-400 hover:text-violet-500 hover:bg-violet-50 rounded-xl transition-colors flex-shrink-0"
          title="Đính kèm ảnh (≤5MB)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          rows={1}
          className="chat-textarea flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 py-1.5 leading-relaxed"
          disabled={disabled}
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={`p-2 rounded-xl transition-all flex-shrink-0 ${
            canSend
              ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md hover:shadow-lg send-btn-active"
              : "bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
