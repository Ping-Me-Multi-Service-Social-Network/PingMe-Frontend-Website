import { useTourFactory, createTourStep, type TourStepConfig } from "./useTourFactory";
import { useTranslation } from "react-i18next";

const USER_INFO = "/app/profile/user-info";
const CHANGE_PW = "/app/profile/change-password";
const DEVICE_MG = "/app/profile/device-management";

export function useProfileTour() {
    const { t } = useTranslation("tours");

    const steps: TourStepConfig[] = [
        createTourStep(
            t("profile.welcome.title"),
            t("profile.welcome.desc"),
            "#profile-avatar-panel",
            "bottom",
            "center",
            USER_INFO
        ),
        createTourStep(
            t("profile.infoNav.title"),
            t("profile.infoNav.desc"),
            "#profile-nav-user-info",
            "right",
            "center",
            USER_INFO
        ),
        createTourStep(
            t("profile.infoEdit.title"),
            t("profile.infoEdit.desc"),
            "#profile-info-fields",
            "left",
            "start",
            USER_INFO
        ),
        createTourStep(
            t("profile.passwordNav.title"),
            t("profile.passwordNav.desc"),
            "#profile-nav-change-password",
            "right",
            "center",
            USER_INFO
        ),
        createTourStep(
            t("profile.passwordForm.title"),
            t("profile.passwordForm.desc"),
            "#profile-password-form",
            "left",
            "start",
            CHANGE_PW
        ),
        createTourStep(
            t("profile.deviceNav.title"),
            t("profile.deviceNav.desc"),
            "#profile-nav-device-management",
            "right",
            "center",
            CHANGE_PW
        ),
        createTourStep(
            t("profile.deviceManage.title"),
            t("profile.deviceManage.desc"),
            "#profile-device-section",
            "left",
            "start",
            DEVICE_MG
        ),
    ];

    return useTourFactory({
        storageKey: "pingme_profile_tour_completed",
        prerequisiteKey: "pingme_global_tour_completed",
        steps,
        returnRoute: USER_INFO,
    });
}
