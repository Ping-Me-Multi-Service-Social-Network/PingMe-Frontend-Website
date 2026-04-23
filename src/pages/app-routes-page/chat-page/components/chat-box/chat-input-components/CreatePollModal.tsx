import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { X, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (question: string, options: string[], allowMultiple: boolean) => void;
}

export function CreatePollModal({ isOpen, onClose, onSubmit }: CreatePollModalProps) {
  const { t } = useTranslation("chat");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);

  // Reset state when opened
  React.useEffect(() => {
    if (isOpen) {
      setQuestion("");
      setOptions(["", ""]);
      setAllowMultiple(false);
    }
  }, [isOpen]);

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    const trimmedQuestion = question.trim();
    const trimmedOptions = options.map(o => o.trim()).filter(o => o !== "");

    // Validations
    if (!trimmedQuestion) {
      // Could show toast or local error
      return;
    }
    if (trimmedOptions.length < 2) {
      return;
    }
    // Check duplicates (case-insensitive)
    const lowerOptions = trimmedOptions.map(o => o.toLowerCase());
    const uniqueOptions = new Set(lowerOptions);
    if (uniqueOptions.size !== trimmedOptions.length) {
      // Duplicate found
      return;
    }

    onSubmit(trimmedQuestion, trimmedOptions, allowMultiple);
  };

  const isSubmitDisabled = () => {
    if (!question.trim()) return true;
    const trimmedOptions = options.map(o => o.trim()).filter(o => o !== "");
    if (trimmedOptions.length < 2) return true;
    const uniqueOptions = new Set(trimmedOptions.map(o => o.toLowerCase()));
    if (uniqueOptions.size !== trimmedOptions.length) return true;
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("input.createPoll", "Create Poll")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("input.pollQuestion", "Question")}</label>
            <Input
              placeholder={t("input.pollQuestionPlaceholder", "Ask a question...")}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("input.pollOptions", "Options")}</label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`${t("input.pollOption", "Option")} ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-gray-400 hover:text-red-500"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {options.length < 10 && (
              <Button
                variant="outline"
                className="w-full mt-2 border-dashed"
                onClick={handleAddOption}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("input.addPollOption", "Add Option")}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="allowMultiple"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="allowMultiple" className="text-sm cursor-pointer select-none">
              {t("input.allowMultipleVotes", "Allow multiple answers")}
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            {t("input.cancel", "Cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled()}>
            {t("input.create", "Create")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
