import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { StackNavigation } from '../App';
import LottieView from 'lottie-react-native';
import { useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function Result() {
    const route = useRoute();
    const { navigate } = useNavigation<StackNavigation>();

    const { winner } = route.params as { winner: boolean };
    useEffect(() => {
        const backAction = () => {
            navigate('Home');
            return true;
        }
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);
    return (
        <View style={styles.container}>
            <Text style={styles.message}>You've {winner ? 'won' : 'lost'}</Text>
            {winner && (
                <LottieView
                    autoPlay
                    style={{width: 300, height: 300}}
                    source={require('../assets/winner.json')}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    message: {
        fontSize: 48,
    }
});