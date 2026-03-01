import { useTranslation } from "react-i18next";
import { useCallback } from "react";

export const useLanguage = (ns?: string | string[]) => {
    const { i18n, t } = useTranslation(ns);

    const toggleLanguage = useCallback(() => {
        const newLang = i18n.language === "vi" ? "en" : "vi";
        i18n.changeLanguage(newLang);
        localStorage.setItem("appLanguage", newLang);
    }, [i18n]);

    const setLanguage = useCallback((lang: "vi" | "en") => {
        i18n.changeLanguage(lang);
        localStorage.setItem("appLanguage", lang);
    }, [i18n]);

    const currentLanguage = i18n.language as "vi" | "en";
    const isVietnamese = currentLanguage === "vi";

    return {
        t,
        i18n,
        toggleLanguage,
        setLanguage,
        currentLanguage,
        isVietnamese,
    };
};
