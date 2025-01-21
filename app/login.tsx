import {StyleSheet, Text, Image, View, TextInput, Button, ActivityIndicator} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {ThemedText} from "@/components/base/ThemedText";
import {LinearGradient} from "expo-linear-gradient";
import {LoginForm} from "@/components/forms/LoginForm";
import {RegisterForm} from "@/components/forms/RegisterForm";
import {Row} from "@/components/base/Row";
import {useState} from "react";
import {useTheme} from '@/context/ThemeContext';
import {useTranslation} from 'react-i18next';
import {ThemedLogo} from "@/components/images/ThemedLogo";
import {ThemedTitle} from "@/components/images/ThemedTitle";
import {Stack} from "expo-router";


export default function Index() {
    const [message, setMessage] = useState<string | null>(null); // État pour le message
    const {colors, toggleTheme} = useTheme();
    const gradientColors = colors.gradient;
    const {t, i18n} = useTranslation();

    const handleMessage = (msg: string) => {
        setMessage(msg);
        setTimeout(() => setMessage(null), 30 * 1000); // Effacer le message après 30 secondes
    };

    return (
        <>
            <Stack.Screen options={{title: 'Oops!'}}/>
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={gradientColors} style={styles.background}>
                    <View style={styles.logo_title}>
                        <ThemedLogo/>
                        <ThemedTitle/>
                    </View>
                    <Button title="English" onPress={() => i18n.changeLanguage('en')}/>
                    <Button title="Français" onPress={() => i18n.changeLanguage('fr')}/>
                    <Button title="日本語" onPress={() => i18n.changeLanguage('jp')}/>
                    <Button title="Toggle Theme" onPress={toggleTheme}/>
                    {(<View
                        style={[
                            styles.messageContainer,
                            {
                                backgroundColor: message ? (message.includes('Error') ? colors.dangerbg : colors.validebg) : 'transparent',
                                height: message ? undefined : 42,  // Réserve 42 unités si aucun message
                            }
                        ]}
                    >
                        <ThemedText variant={"Title"} color={message?.includes('Error') ? "danger" : "valide"}>
                            {message || ' '} {/* Afficher un espace pour conserver la hauteur */}
                        </ThemedText>
                    </View>)}
                    <View>
                        <Row>
                            <LoginForm onMessage={handleMessage}/>
                            <RegisterForm onMessage={handleMessage}/>
                        </Row>
                    </View>
                </LinearGradient>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center', //Centered vertically
    },
    background: {
        flex: 1,
        alignItems: 'center', //Centered horizontally
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
        width: 'auto',
        alignItems: 'center',
        borderRadius: 8,
    }
});

