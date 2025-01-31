import {StyleSheet} from 'react-native';
import {ThemedText} from "@/components/base/ThemedText";
import {useTheme} from '@/context/ThemeContext';
import {Stack} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {LinearGradient} from "expo-linear-gradient";
import React from "react";
import {useTranslation} from "react-i18next";
import {Row} from "@/components/base/Row";
import {LanguageDropdown} from "@/components/base/LanguageDropdown";
import {ThemeToggleButton} from "@/components/base/ThemeToggleButton";


export default function Index() {
    const {colors} = useTheme();
    const {t} = useTranslation();
    const gradientColors = colors.gradient;

    return (
        <>
            <Stack.Screen options={{title: t('login')}}/>
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={gradientColors} style={styles.background}>
                    <ThemedText variant={"Title"} color={colors.text}>
                        Home
                    </ThemedText>
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
});
