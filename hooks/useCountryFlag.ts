export function useCountryFlag(countryCode: string, size: number = 48): string {
    const baseUrl = "https://img.icons8.com/color";
    
    // Mapping des codes de langue aux codes de pays pour les drapeaux
    const countryMapping: Record<string, string> = {
        'fr': 'france',
        'en': 'great-britain',
        'jp': 'japan'
    };
    
    const country = countryMapping[countryCode] || 'france'; // Par défaut, utiliser le drapeau français
    
    return `${baseUrl}/${size}/${country}.png`;
}
