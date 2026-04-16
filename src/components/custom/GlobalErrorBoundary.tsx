import { useRouteError } from "react-router-dom";
import { Button } from "../ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export function GlobalErrorBoundary() {
  const error = useRouteError() as Error;

  const isModuleFetchError = 
    error?.message?.includes("Failed to fetch dynamically imported module") || 
    error?.name === "ChunkLoadError" ||
    String(error).includes("dynamically imported module");

  // Attempt auto-reload once for chunk errors
  if (isModuleFetchError) {
    const hasReloaded = sessionStorage.getItem("chunk_reload_attempted");
    if (!hasReloaded) {
      sessionStorage.setItem("chunk_reload_attempted", "true");
      window.location.reload();
      return null;
    }
  }

  // Clear reload attempt flag on standard renders so future errors trigger reload again
  sessionStorage.removeItem("chunk_reload_attempted");

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 border-t border-t-transparent pt-10">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 flex flex-col items-center text-center">
        <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isModuleFetchError ? "App Updated" : "An Error Occurred"}
        </h1>
        <p className="text-gray-500 mb-8 whitespace-pre-wrap">
          {isModuleFetchError 
            ? "A new version of PingMe is available. Please refresh to load the latest version."
            : error?.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-4">
          <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Reload Page
          </Button>
          {!isModuleFetchError && (
             <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
             </Button>
          )}
        </div>
      </div>
    </div>
  );
}
