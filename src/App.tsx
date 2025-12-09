"use client";

import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./features/store";
import { ScrollArea } from "./components/ui/scroll-area";
import { Toaster } from "./components/ui/sonner";
import { useEffect } from "react";
import { setupAxiosInterceptors } from "./lib/axiosClient";
import { updateTokenManually } from "./features/slices/authSlice";
import { logout } from "./features/slices/authThunk";
import { CallProvider } from "./components/call/CallProvider";

function App() {
  useEffect(() => {
    setupAxiosInterceptors({
      onTokenRefreshed: (payload) =>
        store.dispatch(updateTokenManually(payload)),
      onLogout: () => store.dispatch(logout()),
    });
  }, []);

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <CallProvider>
          <ScrollArea className="min-h-screen">
            <RouterProvider router={router}></RouterProvider>
          </ScrollArea>
        </CallProvider>
        <Toaster
          duration={3000}
          closeButton
          position="top-center"
          theme="system"
          richColors
        />
      </PersistGate>
    </Provider>
  );
}

export default App;
