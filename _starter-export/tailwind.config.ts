import type { Config } from "tailwindcss";

// NOTE: the color values below are this project's specific brand palette
// (teal/cream) copied verbatim from the source repo — see EXPORT-NOTES.md.
// Token *names* (primary, ink, cream, ...) are generic; the hex *values*
// are not. Swap the values for your own brand before shipping.
const config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Brand
                primary: "#4A6B6D",
                "primary-light": "#79AFB2",
                "primary-leaf": "#537274",
                secondary: "#141817",

                // Surfaces
                dark: "#202423",
                cream: "#FCF8EB",
                "cream-leaf": "#F0EDE0",

                // Text on light surfaces
                ink: "#101717",
                "ink-2": "#404645",
                "ink-3": "#6F7474",

                // Text on dark surfaces
                paper: "#F4F7F7",
                "paper-2": "#CECECE",
                "paper-3": "#9C9E9D",

                // Borders
                line: "#E6E7E7",
                "line-strong": "#080C0B",
                "line-dark": "#212423",

                // Alpha utilities
                "cream-10": "rgba(252,248,235,0.1)",
                "cream-80": "rgba(252,248,235,0.8)",
                "dark-10": "rgba(20,24,23,0.1)",
                "primary-20": "rgba(74,107,109,0.2)",
                "sage-20": "rgba(180,195,189,0.2)",
            },
            fontFamily: {
                fjalla: ["'Fjalla One'", "sans-serif"],
                mono: ["'IBM Plex Mono'", "monospace"],
            },
            letterSpacing: {
                "wide-lg": "2.88px",
                tightest: "-1.44px",
                tighter: "-0.48px",
                tight: "-0.36px",
                "tight-sm": "-0.36px",
            },
        },
    },
    plugins: [],
};

export default config;
