import type messages from "@/messages/en.json";

/**
 * The footer's contact details and social links are not in the message files:
 * lib/page-content/messages.ts injects them from site.config.ts so they share
 * the editable message tree (Dashboard → Pages → Footer).
 */
type InjectedMessages = {
    footer: {
        contact: { location: string; email: string; phone: string };
        social: { facebook: string; instagram: string; linkedin: string };
    };
};

declare module "next-intl" {
    interface AppConfig {
        Messages: typeof messages & InjectedMessages;
    }
}
