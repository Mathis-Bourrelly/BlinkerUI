import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {ThemedText} from "@/components/base/ThemedText";


export default function Index() {
    return (
        <View style={styles.container}>
            <ThemedText variant={"Title"} >Home</ThemedText>
            <ActivityIndicator size="large" color="#0000ff"/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
