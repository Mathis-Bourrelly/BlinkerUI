export function useIcons8(iconName: string,color: string, size: number = 48): string {
    const baseUrl = "https://img.icons8.com/material-rounded";
    const colorCode = color.substring(1)
    return `${baseUrl}/${size}/${colorCode}/${iconName}.png`;
}
