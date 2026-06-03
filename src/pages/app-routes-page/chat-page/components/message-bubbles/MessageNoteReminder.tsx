import type { MessageResponse } from "@/types/chat/message";
import { Bell, CheckCircle2, Clock, StickyNote } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MessageNoteReminderProps {
  message: MessageResponse;
  isSent: boolean;
}

export function MessageNoteReminder({ message, isSent }: MessageNoteReminderProps) {
  const { t } = useTranslation("chat");
  const isReminder = message.type === "REMINDER";
  const note = message.note;
  const reminder = message.reminder;
  const title = isReminder ? reminder?.title ?? message.content : note?.title ?? message.content;
  const body = isReminder ? reminder?.body : note?.body;

  const remindAt = reminder?.remindAt ? new Date(reminder.remindAt) : null;
  const status = reminder?.status ?? "PENDING";
  const accent = isReminder ? "text-amber-600 bg-amber-50 border-amber-200" : "text-violet-600 bg-violet-50 border-violet-200";
  const iconWrap = isReminder ? "bg-amber-100 text-amber-700" : "bg-violet-100 text-violet-700";

  return (
    <div className={`min-w-[240px] max-w-sm rounded-xl border p-3 shadow-sm ${accent} ${isSent ? "text-slate-800" : ""}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconWrap}`}>
          {isReminder ? <Bell className="h-5 w-5" /> : <StickyNote className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
            {isReminder ? t("bubbles.reminder.label", "Reminder") : t("bubbles.note.label", "Note")}
          </div>
          <div className="mt-0.5 break-words text-sm font-semibold text-slate-900">
            {title}
          </div>
          {body ? (
            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
              {body}
            </p>
          ) : null}
          {isReminder && remindAt ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-1">
                <Clock className="h-3.5 w-3.5" />
                {remindAt.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t(`bubbles.reminder.status.${status}`, status)}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
