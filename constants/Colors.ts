export const Colors = {
    light: {
        text: "#000000",
        background: "#ffffff",
        gradient: ['#d5ddf8', '#f0f1fd', '#f4f6ff', '#ffffff'] as const,
        accent: "#3058e7",
        corner: 12, // Si vous utilisez `corner` pour le style des bordures ou des rayons
        card: "#16171d",
        font: "Poppins", // Optionnel si utilisé dans les styles
        border: "#42454e",
        text2: "#42454e",
        secondary: "#03050c",
        input: "#111318",
        danger: "#631212",
        dangerbg: "#fbd2d2",
        valide: "#205113",
        validebg: "#def8d7",
        color: "#ffffff"
    },
    dark: {
        text: "#e8e8eb",
        background: "#03050c",
        gradient: ['#0C101D', '#080910', '#070911', '#03050C'] as const,
        accent: "#3058e7",
        corner: 12,
        card: "#16171d",
        font: "Poppins",
        border: "#42454e",
        text2: "#9f9f9f",
        secondary: "#ffffff",
        input: "#111318",
        danger: "#ec7f7f",
        dangerbg: "#2b0909",
        valide: "#92e985",
        validebg: "#122c0b",
        color: "#ffffff"
    }
};
