import {StyleSheet} from 'react-native';
import {ThemedText} from "@/components/base/ThemedText";
import {useTheme} from '@/context/ThemeContext';
import {Redirect, Stack, useRouter} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {LinearGradient} from "expo-linear-gradient";
import React from "react";
import {useTranslation} from "react-i18next";
import {Row} from "@/components/base/Row";
import {LanguageDropdown} from "@/components/base/LanguageDropdown";
import {ThemeToggleButton} from "@/components/base/ThemeToggleButton";
import {ThemedButtonIcon} from "@/components/base/ThemedButtonIcon";
import TabBar from "@/components/base/TabBar";
import NavBar from "@/components/base/NavBar";
import {InnerContainer} from "@/components/base/InnerContainer";
import {useUser} from "@/context/UserContext";

import {useFetchQuery} from "@/hooks/repository/useFetchQuery";
import {BlinkList} from "@/components/base/BlinkList";
import {useBlinksQuery} from "@/hooks/interfaces/useBlinkInterface"
import { BlinkType } from '@/types/BlinksType';
import { UseInfiniteQueryResult } from '@tanstack/react-query';


export default function Index() {
    const {colors} = useTheme();
    const {user} = useUser();
    const {t} = useTranslation();
    const router = useRouter();
    const gradientColors = colors.gradient;
    const blinkID = "65826765-e2f8-4e92-aa03-ed7b8d226222"
    const BlinkData = useFetchQuery(`/blinks/${blinkID}`, ["Blinks"]);

    return (
        <>
            <Stack.Screen/>
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={gradientColors} style={styles.background}>
                    <InnerContainer>
                        <NavBar/>
                        <ThemedText variant={"Title"} color={colors.text}>
                            Home
                        </ThemedText>
                        <ThemedButtonIcon
                            text="Go to Login"
                            onPress={() => router.push("/login")}
                            iconName={"circled-left--v2"}
                        />

                        <BlinkList/>
                        <Row gap={12}>
                            <LanguageDropdown/>
                            <ThemeToggleButton/>
                        </Row>
                    </InnerContainer>
                </LinearGradient>
                <TabBar/>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    innerContainer: {
        maxWidth: 1536,
        width: "100%",
        paddingHorizontal: 8,
        flex: 1
    },
    background: {
        flex: 1,
        alignItems: 'center',
    },
});
