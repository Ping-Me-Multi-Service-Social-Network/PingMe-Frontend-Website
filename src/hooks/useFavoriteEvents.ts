import { useEffect } from "react";

type FavoriteEventDetail = { songId: number };
type FavoriteEventType = "favorite-added" | "favorite-removed";

/**
 * Custom hook to listen to favorite events
 */
export function useFavoriteEventListener(
  onFavoriteAdded?: (songId: number) => void,
  onFavoriteRemoved?: (songId: number) => void,
) {
  useEffect(() => {
    const handleFavoriteAdded = (event: Event) => {
      const customEvent = event as CustomEvent<FavoriteEventDetail>;
      onFavoriteAdded?.(customEvent.detail.songId);
    };

    const handleFavoriteRemoved = (event: Event) => {
      const customEvent = event as CustomEvent<FavoriteEventDetail>;
      onFavoriteRemoved?.(customEvent.detail.songId);
    };

    if (onFavoriteAdded) {
      globalThis.addEventListener("favorite-added", handleFavoriteAdded);
    }
    if (onFavoriteRemoved) {
      globalThis.addEventListener("favorite-removed", handleFavoriteRemoved);
    }

    return () => {
      if (onFavoriteAdded) {
        globalThis.removeEventListener("favorite-added", handleFavoriteAdded);
      }
      if (onFavoriteRemoved) {
        globalThis.removeEventListener(
          "favorite-removed",
          handleFavoriteRemoved,
        );
      }
    };
  }, [onFavoriteAdded, onFavoriteRemoved]);
}

/**
 * Utility function to dispatch favorite events
 */
export function dispatchFavoriteEvent(type: FavoriteEventType, songId: number) {
  globalThis.dispatchEvent(
    new CustomEvent(type, {
      detail: { songId },
    }),
  );
}
