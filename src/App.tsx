import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { ScrollArea } from "./components/ui/scroll-area";
import AppLoader from "./components/custom/AppLoader";
import { router } from "./router";
import { persistor, store } from "./features/store";
import { useAppDispatch } from "./features/hooks";
import { getCurrentUserSession, logout } from "./features/slices/authThunk";
import { setupAxiosInterceptors } from "./lib/axiosClient";
import { updateTokenManually } from "./features/slices/authSlice";

const PersistLoader = () => (
  <AppLoader type="pulse" message="Restoring session..." />
);

function SessionBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getCurrentUserSession());
  }, [dispatch]);

  return null;
}

function AppInner() {
  useEffect(() => {
    setupAxiosInterceptors({
      onTokenRefreshed: (payload) =>
        store.dispatch(updateTokenManually(payload)),
      onLogout: () => store.dispatch(logout()),
    });
  }, []);

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
