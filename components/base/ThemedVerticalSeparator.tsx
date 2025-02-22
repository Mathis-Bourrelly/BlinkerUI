import {View, ViewProps, ViewStyle} from "react-native";
import {useTheme} from "@/context/ThemeContext";

type VerticalProps = ViewProps & {
    barColor?: string;
    height?: number;
};

export function ThemedVerticalSeparator({ barColor, height = 50, ...rest }: VerticalProps) {
    const { colors } = useTheme();

    return (
        <View
            style={[
                verticalStyle,
                { backgroundColor: barColor ?? colors.text, height: height }
            ]}
            {...rest}
        />
    );
}

const verticalStyle: ViewStyle = {
    width: 1,
    alignSelf: "center",
};
