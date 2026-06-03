import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "@/features/hooks";
import { joinGroupByLinkApi } from "@/services/chat";
import type { JoinGroupByLinkResponse } from "@/types/chat/room";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Link2, Lock, MessageSquarePlus, Copy } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler";

export default function GroupInvitePage() {
  const { token: tokenParam } = useParams();
  const navigate = useNavigate();
  const { isLogin } = useAppSelector((state) => state.auth);
  const [result, setResult] = useState<JoinGroupByLinkResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => tokenParam?.trim() ?? "", [tokenParam]);

  useEffect(() => {
    if (!token) {
      setError("Link tham gia nhóm không hợp lệ");
      return;
    }

    if (!isLogin) {
      sessionStorage.setItem(
        "pending_group_invite_path",
        globalThis.location.pathname + globalThis.location.search,
      );
      navigate("/?mode=login", { replace: true });
      return;
    }

    let cancelled = false;

    const joinGroup = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await joinGroupByLinkApi({ joinLinkToken: token });
        if (cancelled) return;

        const payload = response.data.data;
        setResult(payload);
        sessionStorage.removeItem("pending_group_invite_path");

        // Already approved and have room -> go directly to room
        if (payload.approvedImmediately && payload.room) {
          toast.success(payload.message || "Tham gia nhóm thành công");
          navigate(`/app/chat?roomId=${payload.room.roomId}`, { replace: true });
          return;
        }

        // If a join request was created (pending), notify and redirect to chat list or room's page
        if (!payload.approvedImmediately && payload.joinRequest) {
          toast.success(payload.message || "Yêu cầu tham gia đã được gửi");
          // Redirect to chat list and highlight room if available
          if (payload.joinRequest.roomId) {
            navigate(`/app/chat?roomId=${payload.joinRequest.roomId}`, { replace: true });
          } else {
            navigate(`/app/chat`, { replace: true });
          }
          return;
        }

        // Fallback: show message and leave (don't keep user on invite page)
        toast.success(payload.message || "Đã xử lý link mời");
        navigate("/", { replace: true });
      } catch (err) {
        if (cancelled) return;
        const message = getErrorMessage(err, "Không thể tham gia nhóm");
        setError(message);
        toast.error(message);
        // Redirect away from invite page for invalid/expired links
        navigate("/", { replace: true });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void joinGroup();

    return () => {
      cancelled = true;
    };
  }, [isLogin, navigate, token]);

  const isPendingApproval = Boolean(result && !result.approvedImmediately);
  const inviteUrl = useMemo(() => {
    if (!token) return null;
    try {
      return `${globalThis.location.origin}/g/${token}`;
    } catch {
      return null;
    }
  }, [token]);

  const copyInviteLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Link mời đã được sao chép");
    } catch {
      toast.error("Không thể sao chép link");
    }
  };
  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center px-4 py-12">
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background:
            'radial-gradient(600px circle at 15% 25%, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 40%), radial-gradient(400px circle at 85% 75%, color-mix(in srgb, var(--color-accent) 8%, transparent) 0%, transparent 45%)',
        }}
      />
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-border bg-card p-8 backdrop-blur-md shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Link2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Bạn được mời vào một nhóm</h2>
              <p className="text-sm text-muted-foreground mt-1">Mở link để vào nhóm hoặc đăng nhập để tiếp tục.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {!isLogin && (
              <div className="rounded-lg border border-accent/20 bg-accent/10 p-4 text-accent-foreground">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium">Bạn cần đăng nhập để tham gia nhóm</p>
                    <p className="text-sm text-accent-foreground/80">Link mời sẽ được giữ lại và mở lại sau khi bạn đăng nhập.</p>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="rounded-lg border border-border bg-card/80 p-4 flex items-center gap-3 text-card-foreground">
                <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" />
                <div>
                  <p className="font-medium">Đang xử lý link mời</p>
                  <p className="text-sm text-muted-foreground">Đang kiểm tra token và tham gia nhóm...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive-foreground">
                <p className="font-medium">Không thể tham gia nhóm</p>
                <p className="text-sm text-destructive-foreground/80 mt-1">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button className="flex-1" disabled={loading} onClick={() => navigate(isLogin ? "/app/chat" : "/?mode=login")}>
                Mở chat
              </Button>
              <Button variant="outline" onClick={() => navigate("/", { replace: true })}>
                Về trang chủ
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 backdrop-blur-md shadow-md flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14">
              {result?.room?.roomImgUrl ? (
                <AvatarImage src={result.room.roomImgUrl} />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary-foreground">{result?.room?.name ? result.room.name.charAt(0).toUpperCase() : "G"}</AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{result?.room?.name ?? "Nhóm PingMe"}</h3>
              <p className="text-sm text-muted-foreground">{result?.room ? `${result.room.participants.length} thành viên` : "Mời tham gia qua liên kết"}</p>
            </div>
          </div>

          <div className="flex-1">
            {result && !loading && !error ? (
              <div className="rounded-lg border border-primary/10 bg-primary/5 p-4 text-primary-foreground">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{isPendingApproval ? "Yêu cầu đã gửi" : "Bạn đã vào nhóm"}</p>
                    <p className="text-sm text-primary-foreground/80 mt-1">{result.message}</p>
                  </div>
                  <MessageSquarePlus className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card/80 p-4 text-card-foreground">
                <p className="text-sm">Nhấn "Mở chat" để vào trang chat hoặc sao chép link mời dưới đây.</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-md bg-card/80 border border-border px-4 py-2 truncate text-sm text-card-foreground">{inviteUrl ?? "-"}</div>
            <Button variant="ghost" onClick={copyInviteLink} disabled={!inviteUrl} className="h-10 w-10">
              <Copy className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}