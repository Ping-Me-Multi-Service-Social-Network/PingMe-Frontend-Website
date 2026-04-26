import i18n from "i18next";
// Trigger reload
import { initReactI18next } from "react-i18next";

import profileVI from "./locales/vi/profile.json";
import profileEN from "./locales/en/profile.json";
import contactsVI from "./locales/vi/contacts.json";
import contactsEN from "./locales/en/contacts.json";
import commonVI from "./locales/vi/common.json";
import commonEN from "./locales/en/common.json";
import chatVI from "./locales/vi/chat.json";
import chatEN from "./locales/en/chat.json";
import musicVI from "./locales/vi/music.json";
import musicEN from "./locales/en/music.json";
import aiVI from "./locales/vi/ai.json";
import aiEN from "./locales/en/ai.json";
import reelsVI from "./locales/vi/reels.json";
import reelsEN from "./locales/en/reels.json";
import toursVI from "./locales/vi/tours.json";
import toursEN from "./locales/en/tours.json";
import landingVI from "./locales/vi/landing.json";
import landingEN from "./locales/en/landing.json";
import callVI from "./locales/vi/call.json";
import callEN from "./locales/en/call.json";

const savedLanguage = localStorage.getItem("appLanguage") || "vi";

i18n
    .use(initReactI18next)
    .init({
        resources: {
            vi: {
                profile: profileVI,
                contacts: contactsVI,
                common: commonVI,
                chat: chatVI,
                music: musicVI,
                ai: aiVI,
                reels: reelsVI,
                tours: toursVI,
                landing: landingVI,
                call: callVI,
            },
            en: {
                profile: profileEN,
                contacts: contactsEN,
                common: commonEN,
                chat: chatEN,
                music: musicEN,
                ai: aiEN,
                reels: reelsEN,
                tours: toursEN,
                landing: landingEN,
                call: callEN,
            },
        },
        lng: savedLanguage,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
