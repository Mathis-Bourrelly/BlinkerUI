import {Image, StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import { Buffer } from 'buffer';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useGoogleLoginMutation } from '@/hooks/useGoogleLoginMutation';
import { useUpdateProfileMutation } from '@/hooks/interfaces/useProfileInterface';
import { useRouter } from "expo-router";
import {storeToken} from "@/hooks/useSetToken";
import {useUser} from "@/context/UserContext";
import {useTranslation} from "react-i18next";
import {useTheme} from "@/context/ThemeContext";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInButton() {
    const {t} = useTranslation();
    const {storeUser} = useUser();
    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: 'YOUR_IOS_CLIENT_ID',
        androidClientId: 'YOUR_ANDROID_CLIENT_ID',
        webClientId: '771980441176-vccdtqspu14k36ulpprcimgg0rm50u9k.apps.googleusercontent.com',
        responseType: 'id_token'
    });

    const { mutate: loginWithGoogle, isPending, isError, error } = useGoogleLoginMutation();
    const router = useRouter();
    const { colors } = useTheme();
    // We'll use this mutation hook to update the profile with the Google avatar
    const { mutate: updateProfile } = useUpdateProfileMutation('current');
    // Function to fetch user profile data from Google
    const fetchUserInfo = async (accessToken: string) => {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching Google user info:', error);
            return null;
        }
    };

    const handleGoogleLogin = async () => {
        const response = await promptAsync?.();
        console.log('Google auth response:', response);

        if (response?.type === "success" && response?.params?.id_token) {
            // Get access token from response
            const accessToken = response.authentication?.accessToken;
            console.log('Google access token:', accessToken);
            let userProfilePicture = null;

            // If we have an access token, fetch the user profile to get the picture
            if (accessToken) {
                try {
                    const userInfo = await fetchUserInfo(accessToken);
                    console.log('Google user info:', userInfo);
                    if (userInfo?.picture) {
                        userProfilePicture = userInfo.picture;
                        console.log('Retrieved Google profile picture:', userProfilePicture);
                    }
                } catch (error) {
                    console.error('Error getting Google profile data:', error);
                }
            } else {
                // If we don't have an access token, try to get the picture from the id_token
                try {
                    // Decode the id_token to get user info
                    const idToken = response.params.id_token;
                    const tokenParts = idToken.split('.');
                    if (tokenParts.length === 3) {
                        // Base64 decode the payload part (index 1) using Buffer
                        const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
                        const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
                        const jsonPayload = Buffer.from(paddedBase64, 'base64').toString('utf8');

                        try {
                            const payload = JSON.parse(jsonPayload);
                            console.log('ID token payload:', payload);
                            if (payload.picture) {
                                userProfilePicture = payload.picture;
                                console.log('Retrieved Google profile picture from ID token:', userProfilePicture);
                            }
                        } catch (e) {
                            console.error('Error parsing ID token payload:', e);
                        }
                    }
                } catch (error) {
                    console.error('Error decoding ID token:', error);
                }
            }

            loginWithGoogle({ id_token: response.params.id_token }, {
                onSuccess: (data) => {
                    if (data?.token && data?.userID) {
                        // Store token and user data with profile picture
                        storeToken(data.token)
                            .then(() => storeUser({
                                userID: data.userID,
                                avatar_url: userProfilePicture
                            }))
                            .then(() => {
                                // Update the user's profile in the backend with the Google profile picture
                                if (userProfilePicture) {
                                    console.log('Updating profile with Google avatar for userID:', data.userID);
                                    // Use the updateProfile mutation we defined earlier
                                    updateProfile({
                                        userID: data.userID,
                                        avatar_url: userProfilePicture
                                    }, {
                                        onSuccess: (response) => {
                                            console.log('Successfully updated profile with Google avatar:', response);
                                        },
                                        onError: (err) => {
                                            console.error("Error updating profile with Google avatar:", err);
                                        }
                                    });
                                }
                                router.push("/");
                            })
                            .catch(err => console.error("Error storing Google auth data:", err));
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