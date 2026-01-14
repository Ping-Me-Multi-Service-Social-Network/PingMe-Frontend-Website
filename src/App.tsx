import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { Provider } from "react-redux";
import { lazy, Suspense, useEffect, useState } from "react";
import { ScrollArea } from "./components/ui/scroll-area";
import { Toaster } from "./components/ui/sonner";
import { setupAxiosInterceptors } from "./lib/axiosClient";
import { persistor, store } from "./features/store";
import { updateTokenManually } from "./features/slices/authSlice";
import { logout } from "./features/slices/authThunk";

const PersistGate = lazy(() =>
  import("redux-persist/integration/react").then((module) => ({
    default: module.PersistGate,
  }))
);

const CallProvider = lazy(() =>
  import("@/pages/app-routes-page/chat-page/components/call/CallProvider").then(
    (module) => ({
      default: module.CallProvider,
    })
  )
);

const PersistLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const InitialLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

function App() {
  const [persistReady, setPersistReady] = useState(false);

  useEffect(() => {
    setupAxiosInterceptors({
      onTokenRefreshed: (payload) =>
        store.dispatch(updateTokenManually(payload)),
      onLogout: () => store.dispatch(logout()),
    });

    const timer = setTimeout(() => setPersistReady(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Provider store={store}>
      {persistReady ? (
        <Suspense fallback={<InitialLoader />}>
          <PersistGate loading={<PersistLoader />} persistor={persistor}>
            <Suspense fallback={<InitialLoader />}>
              <CallProvider>
                <ScrollArea className="min-h-screen">
                  <RouterProvider router={router}></RouterProvider>
                </ScrollArea>
              </CallProvider>
            </Suspense>
          </PersistGate>
        </Suspense>
      ) : (
        <InitialLoader />
      )}
      <Toaster
        duration={3000}
        closeButton
        position="top-center"
        theme="system"
        richColors
      />
    </Provider>
  );
}

export default App;
