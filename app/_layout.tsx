import './i18n'; // Ensure i18n is loaded first
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/context/ThemeContext';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading'; // For loading screen
import { NavigationContainer } from '@react-navigation/native';
import { Slot } from 'expo-router'; // This renders the current route/page content

const queryClient = new QueryClient();

// Load fonts asynchronously
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

    // Load fonts on mount
    useEffect(() => {
        loadFonts().then(() => setFontsLoaded(true));
    }, []);

    // If fonts are not loaded yet, show loading screen
    if (!fontsLoaded) {
        return <AppLoading />;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <NavigationContainer>
                    <Slot/>
                </NavigationContainer>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
