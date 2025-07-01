import {useWindowDimensions, View, ViewStyle} from 'react-native';
//@ts-ignore
export function InnerContainer({ children, ...rest }) {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const innerContainerStyle = [
        containerStyle,
        isDesktop && {
            width: '80%',
        },
    ];

    return (
        //@ts-ignore
        <View style={innerContainerStyle} {...rest}>
            {children}
        </View>
    );
}


const containerStyle = {
    maxWidth: 1536,
    width: "100%",
    paddingHorizontal: 8,
    flex: 1
} satisfies ViewStyle;