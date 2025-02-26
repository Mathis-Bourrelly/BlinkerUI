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
import {getUserID} from "@/hooks/useLoginMutation";
import {useUser} from "@/context/UserContext";


export default function Index() {
    const {colors} = useTheme();
    const {user} = useUser();
    const {t} = useTranslation();
    const router = useRouter();
    const gradientColors = colors.gradient;
    console.log(user)
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
                        <ThemedButtonIcon
                            text="Go to Profile"
                            onPress={() => router.push(`/profile/${user.userID}`)}
                            iconName={"circled-left--v2"}
                        />
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
