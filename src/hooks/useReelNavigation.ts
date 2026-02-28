import { useEffect, useRef, useCallback } from "react";

interface Props {
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
    totalItems: number;
    onReachEnd?: () => void;
    offset?: number;
}

export function useReelNavigation({
    setCurrentIndex,
    totalItems,
    onReachEnd,
    offset = 3,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const touchStartRef = useRef<number | null>(null);
    const touchDeltaRef = useRef<number>(0);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => {
            const nextIndex = prev + 1;
            if (onReachEnd && nextIndex >= totalItems - offset) {
                onReachEnd();
            }
            return Math.min(nextIndex, totalItems - 1);
        });
    }, [setCurrentIndex, totalItems, offset, onReachEnd]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }, [setCurrentIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Chỉ handle phím lên xuống nếu không đang gõ trong input
            if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

            if (e.key === "ArrowUp") handlePrev();
            else if (e.key === "ArrowDown") handleNext();
        };

        globalThis.addEventListener("keydown", handleKeyDown as EventListener);
        return () => globalThis.removeEventListener("keydown", handleKeyDown as EventListener);
    }, [handlePrev, handleNext]);

    // Wheel navigation
    const handleWheel = useCallback(
        (e: WheelEvent) => {
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

            scrollTimeoutRef.current = setTimeout(() => {
                if (e.deltaY > 0) handleNext();
                else handlePrev();
            }, 100);
        },
        [handleNext, handlePrev]
    );

    // Touch and wheel event binding
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleTouchStart = (e: TouchEvent) => {
            touchStartRef.current = e.touches[0].clientY;
            touchDeltaRef.current = 0;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (touchStartRef.current === null) return;
            touchDeltaRef.current = touchStartRef.current - e.touches[0].clientY;
        };

        const handleTouchEnd = () => {
            const delta = touchDeltaRef.current;
            const threshold = 50; // px
            if (delta > threshold) handleNext();
            else if (delta < -threshold) handlePrev();

            touchStartRef.current = null;
            touchDeltaRef.current = 0;
        };

        container.addEventListener("wheel", handleWheel, { passive: true });
        container.addEventListener("touchstart", handleTouchStart, { passive: true });
        container.addEventListener("touchmove", handleTouchMove, { passive: true });
        container.addEventListener("touchend", handleTouchEnd, { passive: true });

        return () => {
            container.removeEventListener("wheel", handleWheel);
            container.removeEventListener("touchstart", handleTouchStart);
            container.removeEventListener("touchmove", handleTouchMove);
            container.removeEventListener("touchend", handleTouchEnd);
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        };
    }, [handleWheel, handleNext, handlePrev]);

    return { containerRef };
}
