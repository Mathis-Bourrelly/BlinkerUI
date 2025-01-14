import {StyleSheet, TextInput} from "react-native";
import {Row} from "@/components/Row";
import {useThemeColors} from "@/hooks/useThemeColors";

type Props = {
    value: string,
    onChange: (value: string) => void,
    placeholder?: string
}

export function ThemedTextInput({value, onChange, placeholder}: Props) {
    const colors = useThemeColors()
    return <Row style={[styles.wrapper, {backgroundColor: colors.text}]}>
        <TextInput style={styles.input} onChangeText={onChange} value={value} placeholder={placeholder}/>
    </Row>
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        borderRadius: 20,
        height: 32,
        marginVertical:6,
    },
    input: {
        flex: 1,
        height: 32,
        borderRadius: 20,
        fontSize: 16,
        padding: 16,
    }
})