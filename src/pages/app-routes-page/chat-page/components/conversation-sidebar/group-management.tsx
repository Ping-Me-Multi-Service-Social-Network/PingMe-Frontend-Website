import { ChevronLeft, Info, Copy, Share2, Lock, Ban, RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import type { GroupJoinRequestResponse, GroupSettingsResponse, RoomResponse } from "@/types/chat/room";
import { canManageGroup } from "../../utils/groupPermissions.ts";
import { useAppSelector } from "@/features/hooks.ts";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import {
  getGroupJoinRequestsApi,
  getGroupSettingsApi,
  regenerateGroupJoinLinkApi,
  reviewGroupJoinRequestApi,
  updateGroupSettingsApi,
} from "@/services/chat";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";

interface GroupManagementProps {
  room: RoomResponse;
  onBack: () => void;
  onSettingsChanged?: (settings: GroupSettingsResponse) => void;
}

const SectionHeader = ({ title }: { title: string }) => (
  <div className="px-4 py-3 bg-gray-50/50 text-[13px] font-semibold text-purple-900 border-t border-b border-gray-100 mt-2 first:mt-0 first:border-t-0">
    {title}
  </div>
);

interface SettingRowProps {
  label: string;
  checked: boolean;
  isInteractive: boolean;
  type?: "checkbox" | "switch";
  hasInfo?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}

const SettingRow = ({
  label,
  checked,
  isInteractive,
  type = "checkbox",
  hasInfo = false,
  onToggle,
  disabled = false,
}: SettingRowProps) => {
  const content = (
    <>
      <div className="flex items-center gap-2 flex-1 mr-4">
        <span
          className={`text-[14px] leading-tight ${
            isInteractive ? "text-gray-800" : "text-gray-500"
          }`}
        >
          {label}
        </span>
        {hasInfo && <Info className="w-4 h-4 text-gray-400 cursor-help" />}
      </div>

      {type === "checkbox" ? (
        <div
          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
            checked ? "bg-purple-600 border-purple-600" : "bg-white border-gray-300"
          }`}
        >
          {checked && (
            <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />
          )}
        </div>
      ) : (
        <div
          className={`w-10 h-5 rounded-full relative transition-colors ${
            checked ? "bg-purple-600" : "bg-gray-300"
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
              checked ? "left-5.5" : "left-0.5"
            }`}
            style={{ left: checked ? "22px" : "2px" }}
          />
        </div>
      )}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={() => {
          if (!disabled && onToggle) onToggle();
        }}
        disabled={disabled}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {content}
      </button>
    );
  }

  return <div className="flex items-center justify-between px-4 py-3 opacity-60 cursor-not-allowed">{content}</div>;
};

const GroupManagement = ({ room, onBack, onSettingsChanged }: GroupManagementProps) => {
  const { t } = useTranslation("chat");
  const { userSession } = useAppSelector((state) => state.auth);
  const currentUserId = Number(userSession?.id ?? 0);
  const isAdmin = useMemo(() => {
    if (canManageGroup(room, currentUserId)) return true;
    if (!userSession?.name) return false;
    const meByName = room.participants.find(
      (p) => p.name === userSession.name
    );
    return meByName?.role === "OWNER" || meByName?.role === "ADMIN";
  }, [room, currentUserId, userSession?.name]);
  const [settings, setSettings] = useState<GroupSettingsResponse | null>(null);
  const [pendingRequests, setPendingRequests] = useState<GroupJoinRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [pendingSettingKey, setPendingSettingKey] = useState<string | null>(null);

  const isBusy = isLoading || isMutating;

  const loadData = async () => {
    if (room.roomType !== "GROUP") return;
    setIsLoading(true);
    try {
      const settingsRes = await getGroupSettingsApi(room.roomId);
      setSettings(settingsRes.data.data);
      onSettingsChanged?.(settingsRes.data.data);

      if (isAdmin) {
        const reqRes = await getGroupJoinRequestsApi(room.roomId, "PENDING");
        setPendingRequests(reqRes.data.data ?? []);
      }
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          `${t("management.loadFailed", "Không tải được cài đặt nhóm")} (roomId=${room.roomId})`
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [room.roomId, room.roomType, isAdmin]);

  const toggleSetting = async (key: keyof Omit<GroupSettingsResponse, "roomId" | "joinLink">) => {
    if (!settings) return;
    if (pendingSettingKey) return;

    const previousValue = settings[key];
    const nextSettings = { ...settings, [key]: !previousValue };
    setPendingSettingKey(key);
    setSettings(nextSettings);
    onSettingsChanged?.(nextSettings);

    try {
      await updateGroupSettingsApi(room.roomId, {
        [key]: !previousValue,
      });
    } catch (err) {
      const rollbackSettings = { ...nextSettings, [key]: previousValue };
      setSettings(rollbackSettings);
      onSettingsChanged?.(rollbackSettings);
      toast.error(getErrorMessage(err, t("management.updateFailed", "Cập nhật cài đặt thất bại")));
    } finally {
      setPendingSettingKey(null);
    }
  };

  const handleRegenerateLink = async () => {
    setIsMutating(true);
    try {
      const response = await regenerateGroupJoinLinkApi(room.roomId);
      setSettings(response.data.data);
      onSettingsChanged?.(response.data.data);
      toast.success(t("management.linkRegenerated", "Đã tạo lại link nhóm"));
    } catch (err) {
      toast.error(getErrorMessage(err, t("management.regenerateFailed", "Không thể tạo lại link")));
    } finally {
      setIsMutating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!settings?.joinLink) return;
    try {
      await navigator.clipboard.writeText(settings.joinLink);
      toast.success(t("management.linkCopied", "Đã sao chép link nhóm"));
    } catch {
      toast.error(t("management.linkCopyFailed", "Không thể sao chép link"));
    }
  };

  const handleShareLink = async () => {
    if (!settings?.joinLink) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "PingMe Group", url: settings.joinLink });
        return;
      } catch {
        // ignore and fallback to copy
      }
    }
    await handleCopyLink();
  };

  const handleReviewRequest = async (requestId: number, approved: boolean) => {
    setIsMutating(true);
    try {
      await reviewGroupJoinRequestApi(room.roomId, requestId, approved);
      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
      toast.success(
        approved
          ? t("management.requestApproved", "Đã duyệt yêu cầu")
          : t("management.requestRejected", "Đã từ chối yêu cầu")
      );
    } catch (err) {
      toast.error(getErrorMessage(err, t("management.reviewFailed", "Xử lý yêu cầu thất bại")));
    } finally {
      setIsMutating(false);
    }
  };

  const joinLink = useMemo(() => settings?.joinLink ?? "", [settings?.joinLink]);
  const canInteract = isAdmin;


  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center px-2 py-3 border-b border-gray-100 shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 text-gray-600">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h2 className="flex-1 text-center text-[17px] font-bold text-slate-800 pr-10">{t("management.title")}</h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {!isAdmin && (
          <div className="bg-purple-50/80 px-4 py-2.5 flex items-center justify-center gap-2 border-b border-purple-100">
            <Lock className="w-4 h-4 text-purple-600" />
            <span className="text-[13px] font-medium text-purple-700">{t("management.adminOnly")}</span>
          </div>
        )}

        <SectionHeader title={t("management.memberPermissions")} />
        <SettingRow
          label={t("management.changeNameAvatar")}
          checked={Boolean(settings?.allowMemberEditGroupProfile)}
          isInteractive={canInteract}
          onToggle={() => void toggleSetting("allowMemberEditGroupProfile")}
          disabled={pendingSettingKey !== null}
        />
        <SettingRow
          label={t("management.pinMessages")}
          checked={Boolean(settings?.allowMemberPinMessage)}
          isInteractive={canInteract}
          onToggle={() => void toggleSetting("allowMemberPinMessage")}
          disabled={pendingSettingKey !== null}
        />
        <SettingRow label={t("management.createNotes")} checked={false} isInteractive={false} />
        <SettingRow
          label={t("management.createPolls")}
          checked={Boolean(settings?.allowMemberCreatePoll)}
          isInteractive={canInteract}
          onToggle={() => void toggleSetting("allowMemberCreatePoll")}
          disabled={pendingSettingKey !== null}
        />
        <SettingRow
          label={t("management.sendMessages")}
          checked={Boolean(settings?.allowMemberSendMessage)}
          isInteractive={canInteract}
          onToggle={() => void toggleSetting("allowMemberSendMessage")}
          disabled={pendingSettingKey !== null}
        />

        <div className="h-2 bg-gray-100" />

        <SettingRow
          label={t("management.approvalMode")}
          checked={Boolean(settings?.joinApprovalEnabled)}
          type="switch"
          hasInfo={true}
          isInteractive={canInteract}
          onToggle={() => void toggleSetting("joinApprovalEnabled")}
          disabled={pendingSettingKey !== null}
        />
        <div className="mx-4 border-t border-gray-100" />
        <SettingRow
          label={t("management.highlightAdmins")}
          checked={Boolean(settings?.highlightAdminMessageOnly)}
          type="switch"
          hasInfo={true}
          isInteractive={canInteract}
          onToggle={() => void toggleSetting("highlightAdminMessageOnly")}
          disabled={pendingSettingKey !== null}
        />
        <div className="mx-4 border-t border-gray-100" />
        <SettingRow
          label={t("management.readRecentMessages")}
          checked={Boolean(settings?.allowNewMemberReadRecent)}
          type="switch"
          hasInfo={true}
          isInteractive={canInteract}
          onToggle={() => void toggleSetting("allowNewMemberReadRecent")}
          disabled={pendingSettingKey !== null}
        />
        <div className="mx-4 border-t border-gray-100" />
        <SettingRow
          label={t("management.useGroupLink")}
          checked={Boolean(settings?.joinLinkEnabled)}
          type="switch"
          hasInfo={true}
          isInteractive={canInteract}
          onToggle={() => void toggleSetting("joinLinkEnabled")}
          disabled={pendingSettingKey !== null}
        />        {Boolean(settings?.joinLinkEnabled) && (
          <div className="px-4 py-3">
            <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3 flex items-center gap-3">
              <span className="text-[13px] text-purple-700 font-medium flex-1 truncate">
                {joinLink}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-purple-600 hover:bg-purple-100"
                  onClick={() => void handleCopyLink()}
                  disabled={!joinLink}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-purple-600 hover:bg-purple-100"
                  onClick={() => void handleShareLink()}
                  disabled={!joinLink}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                {canInteract && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-purple-600 hover:bg-purple-100"
                    onClick={() => void handleRegenerateLink()}
                    disabled={isBusy}
                  >
                    <RefreshCw className={`w-4 h-4 ${isBusy ? "animate-spin" : ""}`} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {isAdmin && (          <>
            <div className="h-2 bg-gray-100" />
            <SectionHeader title={t("management.joinRequests", "Yêu cầu vào nhóm")} />
            <div className="px-4 py-3 space-y-2">
              {pendingRequests.length === 0 ? (
                <p className="text-sm text-gray-500">
                  {t("management.noPendingRequests", "Không có yêu cầu chờ duyệt")}
                </p>
              ) : (
                pendingRequests.map((req) => (
                  <div key={req.id} className="rounded-lg border border-gray-200 px-3 py-2">
                    <div className="text-sm font-medium text-gray-800">{req.requesterName}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(req.createdAt).toLocaleString()}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        className="h-8 px-2 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => void handleReviewRequest(req.id, true)}
                        disabled={isMutating}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        {t("management.approve", "Duyệt")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2"
                        onClick={() => void handleReviewRequest(req.id, false)}
                        disabled={isMutating}
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        {t("management.reject", "Từ chối")}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <div className="h-2 bg-gray-100" />

        <button type="button" className="w-full px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <Ban className="w-4 h-4 text-gray-600" />
          </div>
          <span className="text-[15px] font-medium text-gray-700">{t("management.blockFromGroup")}</span>
        </button>
      </div>
    </div>
  );
};

export default GroupManagement;



