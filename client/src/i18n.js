import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        debug: true,

        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },

        // Default resources for now to prevent loading errors if backend fails
        resources: {
            en: {
                translation: {
                    "Dashboard": "Dashboard",
                    "Opportunities": "Opportunities",
                    "New": "New",
                    "Qualified": "Qualified",
                    "Proposal": "Proposal",
                    "Negotiation": "Negotiation",
                    "Won": "Won",
                    "Lost": "Lost"
                }
            }
        }
    });

export default i18n;
