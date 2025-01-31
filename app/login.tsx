import React, {useState} from 'react';
import {StyleSheet, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {LinearGradient} from "expo-linear-gradient";
import {useTheme} from '@/context/ThemeContext';
import {useTranslation} from 'react-i18next';
import {LoginForm} from "@/components/forms/LoginForm";
import {RegisterForm} from "@/components/forms/RegisterForm";
import {Row} from "@/components/base/Row";
import {ThemedLogo} from "@/components/images/ThemedLogo";
import {ThemedTitle} from "@/components/images/ThemedTitle";
import {Stack} from "expo-router";
import {ThemedText} from "@/components/base/ThemedText";
import {LanguageDropdown} from "@/components/base/LanguageDropdown";
import {ThemeToggleButton} from "@/components/base/ThemeToggleButton";

export default function Index() {
    const [message, setMessage] = useState<string | null>(null); // État pour le message
    const {colors} = useTheme();
    const {t} = useTranslation();
    const gradientColors = colors.gradient;


    const handleMessage = (msg: string) => {
        setMessage(msg);
        setTimeout(() => setMessage(null), 30 * 1000); // Effacer le message après 30 secondes
    };

    return (
        <>
            <Stack.Screen options={{title: t('login')}}/>
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={gradientColors} style={styles.background}>
                    <View style={styles.logo_title}>
                        <ThemedLogo/>
                        <ThemedTitle/>
                    </View>

                    {message && (
                        <View
                            style={[
                                styles.messageContainer,
                                {
                                    backgroundColor: message.includes('Error') ? colors.dangerbg : colors.validebg,
                                },
                            ]}
                        >
                            <ThemedText variant={"Title"} color={colors.text}>
                                {message}
                            </ThemedText>
                        </View>
                    )}
                    <View>
                        <Row>
                            <LoginForm onMessage={handleMessage}/>
                            <RegisterForm onMessage={handleMessage}/>
                        </Row>
                    </View>
                    <Row gap={12}>
                        <LanguageDropdown/>
                        <ThemeToggleButton/>
                    </Row>
                </LinearGradient>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    background: {
        flex: 1,
        alignItems: 'center',
    },
    logo_title: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 60,
        marginBottom: 100,
    },
    messageContainer: {
        marginTop: 20,
        marginBottom: 20,
        paddingHorizontal: 40,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
});
