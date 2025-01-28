import './i18n'; // Assurez-vous d'importer avant d'utiliser d'autres composants
import {Stack} from "expo-router";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ThemeProvider} from '@/context/ThemeContext';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading'; // Pour un écran de chargement
import {useEffect, useState} from 'react';

const queryClient = new QueryClient();

async function loadFonts() {
    await Font.loadAsync({
        'Poppins-Light': require('@/assets/fonts/Poppins/Poppins-Light.ttf'),
        'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
        'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
        'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
    });
}

export default function RootLayout() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        loadFonts().then(() => setFontsLoaded(true));
    }, []);

    if (!fontsLoaded) {
        return <AppLoading/>;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="login" options={{ headerShown: false }} />
                </Stack>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
