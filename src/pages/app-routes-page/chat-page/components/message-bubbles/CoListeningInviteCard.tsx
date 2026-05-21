import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Link as LinkIcon, UsersRound } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/features/hooks";
import { joinSessionStart } from "@/features/music/musicSessionSlice";
import { formatDateTimeVi } from "@/utils/dateTime";
import { fnv1a32Hex } from "@/utils/hash";
import { decodeJwtPayload } from "@/utils/jwt";
import {
  parseCoListeningInvite as parseCoListeningInviteUtil,
  type CoListeningInviteInfo,
} from "@/utils/coListeningInvite";

export function parseCoListeningInvite(text: string): CoListeningInviteInfo | null {
  return parseCoListeningInviteUtil(text);
}

type JoinErrorNormalized =
  | { kind: "expired" }
  | { kind: "forbidden" }
  | { kind: "raw"; message: string };

function normalizeJoinError(raw: string | null): JoinErrorNormalized | null {
  // Keep the matching rules stable; only the displayed text is translated.
  if (!raw) return null;

  const s = raw.toLowerCase();
  if (s.includes("expired") || (s.includes("token") && s.includes("expire"))) {
    return { kind: "expired" };
  }

  if (s.includes("403") || s.includes("forbidden")) {
    return { kind: "forbidden" };
  }

  return { kind: "raw", message: raw };
}

function getAttemptKey(hostUserId: string, token: string) {
  return `${hostUserId}:${token}`;
}

function getPendingJoinNote(params: {
  currentUserId: string | null;
  isConnected: boolean;
  activeHostUserId: string | null;
  inviteHostUserId: string;
  t: ReturnType<typeof useTranslation>["t"];
}): string | null {
  const { currentUserId, isConnected, activeHostUserId, inviteHostUserId, t } = params;

  if (!currentUserId) {
    return t("bubbles.coListeningInvite.noteLoginRequired", "Ban can dang nhap de tham gia phien nghe chung.");
  }

  if (isConnected && activeHostUserId === inviteHostUserId) {
    return t(
      "bubbles.coListeningInvite.noteAlreadyInRoom",
      "Ban dang o trong phong nghe chung nay roi. (Token chi can luc tham gia lan dau; neu dang o trong phong thi token het han khong anh huong)"
    );
  }

  return null;
}

function getJoinProgressNote(params: {
  isConnected: boolean;
  activeHostUserId: string | null;
  inviteHostUserId: string;
  t: ReturnType<typeof useTranslation>["t"];
}): string {
  const { isConnected, activeHostUserId, inviteHostUserId, t } = params;
  if (isConnected && activeHostUserId && activeHostUserId !== inviteHostUserId) {
    return t("bubbles.coListeningInvite.noteSwitching", "Dang chuyen tu phong host {{from}} sang host {{to}}...", {
      from: activeHostUserId,
      to: inviteHostUserId,
    });
  }
  return t("bubbles.coListeningInvite.noteJoining", "Dang tham gia phien nghe chung...");
}

function resolveJoinAttemptNote(params: {
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  t: ReturnType<typeof useTranslation>["t"];
}): string | null {
  const { isConnecting, isConnected, error, t } = params;
  if (isConnecting) {
    return t("bubbles.coListeningInvite.noteJoining", "Dang tham gia phien nghe chung...");
  }
  if (isConnected) {
    return t(
      "bubbles.coListeningInvite.noteJoined",
      'Da tham gia. Mo tab "Nghe chung" de bat dau dong bo. (Token het han khong anh huong khi ban dang o trong phong)'
    );
  }

  const normalized = normalizeJoinError(error);
  if (!normalized) return null;
  if (normalized.kind === "expired" || normalized.kind === "forbidden") {
    return t("bubbles.coListeningInvite.noteExpired", "Link moi da het han. Hay nho host tao link moi.");
  }
  return normalized.message;
}

