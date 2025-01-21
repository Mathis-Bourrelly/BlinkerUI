/*
Display pour les en-têtes d'écran ou les titres de page principaux.
Title pour les sections importantes.
SubTitle pour les sous-sections ou les titres secondaires.
Body pour les descriptions ou textes principaux.
Caption pour les légendes ou annotations.
ButtonText pour le texte sur les boutons.
Overline pour les petites étiquettes de contexte.
*/
export const Fonts = {
    Display: {
        fontFamily : "Poppins-Bold",
        fontSize: 32,
        fontWeight: "bold" as const,
    },
    Title: {
        fontFamily: "Poppins-Bold",
        fontSize: 24,
        fontWeight: "bold" as const,
    },
    SubTitle: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 18,
        fontWeight: "600" as const,
    },
    Body: {
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        fontWeight: "normal" as const,
    },
    Caption: {
        fontFamily: "Poppins-Light",
        fontSize: 12,
        fontWeight: "300" as const,
    },
    ButtonText: {
        fontFamily: "Poppins-Bold",
        fontSize: 16,
        fontWeight: "bold" as const,
    },
    Overline: {
        fontFamily: "Poppins-Regular",
        fontSize: 10,
        fontWeight: "normal" as const,
        textTransform: "uppercase" as const,
    },
};
