import {Image, StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useGoogleLoginMutation } from '@/hooks/useGoogleLoginMutation';
import { useRouter } from "expo-router";
import {storeToken} from "@/hooks/useLoginMutation";
import {useTranslation} from "react-i18next";
import uri from "ajv/lib/runtime/uri";
import {useTheme} from "@/context/ThemeContext";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInButton() {
    const {t} = useTranslation();
    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: 'YOUR_IOS_CLIENT_ID',
        androidClientId: 'YOUR_ANDROID_CLIENT_ID',
        webClientId: '771980441176-vccdtqspu14k36ulpprcimgg0rm50u9k.apps.googleusercontent.com',
        responseType: 'id_token'
    });

    const { mutate: loginWithGoogle, isPending, isError, error } = useGoogleLoginMutation();
    const router = useRouter();
    const { colors } = useTheme();
    const handleGoogleLogin = async () => {
        const response = await promptAsync?.();

        if (response?.type === "success" && response?.params?.id_token) {
            loginWithGoogle({ id_token: response.params.id_token }, {
                onSuccess: (data) => {
                    if (data?.token) {
                        storeToken(data.token);
                        router.push("/");
                    }
                },
                onError: (err) => {
                    console.error("Login failed with error:", err);
                }
            });
        } else {
            console.error("Google Login Failed or Cancelled");
        }
    };

    return (
        <View>
            <TouchableOpacity style={[styles.button,{backgroundColor: colors.background, borderColor: colors.border}]} activeOpacity={0.7} onPress={handleGoogleLogin}>
                <View style={styles.buttonContentWrapper}>
                    <View style={styles.iconWrapper}>
                        <Image source={{uri:'https://img.icons8.com/color/96/google-logo.png'}} style={styles.icon}/>
                    </View>
                    <Text style={[styles.buttonText, {color: colors.text}]}>{t("login.continueWithGoogle")}</Text>
                </View>
            </TouchableOpacity>
            {isError && <Text style={{ color: 'red' }}>Error: {error?.message}</Text>}
        </View>
    );
}
const styles = StyleSheet.create({
    button: {
        borderRadius: 20,
        borderWidth: 1,
        height: 40,
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        maxWidth: 400,
        minWidth: 'auto',
        marginBottom: 10,
    },
    buttonContentWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    iconWrapper: {
        marginRight: 12,
        height: 20,
        width: 20,
    },
    icon: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
    },
    buttonText: {
        flexGrow: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#1f1f1f',
        letterSpacing: 0.25,
        textAlign: 'center',
    },
});