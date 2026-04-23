import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { favoriteApi } from "@/services/music/favoriteApi";
import { dispatchFavoriteEvent } from "@/hooks/useFavoriteEvents";
import { toast } from "sonner";

// ── Context type ──────────────────────────────────────────────────────────────
interface FavoriteContextType {
  /** Set of song IDs that are favorites */
  favoriteIds: Set<number>;
  /** Check if a specific song is a favorite */
  isFavorite: (songId: number) => boolean;
  /** Toggle favorite status for a song */
  toggleFavorite: (songId: number) => Promise<void>;
  /** Whether the initial favorite list is still loading */
  loading: boolean;
}

const FavoriteContext = createContext<FavoriteContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function FavoriteProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch all favorites once on mount
  useEffect(() => {
    let isMounted = true;

    favoriteApi
      .getFavorites()
      .then((favorites) => {
        if (isMounted) {
          setFavoriteIds(new Set(favorites.map((f) => f.songId)));
        }
      })
      .catch((err) => {
        console.error("[FavoriteProvider] Failed to load favorites:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen to external favorite events (from other components)
  useEffect(() => {
    const onAdded = (e: Event) => {
      const songId = (e as CustomEvent<{ songId: number }>).detail.songId;
      setFavoriteIds((prev) => new Set(prev).add(songId));
    };
    const onRemoved = (e: Event) => {
      const songId = (e as CustomEvent<{ songId: number }>).detail.songId;
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(songId);
        return next;
      });
    };

    globalThis.addEventListener("favorite-added", onAdded);
    globalThis.addEventListener("favorite-removed", onRemoved);
    return () => {
      globalThis.removeEventListener("favorite-added", onAdded);
      globalThis.removeEventListener("favorite-removed", onRemoved);
    };
  }, []);

  const isFavorite = useCallback(
    (songId: number) => favoriteIds.has(songId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (songId: number) => {
      const wasFavorite = favoriteIds.has(songId);
      const action = wasFavorite
        ? favoriteApi.removeFavorite
        : favoriteApi.addFavorite;
      const eventType = wasFavorite ? "favorite-removed" : "favorite-added";

      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorite) {
          next.delete(songId);
        } else {
          next.add(songId);
        }
        return next;
      });

      try {
        await action(songId);
        dispatchFavoriteEvent(eventType, songId);
      } catch (err) {
        // Revert on failure
        console.error("[FavoriteProvider] Toggle failed:", err);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (wasFavorite) {
            next.add(songId);
          } else {
            next.delete(songId);
          }
          return next;
        });
        toast.error("Không thể cập nhật yêu thích");
      }
    },
    [favoriteIds],
  );

  const value = useMemo(
    () => ({ favoriteIds, isFavorite, loading, toggleFavorite }),
    [favoriteIds, isFavorite, loading, toggleFavorite],
  );

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useFavorites() {
  const ctx = useContext(FavoriteContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within <FavoriteProvider>");
  }
  return ctx;
}
