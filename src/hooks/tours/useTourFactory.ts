import { useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { driver, type DriveStep, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import "@/styles/tour.css";

// ─── Types ───
export interface TourStepConfig {
    step: DriveStep;
    route?: string; // route to navigate to before highlighting
}

export interface TourOptions {
    /** localStorage key dùng để lưu trạng thái đã xem */
    storageKey: string;
    /** Danh sách steps */
    steps: TourStepConfig[];
    /** Text nút "Done" cuối tour */
    doneText?: string;
    /** Route để navigate về sau khi kết thúc tour */
    returnRoute?: string;
    /** localStorage key của tour phải hoàn tất trước (VD: global tour) */
    prerequisiteKey?: string;
}

export function createTourStep(
    title: string,
    description: string,
    element?: string,
    side: "left" | "right" | "top" | "bottom" | "over" = "right",
    align: "start" | "center" | "end" = "center",
    route?: string
): TourStepConfig {
    const config: TourStepConfig = {
        step: {
            popover: { title, description, side, align },
        },
    };
    if (element) config.step.element = element;
    if (route) config.route = route;
    return config;
}

// ─── Utility ───
function waitForElement(
    selector: string,
    timeout = 5000
): Promise<Element | null> {
    return new Promise((resolve) => {
        const el = document.querySelector(selector);
        if (el) {
            resolve(el);
            return;
        }

        const observer = new MutationObserver(() => {
            const found = document.querySelector(selector);
            if (found) {
                observer.disconnect();
                resolve(found);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
            observer.disconnect();
            resolve(document.querySelector(selector));
        }, timeout);
    });
}

// ─── Factory Hook ───
export function useTourFactory(options: TourOptions) {
    const { t } = useTranslation("tours");
    const navigate = useNavigate();
    const driverRef = useRef<Driver | null>(null);
    const stepsRef = useRef<TourStepConfig[]>([]);

    const { storageKey, steps: tourSteps, doneText, returnRoute, prerequisiteKey } = options;

    const isTourCompleted = useCallback(() => {
        return localStorage.getItem(storageKey) === "true";
    }, [storageKey]);

    const markTourCompleted = useCallback(() => {
        localStorage.setItem(storageKey, "true");
        // Thông báo cho các module tour khác biết tour này đã hoàn tất
        globalThis.dispatchEvent(
            new CustomEvent("pingme:tour-completed", { detail: { key: storageKey } })
        );
    }, [storageKey]);

    const resetTour = useCallback(() => {
        localStorage.removeItem(storageKey);
    }, [storageKey]);

    const startTour = useCallback((force = false) => {
        if (!force && isTourCompleted()) return;
        // Chờ tour prerequisite hoàn tất trước
        if (!force && prerequisiteKey && localStorage.getItem(prerequisiteKey) !== "true") return;

        stepsRef.current = tourSteps;
        const driverSteps: DriveStep[] = tourSteps.map((t) => t.step);

        const closeTour = () => {
            markTourCompleted();
            driverObj.destroy();
            if (returnRoute) navigate(returnRoute);
        };

        const getRouteForStep = (index: number) => stepsRef.current[index]?.route;

        const navigateAndWait = async (route: string, selector: string) => {
            navigate(route);
            await waitForElement(selector, 5000);
        };

        const driverObj = driver({
            showProgress: false,
            animate: true,
            allowClose: false,
            overlayColor: "rgba(0, 0, 0, 0.6)",
            stagePadding: 10,
            stageRadius: 12,
            popoverClass: "pingme-tour-popover",
            nextBtnText: t("common.next"),
            prevBtnText: t("common.prev"),
            doneBtnText: doneText ?? t("common.done"),
            steps: driverSteps,

            onPopoverRender: (popover) => {
                const footer = popover.footer;
                const currentIndex = driverObj.getActiveIndex() ?? 0;
                const isFirst = currentIndex === 0;
                const isLast = currentIndex === tourSteps.length - 1;

                // Thêm nút "Bỏ qua" bên trái (ẩn ở bước cuối)
                if (!isLast) {
                    const skipBtn = document.createElement("button");
                    skipBtn.textContent = t("common.skip");
                    skipBtn.className = "pingme-tour-skip-btn";
                    skipBtn.onclick = closeTour;
                    footer.insertBefore(skipBtn, footer.firstChild);
                }

                // Ẩn nút "← Quay lại" ở bước đầu tiên
                if (isFirst) {
                    const prevBtn = popover.previousButton;
                    if (prevBtn) prevBtn.style.display = "none";
                }
            },

            onNextClick: async () => {
                const currentIndex = driverObj.getActiveIndex()!;
                const nextIndex = currentIndex + 1;

                if (nextIndex >= tourSteps.length) {
                    closeTour();
                    return;
                }

                const currentRoute = getRouteForStep(currentIndex);
                const nextRoute = getRouteForStep(nextIndex);
                const nextElement = tourSteps[nextIndex].step.element as string;

                if (nextRoute && nextRoute !== currentRoute) {
                    await navigateAndWait(nextRoute, nextElement);
                }

                driverObj.moveNext();
            },

            onPrevClick: async () => {
                const currentIndex = driverObj.getActiveIndex()!;
                const prevIndex = currentIndex - 1;

                if (prevIndex < 0) return;

                const currentRoute = getRouteForStep(currentIndex);
                const prevRoute = getRouteForStep(prevIndex);
                const prevElement = tourSteps[prevIndex].step.element as string;

                if (prevRoute && prevRoute !== currentRoute) {
                    await navigateAndWait(prevRoute, prevElement);
                }

                driverObj.movePrevious();
            },
        });

        driverRef.current = driverObj;
        driverObj.drive();
    }, [isTourCompleted, markTourCompleted, tourSteps, doneText, returnRoute, prerequisiteKey, navigate]);

    useEffect(() => {
        return () => {
            driverRef.current?.destroy();
        };
    }, []);

    // Lắng nghe khi prerequisite tour hoàn tất → tự động chạy tour này
    useEffect(() => {
        if (!prerequisiteKey) return;
        // Nếu prerequisite đã done rồi thì không cần listen
        if (localStorage.getItem(prerequisiteKey) === "true") return;
        // Nếu tour này đã hoàn tất rồi thì không cần listen
        if (localStorage.getItem(storageKey) === "true") return;

        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.key === prerequisiteKey) {
                // Đợi 1 chút để UI ổn định sau khi global tour kết thúc
                setTimeout(() => startTour(false), 600);
            }
        };

        globalThis.addEventListener("pingme:tour-completed", handler as EventListener);
        return () => globalThis.removeEventListener("pingme:tour-completed", handler as EventListener);
    }, [prerequisiteKey, storageKey, startTour]);

    return { startTour, resetTour, isTourCompleted };
}
