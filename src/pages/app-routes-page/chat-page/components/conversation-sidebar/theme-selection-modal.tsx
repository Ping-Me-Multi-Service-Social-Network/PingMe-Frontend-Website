import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { chatThemes } from "../../utils/chatThemes.ts";
import { changeTheme } from "@/services/chat";
import { toast } from "sonner";
import { useState } from "react";
import { Check } from "lucide-react";

interface ThemeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
  currentTheme: string | null;
}

const ThemeSelectionModal = ({
  isOpen,
  onClose,
  roomId,
  currentTheme,
}: ThemeSelectionModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || "DEFAULT");

  const handleSelectTheme = async (themeKey: string) => {
    setIsLoading(true);
    try {
      await changeTheme(roomId, themeKey);
      setSelectedTheme(themeKey);
      toast.success("Đã thay đổi chủ đề thành công");
      onClose();
    } catch (error) {
      console.error("Error changing theme:", error);
      toast.error("Không thể thay đổi chủ đề");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chọn chủ đề</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {Object.entries(chatThemes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => handleSelectTheme(key)}
              disabled={isLoading}
              className="w-full p-3 rounded-lg border-2 hover:border-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
              style={{
                borderColor: selectedTheme === key ? "#9333ea" : "#e5e7eb",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Theme preview */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                    <div className={`h-4 ${theme.header.background}`} />
                    <div className={`h-4 ${theme.content.background}`} />
                    <div className={`h-4 ${theme.input.background}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{theme.name}</p>
                    <p className="text-xs text-gray-500">{key}</p>
                  </div>
                </div>
                {selectedTheme === key && (
                  <Check className="h-5 w-5 text-purple-600" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeSelectionModal;
