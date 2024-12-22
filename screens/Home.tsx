import { Text, StyleSheet, Alert, View} from 'react-native'
import { GestureHandlerRootView, TapGestureHandler, State, LongPressGestureHandler } from 'react-native-gesture-handler';
import { StackNavigation } from '../App';
import { useNavigation } from '@react-navigation/native';

interface GestureEvent {
    nativeEvent: {
        state: number;
    };
}
export default function Home() {
    const { navigate } = useNavigation<StackNavigation>();
    function onLongPress(e: GestureEvent) {
        if (e.nativeEvent.state === State.ACTIVE) {
            navigate('Game');
        }
    }
    function onTap(e: GestureEvent) {
        if (e.nativeEvent.state === State.ACTIVE) {
            Alert.alert('Long press to start the game');
        }
    }
    return (
        <GestureHandlerRootView style={styles.container}>
            <TapGestureHandler onHandlerStateChange={onTap}>
                <LongPressGestureHandler onHandlerStateChange={onLongPress} minDurationMs={600}>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>Start Game!</Text>
                    </View>
                </LongPressGestureHandler>
            </TapGestureHandler>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        width: 300,
        height: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderRadius: 150,
        backgroundColor: 'purple',
    },
    buttonText: {
        color: 'white',
        fontSize: 48,
    },
});