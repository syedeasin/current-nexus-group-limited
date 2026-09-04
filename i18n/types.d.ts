// i18next.d.ts
import 'i18next';
import type translation from './public/locales/en/translation.json'; // Adjust path to your JSON file

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation';
        resources: {
            translation: typeof translation;
        };
    }
}