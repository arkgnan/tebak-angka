import { Alert, Button, StyleSheet, Text, View, TouchableHighlight, } from "react-native";
import { StackNavigation } from '../App';
import { useEffect, useState } from "react";
import AnimatedButton from "../components/AnimatedButton";
import { useNavigation } from "@react-navigation/native";

export default function Game() {
    const { navigate } = useNavigation<StackNavigation>();

    const baseNumber = Math.floor(Math.random() * 100);
    const score = Math.floor(Math.random() * 100);
    const [choice, setChoice] = useState('');

    useEffect(() => {
        if (choice) {
            const winner = (choice === 'higher' && score > baseNumber) || (choice === 'lower' && score < baseNumber);
            Alert.alert(`You've ${winner ? 'won' : 'lost'}!`, `You scored: ${score}`);
            navigate('Result', { winner })
        }
    },[baseNumber, score, choice]);
    return (
        <View style={styles.container}>
            <Text style={styles.baseNumber}>Starting: {baseNumber}</Text>
            <AnimatedButton action='higher' onPress={() => setChoice('higher')} />
            <AnimatedButton action='lower' onPress={() => setChoice('lower')} />
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
    baseNumber: {
        fontSize: 48,
        marginBottom: 30,
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderRadius: 15,
        padding: 30,
        marginVertical: 15,
    },
    buttonRed: {
        backgroundColor: 'red',
    },
    buttonGreen: {
        backgroundColor: 'green',
    },
    buttonText: {
        color: 'white',
        fontSize: 24,
    },
});