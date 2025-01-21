export function useIcons8(iconName: string, size: number = 48): string {
    const baseUrl = "https://img.icons8.com/material-rounded";
    return `${baseUrl}/${size}/${iconName}.png`;
}
