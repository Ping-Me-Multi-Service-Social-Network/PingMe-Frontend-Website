import { useTourFactory, createTourStep, type TourStepConfig } from "./useTourFactory";
import { useTranslation } from "react-i18next";

export function useGlobalTour() {
    const { t } = useTranslation("tours");

    const steps: TourStepConfig[] = [
        createTourStep(
            t("global.welcome.title"),
            t("global.welcome.desc"),
            undefined,
            "bottom",
            "center"
        ),
        createTourStep(
            t("global.chat.title"),
            t("global.chat.desc"),
            "#nav-chat"
        ),
        createTourStep(
            t("global.contacts.title"),
            t("global.contacts.desc"),
            "#nav-contacts",
            "right",
            "start"
        ),
        createTourStep(
            t("global.music.title"),
            t("global.music.desc"),
            "#nav-music"
        ),
        createTourStep(
            t("global.reels.title"),
            t("global.reels.desc"),
            "#nav-reels"
        ),
        createTourStep(
            t("global.ai.title"),
            t("global.ai.desc"),
            "#nav-ping-ai"
        ),
        createTourStep(
            t("global.account.title"),
            t("global.account.desc"),
            "#nav-user-menu"
        ),
    ];

    return useTourFactory({
        storageKey: "pingme_global_tour_completed",
        steps,
        doneText: t("global.done"),
    });
}
