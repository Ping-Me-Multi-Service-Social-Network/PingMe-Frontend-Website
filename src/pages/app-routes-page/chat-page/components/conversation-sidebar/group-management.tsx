import { ChevronLeft, Info, Copy, Share2, Lock, Ban } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import type { RoomResponse } from "@/types/chat/room";
import { canManageGroup } from "../../utils/groupPermissions.ts";
import { useAppSelector } from "@/features/hooks.ts";
import { useTranslation } from "react-i18next";

interface GroupManagementProps {
  room: RoomResponse;
  onBack: () => void;
}

const GroupManagement = ({ room, onBack }: GroupManagementProps) => {
  const { t } = useTranslation("chat");
  const { userSession } = useAppSelector((state) => state.auth);
  const currentUserId = userSession?.id || 0;
  const isAdmin = canManageGroup(room, currentUserId);

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="px-4 py-3 bg-gray-50/50 text-[13px] font-semibold text-purple-900 border-t border-b border-gray-100 mt-2 first:mt-0 first:border-t-0">
      {title}
    </div>
  );

  const SettingRow = ({ 
    label, 
    checked, 
    type = "checkbox", 
    hasInfo = false 
  }: { 
    label: string; 
    checked: boolean; 
    type?: "checkbox" | "switch";
    hasInfo?: boolean;
  }) => (
    <div className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${!isAdmin ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className="flex items-center gap-2 flex-1 mr-4">
        <span className={`text-[14px] leading-tight ${!isAdmin ? 'text-gray-500' : 'text-gray-800'}`}>{label}</span>
        {hasInfo && <Info className="w-4 h-4 text-gray-400 cursor-help" />}
      </div>
      
      {type === "checkbox" ? (
        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-300'}`}>
          {checked && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />}
        </div>
      ) : (
        <div className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-purple-600' : 'bg-gray-300'}`}>
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${checked ? 'left-5.5' : 'left-0.5'}`} style={{ left: checked ? '22px' : '2px' }} />
        </div>
      )}
    </div>
  );

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
        <SettingRow label={t("management.changeNameAvatar")} checked={true} />
        <SettingRow label={t("management.pinMessages")} checked={true} />
        <SettingRow label={t("management.createNotes")} checked={true} />
        <SettingRow label={t("management.createPolls")} checked={true} />
        <SettingRow label={t("management.sendMessages")} checked={true} />

        <div className="h-2 bg-gray-100" />

        <SettingRow label={t("management.approvalMode")} checked={false} type="switch" hasInfo={true} />
        <div className="mx-4 border-t border-gray-100" />
        <SettingRow label={t("management.highlightAdmins")} checked={true} type="switch" hasInfo={true} />
        <div className="mx-4 border-t border-gray-100" />
        <SettingRow label={t("management.readRecentMessages")} checked={true} type="switch" hasInfo={true} />
        <div className="mx-4 border-t border-gray-100" />
        <SettingRow label={t("management.useGroupLink")} checked={true} type="switch" hasInfo={true} />

        {/* Group Link Box */}
        <div className="px-4 py-3">
          <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3 flex items-center gap-3">
            <span className="text-[13px] text-purple-700 font-medium flex-1 truncate">pingme.me/g/krgusp113</span>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-600 hover:bg-purple-100">
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-600 hover:bg-purple-100">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="h-2 bg-gray-100" />

        <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
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