function getLocalNoteTone(params: {
  isThisInviteActive: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
}): string {
  const { isThisInviteActive, isConnecting, isConnected, error } = params;
  if (isThisInviteActive && !isConnecting && !isConnected && error) {
    return "border-red-200 bg-red-50 text-red-700";
  }
  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

function handleJoinInvite(params: {
  inviteHostUserId: string | null;
  inviteToken: string | null;
  isExpired: boolean | null;
  currentUserId: string | null;
  isConnected: boolean;
  activeHostUserId: string | null;
  t: ReturnType<typeof useTranslation>["t"];
  setLocalNote: (note: string | null) => void;
  attemptedRef: MutableRefObject<boolean>;
  attemptKeyRef: MutableRefObject<string | null>;
  dispatch: ReturnType<typeof useAppDispatch>;
}): void {
  const {
    inviteHostUserId,
    inviteToken,
    isExpired,
    currentUserId,
    isConnected,
    activeHostUserId,
    t,
    setLocalNote,
    attemptedRef,
    attemptKeyRef,
    dispatch,
  } = params;

  if (!inviteHostUserId || !inviteToken) return;

  if (isExpired === true) {
    setLocalNote(t("bubbles.coListeningInvite.noteExpired", "Link moi da het han. Hay nho host tao link moi."));
    return;
  }

  const blockedNote = getPendingJoinNote({
    currentUserId,
    isConnected,
    activeHostUserId,
    inviteHostUserId,
    t,
  });
  if (blockedNote) {
    setLocalNote(blockedNote);
    return;
  }
  if (!currentUserId) return;

  setLocalNote(
    getJoinProgressNote({
      isConnected,
      activeHostUserId,
      inviteHostUserId,
      t,
    })
  );

  attemptedRef.current = true;
  attemptKeyRef.current = getAttemptKey(inviteHostUserId, inviteToken);
  dispatch(
    joinSessionStart({
      hostUserId: inviteHostUserId,
      currentUserId,
      sessionToken: inviteToken,
    })
  );
}

export default function CoListeningInviteCard({ text }: Readonly<{ text: string }>) {
  const { t } = useTranslation("chat");
  const dispatch = useAppDispatch();
  const invite = useMemo(() => parseCoListeningInviteUtil(text), [text]);

  const jwtPayload = useMemo(
    () => (invite?.token ? decodeJwtPayload(invite.token) : null),
    [invite?.token]
  );

  const expiresAt = useMemo(() => {
    const exp = jwtPayload?.exp;
    if (typeof exp !== "number") return null;
    const d = new Date(exp * 1000);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }, [jwtPayload]);

  const linkJti = useMemo(() => {
    const jti = jwtPayload?.jti;
    return typeof jti === "string" && jti.trim() ? jti : null;
  }, [jwtPayload]);

  const linkCode = useMemo(() => {
    if (!invite?.token) return null;
    // Prefer server-provided unique id when present.
    if (linkJti) return `#${linkJti.slice(0, 10)}`;
    return `#${fnv1a32Hex(invite.token)}`;
  }, [invite?.token, linkJti]);

  const expiresAtText = useMemo(() => (expiresAt ? formatDateTimeVi(expiresAt) : null), [expiresAt]);
  const isExpired = useMemo(() => (expiresAt ? Date.now() >= expiresAt.getTime() : null), [expiresAt]);

  const remainingText = useMemo(() => {
    if (!expiresAt) return null;

    const ms = expiresAt.getTime() - Date.now();
    if (ms <= 0) {
      return t("bubbles.coListeningInvite.remainingExpired", "Da het han");
    }

    const mins = Math.ceil(ms / 60000);
    if (mins <= 60) {
      return t("bubbles.coListeningInvite.remainingMinutes", "Con {{mins}} phut", { mins });
    }

    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem
      ? t("bubbles.coListeningInvite.remainingHoursMinutes", "Con {{hours}} gio {{mins}} phut", {
          hours,
          mins: rem,
        })
      : t("bubbles.coListeningInvite.remainingHours", "Con {{hours}} gio", { hours });
  }, [expiresAt, t]);

  const currentUserId = useAppSelector((state) => state.auth.userSession?.id?.toString() ?? null);
  const activeHostUserId = useAppSelector((state) => state.musicSession.activeHostUserId);
  const isConnecting = useAppSelector((state) => state.musicSession.isConnecting);
  const isConnected = useAppSelector((state) => state.musicSession.isConnected);
  const error = useAppSelector((state) => state.musicSession.error);

  const isThisInviteActive = !!invite?.hostUserId && activeHostUserId === invite.hostUserId;

  const [localNote, setLocalNote] = useState<string | null>(null);
  const attemptedRef = useRef(false);
  const attemptKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!invite?.hostUserId) return;
    if (!attemptedRef.current) return;
    if (!isThisInviteActive) return;

    // Only show the error on the card that initiated this attempt.
    const attemptKey = getAttemptKey(invite.hostUserId, invite.token ?? "");
    if (attemptKeyRef.current !== attemptKey) return;

    const note = resolveJoinAttemptNote({ isConnecting, isConnected, error, t });
    if (!note) return;
    setLocalNote(note);
  }, [error, invite?.hostUserId, invite?.token, isConnected, isConnecting, isThisInviteActive, t]);

  if (!invite) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-zinc-100 bg-gradient-to-r from-purple-50 to-white px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/10 text-purple-700">
          <UsersRound className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900">
            {t("bubbles.coListeningInvite.title", "Moi tham gia nghe chung")}
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            {invite.hostUserId
              ? t("bubbles.coListeningInvite.host", "Host: {{hostUserId}}", { hostUserId: invite.hostUserId })
              : t("bubbles.coListeningInvite.sessionFallback", "Co-listening session")}
          </div>

          {linkCode || expiresAtText ? (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
              {linkCode ? (
                <span>{t("bubbles.coListeningInvite.link", "Link {{code}}", { code: linkCode })}</span>
              ) : null}
              {expiresAtText ? (
                <span>
                  {t("bubbles.coListeningInvite.expiresAt", "Het han: {{time}}", { time: expiresAtText })}
                </span>
              ) : null}
              {remainingText ? (
                <span
                  className={[
                    "rounded-full border px-2 py-0.5",
                    isExpired === true
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700",
                  ].join(" ")}
                >
                  {isExpired === true
                    ? t("bubbles.coListeningInvite.badgeExpired", "Het han")
                    : t("bubbles.coListeningInvite.badgeValid", "Con han")}
                  {remainingText ? ` • ${remainingText}` : ""}
                </span>
              ) : null}
            </div>
          ) : null}

          {localNote ? (
            <div
              className={[
                "mt-2 rounded-md border px-2.5 py-2 text-xs",
                getLocalNoteTone({ isThisInviteActive, isConnecting, isConnected, error }),
              ].join(" ")}
              role="alert"
            >
              {localNote}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Button
          size="sm"
          className="h-8 bg-purple-600 hover:bg-purple-500"
          disabled={!invite.hostUserId || !invite.token || isExpired === true || isConnecting}
          onClick={() =>
            handleJoinInvite({
              inviteHostUserId: invite.hostUserId,
              inviteToken: invite.token,
              isExpired,
              currentUserId,
              isConnected,
              activeHostUserId,
              t,
              setLocalNote,
              attemptedRef,
              attemptKeyRef,
              dispatch,
            })
          }
        >
          {t("bubbles.coListeningInvite.ctaJoin", "Tham gia")}
        </Button>

        <a
          href={invite.href}
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800"
          target="_blank"
          rel="noreferrer"
        >
          <LinkIcon className="h-3.5 w-3.5" />
          {t("bubbles.coListeningInvite.ctaOpenLink", "Mo link")}
        </a>
      </div>
    </div>
  );
}
