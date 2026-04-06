import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ScrollRow({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 0);
    // Add small tolerance (2px) to prevent precision issues
    setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, [children]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    
    const element = scrollRef.current;
    const start = element.scrollLeft;
    const scrollAmount = element.clientWidth * 0.75;
    
    let target = start;
    if (direction === "left") {
      target -= scrollAmount;
    } else {
      target += scrollAmount;
    }
    
    const duration = 500; // 500ms duration for butter-smooth effect
    const startTime = performance.now();

    // Smooth cubic-bezier easing out
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      element.scrollLeft = start + (target - start) * easeOutQuart(progress);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  const renderScrollButton = (direction: "left" | "right", isVisible: boolean) => {
    const isLeft = direction === "left";
    let Icon = ChevronRight;
    let paddingClass = "pl-0.5";
    let basePosition = "right-0 translate-x-1/2";
    let slideClass = "translate-x-3 group-hover/row:translate-x-0";
    let exitSlideClass = "translate-x-3";
    
    if (isLeft) {
      Icon = ChevronLeft;
      paddingClass = "pr-0.5";
      basePosition = "left-0 -translate-x-1/2";
      slideClass = "-translate-x-3 group-hover/row:translate-x-0";
      exitSlideClass = "-translate-x-3";
    }

    let visibilityClasses = `opacity-0 ${exitSlideClass} pointer-events-none`;
    if (isVisible) {
      visibilityClasses = `opacity-0 group-hover/row:opacity-100 ${slideClass} pointer-events-auto`;
    }

    return (
      <div className={`absolute ${basePosition} top-1/2 -translate-y-1/2 z-20 transition-all duration-500 ease-out ${visibilityClasses}`}>
        <button
          onClick={() => scroll(direction)}
          className="w-9 h-9 rounded-full bg-zinc-800/95 hover:bg-purple-600 border border-zinc-700/50 hover:border-purple-500 text-white shadow-xl flex items-center justify-center transition-transform duration-300 hover:scale-110"
        >
          <Icon className={`w-5 h-5 ${paddingClass} text-zinc-300 hover:text-white`} />
        </button>
      </div>
    );
  };

  return (
    <div className="relative group/row">
      {renderScrollButton("left", showLeft)}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto pb-4 pt-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>

      {renderScrollButton("right", showRight)}
    </div>
  );
}
