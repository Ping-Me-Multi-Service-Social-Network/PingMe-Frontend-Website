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
import AppLoader from "./components/custom/AppLoader";

const PersistGate = lazy(() =>
  import("redux-persist/integration/react").then((module) => ({
    default: module.PersistGate,
  }))
);

const PersistLoader = () => (
  <AppLoader type="pulse" message="Restoring session..." />
);

const InitialLoader = () => (
  <AppLoader type="dots" message="Loading PingMe..." />
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
            <ScrollArea className="min-h-screen">
              <RouterProvider router={router}></RouterProvider>
            </ScrollArea>
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
