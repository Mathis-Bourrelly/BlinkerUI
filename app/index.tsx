import {StyleSheet, Text, Image, View, TextInput, Button, ActivityIndicator} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {ThemedText} from "@/components/ThemedText";
import { LinearGradient } from "expo-linear-gradient";
import {Colors} from "@/constants/Colors";
import {LoginForm} from "@/components/LoginForm";


export default function Index() {

    const gradientColors = Colors.light.gradient;
    return (
    <SafeAreaView style={styles.container}>
        <LinearGradient colors={gradientColors} style={styles.background}>

        <View style={styles.logo_title}>
            <Image source={require("@/assets/images/logo dark.svg")}/>
            <Image source={require("@/assets/images/title dark.svg")}/>
            </View>
            <ThemedText variant={"Title"} color={"text"}> Connexion </ThemedText>
            <LoginForm/>
        </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    background: {
        flex: 1,
        alignItems: 'center',
        width:"100%",
    },
    logo_title: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20
    },
    textInput: {
        color: "white",
        borderColor: "white",
        borderWidth: 2,
        borderRadius: 10,
        backgroundColor: "gray"
    },
});
