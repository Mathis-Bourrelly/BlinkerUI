import {StyleSheet, Text, type TextProps} from "react-native";
import {Colors} from "@/constants/Colors";
import {useThemeColors} from "@/hooks/useThemeColors";

const styles = StyleSheet.create({
    Title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    SubTitle: {
        fontSize: 12,
        fontWeight: "bold",
    }
})

type Props = TextProps & {
    variant?: keyof typeof styles;
    color?: keyof typeof Colors["light"];
}

export function ThemedText({variant, color, ...rest}: Props) {
    const colors = useThemeColors()
    // @ts-ignore
    return <Text style={[styles[variant ?? "Title"],{color:colors[color  ?? "text" ]}]}{...rest}/>
}

