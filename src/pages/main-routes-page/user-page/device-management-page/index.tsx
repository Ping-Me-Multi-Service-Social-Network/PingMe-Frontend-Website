import {
  deleteCurrentUserDeviceMetaApi,
  getCurrentUserAllDeviceMetasApi,
} from "@/services/authentication";
import type { CurrentUserSessionMetaResponse } from "@/types/authentication";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import { normalizeDeviceType } from "@/utils/sessionMetaHandler.ts";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Trash2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import LoadingSpinner from "@/components/custom/LoadingSpinner";
import { DeleteConfirmDialog } from "@/components/custom/DeleteConfirmationDialog";
import {
  Smartphone,
  Tablet,
  Monitor,
  Tv,
  Gamepad2,
  Watch,
  Cpu,
  Globe,
} from "lucide-react";

const DeviceManagementPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<CurrentUserSessionMetaResponse[]>(
    []
  );
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null
  );

  const getDeviceIcon = (deviceType?: string | null) => {
    if (!deviceType) return <Globe className="h-5 w-5 text-orange-500" />;

    switch (deviceType.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-5 w-5 text-orange-500" />;
      case "tablet":
        return <Tablet className="h-5 w-5 text-orange-500" />;
      case "smarttv":
        return <Tv className="h-5 w-5 text-orange-500" />;
      case "console":
        return <Gamepad2 className="h-5 w-5 text-orange-500" />;
      case "wearable":
        return <Watch className="h-5 w-5 text-orange-500" />;
      case "embedded":
        return <Cpu className="h-5 w-5 text-orange-500" />;
      case "desktop":
      case "computer":
      default:
        return <Monitor className="h-5 w-5 text-orange-500" />;
    }
  };

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getCurrentUserAllDeviceMetasApi();
      const data = res.data.data;

      const sortedSessions = data.sort(
        (
          a: CurrentUserSessionMetaResponse,
          b: CurrentUserSessionMetaResponse
        ) => {
          if (a.current && !b.current) return -1;
          if (!a.current && b.current) return 1;
          return (
            new Date(b.lastActiveAt).getTime() -
            new Date(a.lastActiveAt).getTime()
          );
        }
      );

      setSessions(sortedSessions);
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Không thể lấy thông tin phiên đăng nhập")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteSession = async (sessionId: string) => {
    console.log("[PingMe] Delete session:", sessionId);
    try {
      setDeletingSessionId(sessionId);
      await deleteCurrentUserDeviceMetaApi(sessionId);

      toast.success("Đã xóa phiên đăng nhập thành công");
      await fetchSessions();
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể xóa phiên đăng nhập"));
    } finally {
      setDeletingSessionId(null);
    }
  };

  const formatLastActive = (lastActiveAt: string) => {
    try {
      return formatDistanceToNow(new Date(lastActiveAt), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "Không xác định";
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2 text-purple-600">
          <LoadingSpinner />
          <span className="text-lg font-medium">
            Đang tải danh sách phiên đăng nhập...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Quản lý phiên đăng nhập
        </h1>
        <p className="text-gray-600">
          Xem và quản lý các phiên đăng nhập vào tài khoản của bạn trên các
          thiết bị khác nhau
        </p>
      </div>

      {/* Stats */}
      {sessions.length > 0 && (
        <div className=" grid grid-cols-1 md:grid-cols-3 gap-4 my-12">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">
              {sessions.length}
            </div>
            <div className="text-sm text-gray-600">Tổng số phiên</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {sessions.filter((s) => s.current).length}
            </div>
            <div className="text-sm text-gray-600">Phiên hiện tại</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {sessions.filter((s) => !s.current).length}
            </div>
            <div className="text-sm text-gray-600">Phiên khác</div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có phiên đăng nhập nào
              </h3>
              <p className="text-gray-600">
                Hiện tại không có phiên đăng nhập nào được tìm thấy.
              </p>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card
              key={session.sessionId}
              className={`transition-all duration-200 ${
                session.current
                  ? "border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg"
                  : "border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Device Icon */}
                    <div
                      className={`p-3 rounded-lg ${
                        session.current
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {getDeviceIcon(session.deviceType)}
                    </div>

                    {/* Session Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {normalizeDeviceType(session.deviceType)}
                        </CardTitle>
                        {session.current && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 font-medium">
                            <Shield className="w-3 h-3 mr-1" />
                            Phiên hiện tại
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">{session.os}</span>
                          <span>•</span>
                          <span>{session.browser}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            Hoạt động lần cuối:{" "}
                            <span
                              className={
                                session.current
                                  ? "text-green-600 font-medium"
                                  : ""
                              }
                            >
                              {session.current
                                ? "Đang hoạt động"
                                : formatLastActive(session.lastActiveAt)}
                            </span>
                          </span>
                        </div>

                        <div className="text-xs text-gray-500">
                          ID phiên: {session.sessionId.slice(0, 8)}...
                          {session.sessionId.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {!session.current && (
                    <DeleteConfirmDialog
                      onConfirm={() => handleDeleteSession(session.sessionId)}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deletingSessionId === session.sessionId}
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 ml-4 bg-transparent"
                      >
                        {deletingSessionId === session.sessionId ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang xóa...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa phiên
                          </>
                        )}
                      </Button>
                    </DeleteConfirmDialog>
                  )}
                </div>
              </CardHeader>

              {session.current && (
                <CardContent className="pt-0">
                  <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-green-800">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Đây là phiên đăng nhập hiện tại của bạn. Bạn không thể
                        xóa phiên này.
                      </span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DeviceManagementPage;
