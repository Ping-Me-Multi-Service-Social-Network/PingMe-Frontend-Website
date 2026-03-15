import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { ScrollArea } from "./components/ui/scroll-area";
import AppLoader from "./components/custom/AppLoader";
import MobileUnsupportedView from "./components/custom/MobileUnsupportedView";
import { router } from "./router";
import { persistor, store } from "./features/store";
import { useAppDispatch, useAppSelector } from "./features/hooks";
import { getCurrentUserSession, logout } from "@/features/auth/authThunk";
import { setupAxiosInterceptors } from "./lib/axiosClient";
import { setupAuthAxiosInterceptors } from "./lib/axiosAuthClient";
import { setupMusicAxiosInterceptors } from "./lib/axiosMusicClient";
import {
  setLogoutReason,
  updateUserSession,
} from "@/features/auth/authSlice";

const PersistLoader = () => (
  <AppLoader type="pulse" message="Restoring session..." />
);

const MOBILE_BLOCK_MEDIA_QUERY = "(max-width: 1023px)";

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
    }
  }, [isLogin, dispatch]);

  return null;
}

function AppInner() {
  const isUnsupportedViewport = useIsUnsupportedViewport();

  useEffect(() => {
    const opts = {
      onTokenRefreshed: (payload: any) =>
        store.dispatch(updateUserSession(payload)),
      onLogout: () => {
        store.dispatch(setLogoutReason("EXPIRED"));
        store.dispatch(logout());
      },
    };

    setupAxiosInterceptors(opts);
    setupAuthAxiosInterceptors(opts);
    setupMusicAxiosInterceptors(opts);
  }, []);

  if (isUnsupportedViewport) {
    return <MobileUnsupportedView />;
  }

  return (
    <PersistGate loading={<PersistLoader />} persistor={persistor}>
      <SessionBootstrap />
      <ScrollArea className="min-h-screen">
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
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
}
