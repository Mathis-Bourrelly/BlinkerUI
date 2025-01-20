import './i18n'; // Assurez-vous d'importer avant d'utiliser d'autres composants
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from '@/context/ThemeContext';

const queryClient = new QueryClient();

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            />
            </ThemeProvider>
        </QueryClientProvider>
    );
}