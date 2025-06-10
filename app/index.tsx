import {StyleSheet, useWindowDimensions} from 'react-native';
import {useTheme} from '@/context/ThemeContext';
import {Stack} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {LinearGradient} from "expo-linear-gradient";
import React, { useState } from "react";
import TabBar from "@/components/feature/TabBar";
import NavBar from "@/components/feature/NavBar";
import {InnerContainer} from "@/components/base/InnerContainer";
import {BlinkList} from "@/components/feature/BlinkList";
import { FloatingActionButton } from "@/components/base/FloatingActionButton";
import CreateBlinkModal from "@/components/feature/CreateBlinkModal";


export default function Index() {
    const {colors} = useTheme();
    const { width } = useWindowDimensions();
    const gradientColors = colors.gradient;
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Déterminer si on est en format desktop
    const isDesktop = width > 768;

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            <Stack.Screen/>
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={gradientColors} style={styles.background}>
                    <InnerContainer>
                        <NavBar/>
                        <BlinkList/>
                        {/* Les options de langue et de thème sont maintenant dans le menu d'options de la NavBar */}
                    </InnerContainer>
                </LinearGradient>
                {/* FloatingActionButton seulement pour desktop */}
                {isDesktop && (
                    <FloatingActionButton
                        onPress={handleOpenModal}
                        iconName="plus"
                        size={60}
                    />
                )}
                <CreateBlinkModal
                    visible={isModalVisible}
                    onClose={handleCloseModal}
                />
                <TabBar onCreatePress={handleOpenModal} />
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
