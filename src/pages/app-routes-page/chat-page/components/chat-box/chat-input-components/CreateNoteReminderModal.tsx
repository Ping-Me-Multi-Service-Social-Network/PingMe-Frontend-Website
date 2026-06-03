import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Calendar, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export type NoteReminderSubmitPayload =
  | { type: "NOTE"; body: string; pinToTop: boolean }
  | { type: "REMINDER"; body: string; remindAt: string; timezone: string; repeatRule: string };

interface CreateNoteReminderModalProps {
  isOpen: boolean;
  mode: "NOTE" | "REMINDER";
  onClose: () => void;
  onSubmit: (payload: NoteReminderSubmitPayload) => void | Promise<void>;
}

type QuickReminderOption =
  | { label: string; minutes: number }
  | { label: string; tomorrowAtHour: number };

const quickOptions: QuickReminderOption[] = [
  { label: "15 phút nữa", minutes: 15 },
  { label: "30 phút nữa", minutes: 30 },
  { label: "9:00 ngày mai", tomorrowAtHour: 9 },
];

function toDateTimeLocalValue(date: Date) {
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatReminderDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CreateNoteReminderModal({ isOpen, mode, onClose, onSubmit }: Readonly<CreateNoteReminderModalProps>) {
  const { t } = useTranslation("chat");
  const [body, setBody] = useState("");
  const [pinToTop, setPinToTop] = useState(false);
  const [remindAt, setRemindAt] = useState("");
  const [repeatRule, setRepeatRule] = useState("NONE");
  const [selectedQuickIndex, setSelectedQuickIndex] = useState(1);
  const reminderDateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setBody("");
    setPinToTop(false);
    setRepeatRule("NONE");
    setSelectedQuickIndex(1);
    setRemindAt(toDateTimeLocalValue(new Date(Date.now() + 30 * 60 * 1000)));
  }, [isOpen, mode]);

  const timezone = useMemo(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  }, []);

  const isReminder = mode === "REMINDER";
  const canSubmit = body.trim().length > 0 && (!isReminder || new Date(remindAt).getTime() > Date.now());

  const applyQuickOption = (option: QuickReminderOption, index: number) => {
    const next = new Date();
    if ("minutes" in option) {
      next.setMinutes(next.getMinutes() + option.minutes);
    } else {
      next.setDate(next.getDate() + 1);
      next.setHours(option.tomorrowAtHour, 0, 0, 0);
    }
    setRemindAt(toDateTimeLocalValue(next));
    setSelectedQuickIndex(index);
  };

  const openReminderDatePicker = () => {
    const input = reminderDateInputRef.current;
    if (!input) return;
    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
    if (typeof pickerInput.showPicker === "function") {
      pickerInput.showPicker();
      return;
    }
    input.focus();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const trimmedBody = body.trim();

    if (!isReminder) {
      void onSubmit({ type: "NOTE", body: trimmedBody, pinToTop });
      return;
    }

    void onSubmit({
      type: "REMINDER",
      body: trimmedBody,
      remindAt,
      timezone,
      repeatRule,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-gray-200 bg-white p-0 text-slate-900 shadow-2xl sm:max-w-[560px] [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-gray-100 px-4 py-4">
          <DialogTitle className="text-xl font-semibold text-slate-800">
            {isReminder ? t("input.createReminder", "Tạo nhắc hẹn") : t("input.createNote", "Tạo ghi chú")}
          </DialogTitle>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
            <X className="h-7 w-7" />
          </button>
        </DialogHeader>

        <div className="space-y-5 px-4 py-5">
          <div className="space-y-2">
            <label className="text-lg font-semibold text-slate-700">
              {isReminder ? t("input.enterContent", "Nhập nội dung") : t("input.content", "Nội dung")}
            </label>
            <Textarea
              maxLength={2000}
              rows={7}
              placeholder={t("input.noteReminderPlaceholder", "Nhập nội dung mới hoặc dán link")}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="min-h-[190px] resize-none rounded border-purple-300 bg-white text-lg text-slate-900 placeholder:text-slate-400 focus-visible:border-purple-500 focus-visible:ring-purple-500"
            />
          </div>

          {isReminder ? (
            <>
              <div className="space-y-3">
                <div className="text-lg font-semibold text-slate-700">{t("input.chooseTime", "Chọn thời gian")}</div>
                <div className="flex flex-wrap gap-3">
                  {quickOptions.map((option, index) => (
                    <button
                      type="button"
                      key={option.label}
                      onClick={() => applyQuickOption(option, index)}
                      className={`rounded-full px-4 py-2 text-base font-semibold transition-colors ${
                        selectedQuickIndex === index ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedQuickIndex(-1);
                      openReminderDatePicker();
                    }}
                    className={`rounded-full px-4 py-2 text-base font-semibold transition-colors ${
                      selectedQuickIndex === -1 ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {t("input.other", "Khác")}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-lg font-semibold text-slate-700">{t("input.reminderDate", "Chọn ngày nhắc hẹn")}</label>
                <div className="relative">
                  <Input
                    ref={reminderDateInputRef}
                    id="reminder-date-input"
                    type="datetime-local"
                    value={remindAt}
                    onChange={(event) => {
                      setRemindAt(event.target.value);
                      setSelectedQuickIndex(-1);
                    }}
                    className="h-12 rounded border-slate-300 bg-white pr-14 text-base text-slate-900 focus-visible:border-purple-500 focus-visible:ring-purple-500 [&::-webkit-calendar-picker-indicator]:opacity-0"
                  />
                  <button
                    type="button"
                    onClick={openReminderDatePicker}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-purple-600"
                    aria-label={t("input.openDatePicker", "Mở lịch")}
                  >
                    <Calendar className="h-6 w-6" />
                  </button>
                </div>
                <div className="text-xs text-slate-500">{formatReminderDate(remindAt)}</div>
              </div>

              <div className="space-y-2">
                <label className="text-lg font-semibold text-slate-700">
                  {t("input.repeatRule", "Chọn kiểu lặp lại (vd. Lặp lại hằng tuần)")}
                </label>
                <select
                  value={repeatRule}
                  onChange={(event) => setRepeatRule(event.target.value)}
                  className="h-12 w-full rounded border border-slate-300 bg-white px-4 text-base font-medium text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25"
                >
                  <option value="NONE">{t("input.repeatNone", "Không lặp lại")}</option>
                  <option value="DAILY">{t("input.repeatDaily", "Hằng ngày")}</option>
                  <option value="WEEKLY">{t("input.repeatWeekly", "Hằng tuần")}</option>
                  <option value="MONTHLY">{t("input.repeatMonthly", "Hằng tháng")}</option>
                </select>
              </div>
            </>
          ) : (
            <label className="flex items-center gap-3 text-lg font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={pinToTop}
                onChange={(event) => setPinToTop(event.target.checked)}
                className="h-5 w-5 rounded border-slate-300 bg-white accent-purple-600"
              />
              {t("input.pinToTop", "Ghim lên đầu trò chuyện")}
            </label>
          )}
        </div>

        <div className="flex justify-end gap-4 px-4 pb-4">
          <Button variant="secondary" onClick={onClose} className="h-12 bg-slate-100 px-6 text-lg font-semibold text-slate-700 hover:bg-slate-200">
            {t("input.cancel", "Hủy")}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} className="h-12 bg-purple-600 px-6 text-lg font-semibold text-white hover:bg-purple-700 disabled:opacity-60">
            {isReminder ? t("input.createReminder", "Tạo nhắc hẹn") : t("input.createNote", "Tạo ghi chú")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
