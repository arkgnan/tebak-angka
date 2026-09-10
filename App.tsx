import { StatusBar } from "expo-status-bar";
import { NavigationContainer, NavigationProp, DarkTheme } from "@react-navigation/native";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import { useEffect } from "react";
import Home from "./screens/Home";
import Game from "./screens/Game";
import Result from "./screens/Result";
import Login from "./screens/Login";
import CrashGame from "./screens/CrashGame";
import WheelGame from "./screens/WheelGame";
import SlotGame from "./screens/SlotGame";
import SuitGame from "./screens/SuitGame";
import QuizScreen from "./screens/QuizScreen";

// Catatan: Pada React Native Android, Firebase diinisialisasi secara otomatis
// melalui file google-services.json saat aplikasi pertama kali dijalankan.

import { initializeMobileAds } from "./services/admobService";
import { initAudio } from "./services/soundService";
import { initDailyNotification } from "./services/notificationService";
import { useAppSelector } from "./hooks/useRedux";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Game: undefined;
  CrashGame: undefined;
  WheelGame: undefined;
  SlotGame: undefined;
  SuitGame: undefined;
  QuizScreen: undefined;
  Result: {
    winner: boolean;
    gameType?: "higher-lower" | "suit";
    result?: number;
    baseNumber?: number;
    choice?: "higher" | "lower";
    playerChoice?: "rock" | "paper" | "scissors";
    bandarChoice?: "rock" | "paper" | "scissors";
    isDraw?: boolean;
    rewardCredits?: number;
    title?: string;
    explanation?: string;
  };
};

export type StackNavigation = NavigationProp<RootStackParamList>;
const Stack = createStackNavigator<RootStackParamList>();

const appNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0B121E",
    card: "#0B121E",
  },
};

const MainApp = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <NavigationContainer theme={appNavTheme}>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName={user ? "Home" : "Login"}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "#0B121E" },
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
          animationEnabled: true,
          detachPreviousScreen: false,
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Game" component={Game} />
        <Stack.Screen name="CrashGame" component={CrashGame} />
        <Stack.Screen name="WheelGame" component={WheelGame} />
        <Stack.Screen name="SlotGame" component={SlotGame} />
        <Stack.Screen name="SuitGame" component={SuitGame} />
        <Stack.Screen name="QuizScreen" component={QuizScreen} />
        <Stack.Screen
          name="Result"
          component={Result}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
            detachPreviousScreen: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  useEffect(() => {
    try {
      const { GoogleSignin } = require("@react-native-google-signin/google-signin");
      if (GoogleSignin?.configure) {
        GoogleSignin.configure({
          webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "",
          offlineAccess: true,
        });
      }
    } catch (e) {
      // Di Expo Go, GoogleSignin native tidak aktif
    }

    // Inisialisasi Mobile Ads secara aman (hanya di APK / EAS build, abaikan di Expo Go)
    initializeMobileAds();

    // Inisialisasi dan preload efek suara
    initAudio();

    // Inisialisasi pengingat edukasi harian (19:00 WIB)
    initDailyNotification();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MainApp />
      </PersistGate>
    </Provider>
  );
}
