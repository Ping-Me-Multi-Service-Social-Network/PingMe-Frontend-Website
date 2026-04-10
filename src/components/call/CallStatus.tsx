import { useCall } from "@/features/websocket";
import { useTranslation } from "react-i18next";

export function CallStatus() {
  const { callState } = useCall();
  const { t } = useTranslation("call");

  const getStatusMessage = () => {
    switch (callState.status) {
      case "calling":
        return t("status.calling");
      case "ringing":
        return t("status.ringing");
      case "connected":
        return t("status.connected");
      case "rejected":
        return callState.rejectReason === "REJECTED_BY_USER"
          ? t("status.rejectedByUser")
          : t("status.rejected");
      case "ended":
        return t("status.ended");
      case "error":
        return t("status.error", { message: callState.error });
      default:
        return "";
    }
  };

  if (callState.status === "idle") {
    return null;
  }

  const statusColors = {
    calling: "bg-yellow-100 text-yellow-800",
    ringing: "bg-blue-100 text-blue-800",
    connected: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    ended: "bg-gray-100 text-gray-800",
    error: "bg-red-100 text-red-800",
  };

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full font-medium z-30 ${statusColors[callState.status]
        }`}
    >
      {getStatusMessage()}
    </div>
  );
}
