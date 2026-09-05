import React, { useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Animated,
  View,
} from "react-native";

interface AnimatedButtonProps {
  action: "higher" | "lower" | string;
  onPress: () => void;
  disabled?: boolean;
}

export default function AnimatedButton({
  action,
  onPress,
  disabled = false,
}: AnimatedButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const isHigher = action === "higher";

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.button,
          isHigher ? styles.buttonGreen : styles.buttonRed,
          disabled && styles.buttonDisabled,
          { transform: [{ scale }] },
        ]}
      >
        <Text style={styles.icon}>{isHigher ? "▲" : "▼"}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.buttonMainText}>
            {isHigher ? "LEBIH TINGGI" : "LEBIH RENDAH"}
          </Text>
          <Text style={styles.buttonSubText}>
            {isHigher ? "Tebak angka > awal" : "Tebak angka < awal"}
          </Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 22,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonGreen: {
    backgroundColor: "#00C853",
    borderColor: "#69F0AE",
    borderWidth: 1.5,
    shadowColor: "#00E676",
  },
  buttonRed: {
    backgroundColor: "#D50000",
    borderColor: "#FF5252",
    borderWidth: 1.5,
    shadowColor: "#FF1744",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  icon: {
    fontSize: 26,
    color: "#FFFFFF",
    fontWeight: "900",
  },
  textContainer: {
    alignItems: "flex-start",
  },
  buttonMainText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  buttonSubText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 11,
    fontWeight: "600",
  },
});