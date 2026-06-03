import { Provider } from "react-redux";
import type { DefaultAuthResponse } from "@/types/authentication";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect, useState } from "react";
import { joinGroupByLinkApi } from "@/services/chat";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import AppLoader from "./components/custom/AppLoader";
import MobileUnsupportedView from "./components/custom/MobileUnsupportedView";
import { router } from "./router";
import { persistor, store } from "./features/store";
import { useAppDispatch, useAppSelector } from "./features/hooks";
import { getCurrentUserSession } from "@/features/auth/authThunk";
import { setupAxiosInterceptors } from "./lib/axiosClient";
import {
  clearAuthState,
  setLogoutReason,
  updateUserSession,
} from "@/features/auth/authSlice";
import { LazyMotion, domAnimation } from "framer-motion";

const PersistLoader = () => (
  <AppLoader type="pulse" message="Restoring session..." />
);

const MOBILE_BLOCK_MEDIA_QUERY = "(max-width: 720px)";

function useIsUnsupportedViewport() {
  const [isUnsupportedViewport, setIsUnsupportedViewport] =
    useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia(MOBILE_BLOCK_MEDIA_QUERY);

    const updateViewportState = (matches: boolean) => {
      setIsUnsupportedViewport(matches);
    };

    updateViewportState(mediaQuery.matches);

    const onViewportChange = (event: MediaQueryListEvent) => {
      updateViewportState(event.matches);
    };

    mediaQuery.addEventListener("change", onViewportChange);

    return () => {
      mediaQuery.removeEventListener("change", onViewportChange);
    };
  }, []);

  return isUnsupportedViewport;
}

function SessionBootstrap() {
  const { isLogin } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (isLogin && token) {
      dispatch(getCurrentUserSession());

      const pendingInvitePath = sessionStorage.getItem("pending_group_invite_path");
      if (
        pendingInvitePath &&
        globalThis.location.pathname + globalThis.location.search !== pendingInvitePath
      ) {
        globalThis.location.replace(pendingInvitePath);
      }
    }
  }, [isLogin, dispatch]);

  return null;
}

function AppInner() {
  const isUnsupportedViewport = useIsUnsupportedViewport();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    // Intercept same-origin /g/:token clicks and show a confirmation modal for logged-in users
    const onDocClick = async (ev: MouseEvent) => {
      try {
        if (ev.defaultPrevented) return;
        if ((ev as any).button !== 0) return;
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;

        const target = ev.target as HTMLElement | null;
        if (!target) return;
        const anchor = target.closest && (target.closest('a') as HTMLAnchorElement | null);
        if (!anchor) return;
        const href = anchor.getAttribute('href') || anchor.href;
        if (!href) return;

        const url = new URL(href, globalThis.location.href);
        if (url.origin !== globalThis.location.origin) return;
        const match = url.pathname.match(/^\/g\/(?<token>[^\/]+)/i);
        if (!match || !match.groups) return;

        const token = match.groups.token;

        // If user not logged in, preserve pending invite and redirect to login
        const isLogin = store.getState().auth.isLogin;
        if (!isLogin) {
          sessionStorage.setItem(
            "pending_group_invite_path",
            globalThis.location.pathname + globalThis.location.search,
          );
          globalThis.location.replace("/?mode=login");
          return;
        }

        // prevent default navigation and open modal via custom event
        ev.preventDefault();
        const event = new CustomEvent('pingme:open-invite-modal', { detail: { token } });
        document.dispatchEvent(event);
      } catch (err) {
        // ignore
      }
    };

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // Listen for modal open events and handle with React state
  useEffect(() => {
    const onOpen = (e: Event) => {
      const ce = e as CustomEvent;
      const token = ce.detail?.token as string | undefined;
      if (token) {
        setInviteToken(token);
        setInviteModalOpen(true);
      }
    };
    document.addEventListener('pingme:open-invite-modal', onOpen as EventListener);
    return () => document.removeEventListener('pingme:open-invite-modal', onOpen as EventListener);
  }, []);

  useEffect(() => {
    const opts = {
      onTokenRefreshed: (payload: DefaultAuthResponse) =>
        store.dispatch(updateUserSession(payload)),
      onLogout: () => {
        localStorage.removeItem("access_token");
        store.dispatch(setLogoutReason("EXPIRED"));
        store.dispatch(clearAuthState());
      },
    };

    setupAxiosInterceptors(opts);
  }, []);

  if (isUnsupportedViewport) {
    return <MobileUnsupportedView />;
  }

  return (
    <PersistGate loading={<PersistLoader />} persistor={persistor}>
      <SessionBootstrap />
      <ScrollArea className="min-h-screen">
        <Dialog open={inviteModalOpen} onOpenChange={(open) => setInviteModalOpen(open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tham gia nhóm</DialogTitle>
              <DialogDescription>Bạn có chắc muốn tham gia nhóm này không?</DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setInviteModalOpen(false)} disabled={inviteLoading}>
                Huỷ
              </Button>
              <Button
                onClick={async () => {
                  if (!inviteToken) return;
                  // small confirm animation before calling API
                  setInviteLoading(true);
                  try {
                    await new Promise((r) => setTimeout(r, 700));
                    const res = await joinGroupByLinkApi({ joinLinkToken: inviteToken });
                    const payload = res.data.data;
                    // brief success pulse before redirect so toast/animation are visible
                    if (payload.approvedImmediately && payload.room) {
                      toast.success(payload.message || "Tham gia nhóm thành công");
                      await new Promise((r) => setTimeout(r, 700));
                      globalThis.history.pushState({}, "", `/app/chat?roomId=${payload.room.roomId}`);
                      globalThis.dispatchEvent(new PopStateEvent('popstate'));
                      setInviteModalOpen(false);
                      return;
                    }
                    if (!payload.approvedImmediately && payload.joinRequest) {
                      toast.success(payload.message || "Yêu cầu tham gia đã được gửi");
                      await new Promise((r) => setTimeout(r, 700));
                      globalThis.history.pushState({}, "", `/app/chat`);
                      globalThis.dispatchEvent(new PopStateEvent('popstate'));
                      setInviteModalOpen(false);
                      return;
                    }
                    toast.success(payload.message || "Đã xử lý link mời");
                    await new Promise((r) => setTimeout(r, 700));
                    setInviteModalOpen(false);
                  } catch (err) {
                    toast.error(getErrorMessage(err, "Không thể tham gia nhóm"));
                    setInviteModalOpen(false);
                  } finally {
                    setInviteLoading(false);
                    setInviteToken(null);
                  }
                }}
                disabled={inviteLoading}
                className={inviteLoading ? "animate-pulse" : undefined}
              >
                {inviteLoading ? "Đang xử lý..." : "Tham gia"}
              </Button>
            </DialogFooter>
            <DialogClose />
          </DialogContent>
        </Dialog>
        <RouterProvider router={router} />
      </ScrollArea>

      <Toaster
        duration={3000}
        closeButton
        position="top-center"
        theme="system"
        richColors
      />
    </PersistGate>
  );
}

export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <Provider store={store}>
        <AppInner />
      </Provider>
    </LazyMotion>
  );
}
