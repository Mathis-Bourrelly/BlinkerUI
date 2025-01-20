import {View, ViewProps, ViewStyle} from 'react-native';

type Props = ViewProps & {
    gap?: number;
}

export function Row ({style, gap, ...rest}: Props) {
    return <View style={[rowStyle, style, gap ? {gap:gap} : undefined]} {...rest}></View>
}

const rowStyle = {
    flex:1,
    flexDirection:'row',
} satisfies ViewStyle;