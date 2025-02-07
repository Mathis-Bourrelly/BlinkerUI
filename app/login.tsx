import React, {useState} from 'react';
import {StyleSheet, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {LinearGradient} from "expo-linear-gradient";
import {useTheme} from '@/context/ThemeContext';
import {useTranslation} from 'react-i18next';
import {LoginForm} from "@/components/forms/LoginForm";
import {RegisterForm} from "@/components/forms/RegisterForm";
import {Row} from "@/components/base/Row";
import {ThemedFullLogo} from "@/components/images/ThemedFullLogo";
import {Stack} from "expo-router";
import {ThemedText} from "@/components/base/ThemedText";
import {LanguageDropdown} from "@/components/base/LanguageDropdown";
import {ThemeToggleButton} from "@/components/base/ThemeToggleButton";


export default function Index() {
    const [message, setMessage] = useState<string | null>(null); // État pour le message
    const {colors} = useTheme();
    const {t} = useTranslation();
    const gradientColors = colors.gradient;
    const [isRegister, setIsRegister] = useState<boolean>(false);

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
                        <ThemedFullLogo/>
                    </View>

                    {message && (
                        <View style={[styles.messageContainer, {backgroundColor: message.includes('ERROR') ? colors.dangerbg : colors.validebg}]}>
                            <ThemedText variant={"Body"}>
                                {message.replace("ERROR","")}
                            </ThemedText>
                        </View>
                    )}
                    <View>
                        {!isRegister && (
                            <View style={styles.register}>
                                <LoginForm onMessage={handleMessage}/>
                                <ThemedText onPress={() => {
                                    setIsRegister(true)
                                }} variant={"Underline"}>{t('login.noAccount')}</ThemedText>
                            </View>
                        )}
                        {isRegister && (<View style={styles.register}>
                                <RegisterForm onMessage={handleMessage}/>
                                <ThemedText onPress={() => {
                                    setIsRegister(false)
                                }} variant={"Underline"}>{t('login.alreadyAccount')}</ThemedText>
                            </View>
                        )}
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
    register: {
        alignItems: 'center',
        marginVertical: 10
    },
    logo_title: {
        flexDirection: "row",
        alignItems: "center",
        alignContent: "center",
        width: "80%",
        marginTop: 60,
        marginBottom: 100,
    },
    messageContainer: {
        margin: 20,
        paddingHorizontal: 10,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
});
