import { StatusBar } from "expo-status-bar";
import { NavigationContainer, NavigationProp } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
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

// Catatan: Pada React Native Android, Firebase diinisialisasi secara otomatis
// melalui file google-services.json saat aplikasi pertama kali dijalankan.

import { initializeMobileAds } from "./services/admobService";
import { useAppSelector } from "./hooks/useRedux";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Game: undefined;
  CrashGame: undefined;
  WheelGame: undefined;
  SlotGame: undefined;
  SuitGame: undefined;
  Result: {
    winner: boolean;
    result: number;
    baseNumber: number;
    choice: "higher" | "lower";
    explanation?: string;
  };
};

export type StackNavigation = NavigationProp<RootStackParamList>;
const Stack = createStackNavigator<RootStackParamList>();

const MainApp = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName={user ? "Home" : "Login"}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "#0B121E" },
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Game" component={Game} />
        <Stack.Screen name="CrashGame" component={CrashGame} />
        <Stack.Screen name="WheelGame" component={WheelGame} />
        <Stack.Screen name="SlotGame" component={SlotGame} />
        <Stack.Screen name="SuitGame" component={SuitGame} />
        <Stack.Screen name="Result" component={Result} />
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
          webClientId:
            "392591531045-s08rbnllclp4q96vsii18j6h2mftpk06.apps.googleusercontent.com",
          offlineAccess: true,
        });
      }
    } catch (e) {
      // Di Expo Go, GoogleSignin native tidak aktif
    }

    // Inisialisasi Mobile Ads secara aman (hanya di APK / EAS build, abaikan di Expo Go)
    initializeMobileAds();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MainApp />
      </PersistGate>
    </Provider>
  );
}
