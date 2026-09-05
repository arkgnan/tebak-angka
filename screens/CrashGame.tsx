import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigation } from "../App";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { playCrashRound } from "../store/slices/gameSlice";
import AdRewardModal from "../components/AdRewardModal";

type GameStatus = "idle" | "flying" | "cashed_out" | "crashed";

export default function CrashGame() {
  const { navigate, goBack } = useNavigation<StackNavigation>();
  const dispatch = useAppDispatch();
  const { credits } = useAppSelector((state) => state.game);

  const [status, setStatus] = useState<GameStatus>("idle");
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [crashPoint, setCrashPoint] = useState<number>(1.0);
  const [earnedMultiplier, setEarnedMultiplier] = useState<number>(0);
  const [recentCrashes, setRecentCrashes] = useState<number[]>([
    1.12, 1.05, 2.45, 1.02, 1.88,
  ]);
  const [showAdModal, setShowAdModal] = useState(false);

  // Animasi Roket
  const rocketAnimY = useRef(new Animated.Value(0)).current;
  const rocketScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Interval referensi
  const flightInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Animasi denyut idle
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => {
      if (flightInterval.current) clearInterval(flightInterval.current);
    };
  }, []);

  const calculateBandarCrashPoint = (): number => {
    // ALGORITMA BANDAR CRASH (HOUSE EDGE):
    // 35% ledakan instan sangat rendah (1.01x - 1.15x)
    // 45% ledakan rendah-menengah (1.16x - 1.95x)
    // 20% umpan tinggi sesekali (2.00x - 4.50x)
    const roll = Math.random();
    if (roll < 0.35) {
      return +(1.01 + Math.random() * 0.14).toFixed(2);
    } else if (roll < 0.8) {
      return +(1.16 + Math.random() * 0.79).toFixed(2);
    } else {
      return +(2.0 + Math.random() * 2.5).toFixed(2);
    }
  };

  const startFlight = () => {
    if (credits <= 0) {
      setShowAdModal(true);
      return;
    }

    const predeterminedCrash = calculateBandarCrashPoint();
    setCrashPoint(predeterminedCrash);
    setMultiplier(1.0);
    setStatus("flying");
    setEarnedMultiplier(0);

    // Animasi roket lepas landas
    Animated.parallel([
      Animated.timing(rocketAnimY, {
        toValue: -60,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(rocketScale, {
        toValue: 1.25,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    let currentMult = 1.0;
    const intervalMs = 60; // Update setiap 60ms

    if (flightInterval.current) clearInterval(flightInterval.current);

    flightInterval.current = setInterval(() => {
      // Kecepatan kenaikan multiplier eksponensial halus
      const increment = 0.01 + currentMult * 0.008;
      currentMult = +(currentMult + increment).toFixed(2);

      if (currentMult >= predeterminedCrash) {
        // ROKET MELEDAK
        if (flightInterval.current) clearInterval(flightInterval.current);
        setMultiplier(predeterminedCrash);
        setStatus("crashed");

        // Simpan riwayat
        setRecentCrashes((prev) => [predeterminedCrash, ...prev.slice(0, 5)]);

        // Animasi ledakan
        Animated.sequence([
          Animated.timing(rocketScale, {
            toValue: 1.6,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.timing(rocketScale, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();

        dispatch(
          playCrashRound({
            cashedOut: false,
            multiplier: currentMult,
            crashPoint: predeterminedCrash,
          }),
        );
      } else {
        setMultiplier(currentMult);
      }
    }, intervalMs);
  };

  const handleCashOut = () => {
    if (status !== "flying") return;

    if (flightInterval.current) clearInterval(flightInterval.current);
    const finalEarned = multiplier;
    setEarnedMultiplier(finalEarned);
    setStatus("cashed_out");

    setRecentCrashes((prev) => [finalEarned, ...prev.slice(0, 5)]);

    dispatch(
      playCrashRound({
        cashedOut: true,
        multiplier: finalEarned,
        crashPoint: crashPoint,
      }),
    );
  };

  const handleResetToIdle = () => {
    setStatus("idle");
    setMultiplier(1.0);
    rocketAnimY.setValue(0);
    rocketScale.setValue(1);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Atas */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => goBack()}>
            <Text style={styles.backBtnText}>← Kembali</Text>
          </TouchableOpacity>

          <View style={styles.creditBadge}>
            <Text style={styles.creditBadgeLabel}>KREDIT: </Text>
            <Text style={styles.creditBadgeValue}>{credits}</Text>
          </View>
        </View>

        {/* Banner Riwayat Ledakan Terakhir */}
        <View style={styles.historyBar}>
          <Text style={styles.historyLabel}>Titik Ledak Terakhir:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.historyChips}
          >
            {recentCrashes.map((val, idx) => (
              <View
                key={idx}
                style={[
                  styles.chip,
                  val >= 2.0
                    ? styles.chipHigh
                    : val >= 1.2
                    ? styles.chipMid
                    : styles.chipLow,
                ]}
              >
                <Text style={styles.chipText}>{val.toFixed(2)}x</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Layar Terbang Roket */}
        <View
          style={[
            styles.gameScreen,
            status === "crashed" && styles.screenCrashed,
            status === "cashed_out" && styles.screenWon,
          ]}
        >
          {/* Label Multiplier Besar */}
          <Text
            style={[
              styles.multiplierText,
              status === "crashed"
                ? styles.textCrashed
                : status === "cashed_out"
                ? styles.textWon
                : multiplier > 2.0
                ? styles.textHigh
                : styles.textNormal,
            ]}
          >
            {status === "crashed"
              ? `💥 ${multiplier.toFixed(2)}x`
              : `${multiplier.toFixed(2)}x`}
          </Text>

          {/* Subtext Status */}
          <Text style={styles.statusSubtext}>
            {status === "idle" && "Tekan 'Luncurkan' untuk memulai ronde"}
            {status === "flying" && "Tarik saldo sebelum roket meledak!"}
            {status === "cashed_out" &&
              `🎉 AMBIL UNTUNG! Menang ${earnedMultiplier.toFixed(2)}x`}
            {status === "crashed" &&
              `💀 MELEDAK DI ${crashPoint.toFixed(2)}x (RUNGKAD)`}
          </Text>

          {/* Animasi Ikon Roket */}
          <Animated.View
            style={[
              styles.rocketContainer,
              {
                transform: [
                  { translateY: rocketAnimY },
                  { scale: status === "idle" ? pulseAnim : rocketScale },
                ],
              },
            ]}
          >
            <Text style={styles.rocketIcon}>
              {status === "crashed" ? "💥" : status === "cashed_out" ? "💰" : "🚀"}
            </Text>
          </Animated.View>
        </View>

        {/* Tombol Aksi Utama */}
        <View style={styles.controls}>
          {status === "idle" && (
            <TouchableOpacity
              style={[
                styles.btnLaunch,
                credits === 0 && styles.btnDisabled,
              ]}
              onPress={startFlight}
            >
              <Text style={styles.btnLaunchText}>
                🚀 LUNCURKAN ROKET (-1 Kredit)
              </Text>
            </TouchableOpacity>
          )}

          {status === "flying" && (
            <TouchableOpacity
              style={styles.btnCashout}
              onPress={handleCashOut}
            >
              <Text style={styles.btnCashoutLabel}>TARIK SALDO SEKARANG</Text>
              <Text style={styles.btnCashoutValue}>
                +{(multiplier).toFixed(2)} Kredit
              </Text>
            </TouchableOpacity>
          )}

          {(status === "crashed" || status === "cashed_out") && (
            <TouchableOpacity
              style={styles.btnPlayAgain}
              onPress={handleResetToIdle}
            >
              <Text style={styles.btnPlayAgainText}>
                {credits > 0 ? "Putaran Berikutnya →" : "+ Top Up Kredit"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Kotak Edukasi Pembongkar Trik Bandar */}
        <View style={styles.educationCard}>
          <Text style={styles.educationTitle}>
            🧠 BONGKAR TRIK GAME CRASH / AVIATOR:
          </Text>
          <Text style={styles.educationText}>
            1. **Ilusi Kontrol**: Kamu merasa bisa mengendalikan kemenangan dengan menekan tombol tarik saldo, padahal bandar sudah menetapkan titik ledak (*crash point*) di server sejak tombol 'Luncurkan' diklik!
            {"\n\n"}
            2. **Jebakan Keserakahan**: Bandar sengaja menaikkan angka secara perlahan untuk memancing rasa tamakmu. Saat kamu berniat menunggu ke 2.0x, roket sudah diatur meledak di 1.95x!
          </Text>
        </View>
      </ScrollView>

      <AdRewardModal
        visible={showAdModal}
        onClose={() => setShowAdModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B121E",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 48,
    alignItems: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: "#162032",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#23334F",
  },
  backBtnText: {
    color: "#8FA3BF",
    fontSize: 13,
    fontWeight: "700",
  },
  creditBadge: {
    backgroundColor: "#132338",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00E5FF",
  },
  creditBadgeLabel: {
    color: "#8FA3BF",
    fontSize: 11,
    fontWeight: "800",
  },
  creditBadgeValue: {
    color: "#00E5FF",
    fontSize: 16,
    fontWeight: "900",
  },
  historyBar: {
    width: "100%",
    marginBottom: 16,
  },
  historyLabel: {
    color: "#6D82A0",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
  },
  historyChips: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipLow: {
    backgroundColor: "#2B141E",
    borderColor: "#FF5252",
  },
  chipMid: {
    backgroundColor: "#2B2414",
    borderColor: "#FFB300",
  },
  chipHigh: {
    backgroundColor: "#122B22",
    borderColor: "#00E676",
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  gameScreen: {
    width: "100%",
    height: 240,
    backgroundColor: "#101828",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#1E2C44",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    position: "relative",
    overflow: "hidden",
  },
  screenCrashed: {
    borderColor: "#FF3D00",
    backgroundColor: "#1F1017",
  },
  screenWon: {
    borderColor: "#00E676",
    backgroundColor: "#0D241E",
  },
  multiplierText: {
    fontSize: 52,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 4,
  },
  textNormal: {
    color: "#00E5FF",
  },
  textHigh: {
    color: "#FFD700",
  },
  textWon: {
    color: "#00E676",
  },
  textCrashed: {
    color: "#FF3D00",
  },
  statusSubtext: {
    color: "#8FA3BF",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  rocketContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  rocketIcon: {
    fontSize: 48,
  },
  controls: {
    width: "100%",
    marginBottom: 20,
  },
  btnLaunch: {
    backgroundColor: "#00E5FF",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  btnLaunchText: {
    color: "#0B121E",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  btnDisabled: {
    backgroundColor: "#42566E",
    shadowOpacity: 0,
  },
  btnCashout: {
    backgroundColor: "#00E676",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#00E676",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  btnCashoutLabel: {
    color: "#051A10",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  btnCashoutValue: {
    color: "#051A10",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
  },
  btnPlayAgain: {
    backgroundColor: "#16253B",
    borderWidth: 1.5,
    borderColor: "#00E5FF",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  btnPlayAgainText: {
    color: "#00E5FF",
    fontSize: 15,
    fontWeight: "800",
  },
  educationCard: {
    backgroundColor: "#141C2B",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: "#FF9800",
  },
  educationTitle: {
    color: "#FFB74D",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
  },
  educationText: {
    color: "#CFDCEB",
    fontSize: 12,
    lineHeight: 18,
  },
});
