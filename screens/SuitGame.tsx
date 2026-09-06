import React, { useState, useRef } from "react";
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
import { playSuitRound } from "../store/slices/gameSlice";
import AdRewardModal from "../components/AdRewardModal";

type ChoiceType = "rock" | "paper" | "scissors";

interface ChoiceOption {
  id: ChoiceType;
  label: string;
  icon: string;
  beats: ChoiceType;
  losesTo: ChoiceType;
}

const CHOICES: ChoiceOption[] = [
  {
    id: "rock",
    label: "Batu",
    icon: "🪨",
    beats: "scissors",
    losesTo: "paper",
  },
  {
    id: "paper",
    label: "Kertas",
    icon: "📄",
    beats: "rock",
    losesTo: "scissors",
  },
  {
    id: "scissors",
    label: "Gunting",
    icon: "✂️",
    beats: "paper",
    losesTo: "rock",
  },
];

export default function SuitGame() {
  const { goBack } = useNavigation<StackNavigation>();
  const dispatch = useAppDispatch();
  const { credits } = useAppSelector((state) => state.game);

  const [playerChoice, setPlayerChoice] = useState<ChoiceType>("rock");
  const [bandarDisplay, setBandarDisplay] = useState<string>("❓");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [lastRoundResult, setLastRoundResult] = useState<{
    winner: boolean;
    isDraw: boolean;
    rewardCredits: number;
    title: string;
    explanation: string;
  } | null>(null);

  // Animasi kocok tangan
  const bandarShakeAnim = useRef(new Animated.Value(0)).current;
  const playerShakeAnim = useRef(new Animated.Value(0)).current;

  const determineBandarOutcome = (
    player: ChoiceType
  ): {
    bandarChoice: ChoiceType;
    winner: boolean;
    isDraw: boolean;
    rewardCredits: number;
    title: string;
    explanation: string;
  } => {
    const playerOpt = CHOICES.find((c) => c.id === player)!;

    // PELUANG BANDAR ONLINE:
    // 82% Bandar Menang (Bandar sengaja memilih senjata yang mengalahkan pilihanmu)
    // 12% Seri (Draw - Balik Modal +1 Kredit)
    // 6% Bandar Mengalah (Umpan Menang - +2 Kredit)
    const roll = Math.random();

    if (roll < 0.06) {
      // 6% PEMAIN MENANG (Bandar memilih yang kalah dari pemain)
      const bandarChoice = playerOpt.beats;
      const bandarOpt = CHOICES.find((c) => c.id === bandarChoice)!;
      return {
        bandarChoice,
        winner: true,
        isDraw: false,
        rewardCredits: 2,
        title: `🎉 MENANG! ${playerOpt.icon} vs ${bandarOpt.icon} (+2 Kredit)`,
        explanation:
          "Umpan kemenangan dari bandar! Bandar sengaja mengalah sesekali agar kamu merasa 'jago' dan terdorong menaikkan nilai taruhan!",
      };
    } else if (roll < 0.18) {
      // 12% SERI (Bandar memilih simbol yang sama)
      const bandarChoice = player;
      return {
        bandarChoice,
        winner: false,
        isDraw: true,
        rewardCredits: 1,
        title: `🤝 HASIL SERI: ${playerOpt.icon} vs ${playerOpt.icon} (Balik Modal)`,
        explanation:
          "Hasil imbang, kreditmu dikembalikan. Ini teknik bandar memperpanjang durasi main agar pemain betah di aplikasi.",
      };
    } else {
      // 82% BANDAR MENANG (Bandar memilih senjata yang MENGALAHKAN pemain)
      const bandarChoice = playerOpt.losesTo;
      const bandarOpt = CHOICES.find((c) => c.id === bandarChoice)!;
      return {
        bandarChoice,
        winner: false,
        isDraw: false,
        rewardCredits: 0,
        title: `💀 KALAH! ${playerOpt.icon} vs ${bandarOpt.icon} (Rungkad)`,
        explanation:
          "Bandar sudah mengintip pilihanmu di server sebelum mengeluarkan tangannya! Inilah realitas judi online: server bandar yang menentukan hasil setelah membaca taruhanmu!",
      };
    }
  };

  const handlePlaySuit = () => {
    if (credits <= 0) {
      setShowAdModal(true);
      return;
    }

    if (isPlaying) return;

    setIsPlaying(true);
    setLastRoundResult(null);

    const outcome = determineBandarOutcome(playerChoice);

    // Animasi kocok tangan selama 1.6 detik
    const icons = ["🪨", "📄", "✂️"];
    let count = 0;
    const interval = setInterval(() => {
      setBandarDisplay(icons[count % 3]);
      count++;
    }, 100);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(bandarShakeAnim, {
          toValue: -14,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(bandarShakeAnim, {
          toValue: 14,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(bandarShakeAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(playerShakeAnim, {
          toValue: 14,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(playerShakeAnim, {
          toValue: -14,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(playerShakeAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setTimeout(() => {
      clearInterval(interval);
      const bandarOpt = CHOICES.find((c) => c.id === outcome.bandarChoice)!;
      setBandarDisplay(bandarOpt.icon);
      setIsPlaying(false);
      setLastRoundResult(outcome);

      dispatch(
        playSuitRound({
          playerChoice,
          bandarChoice: outcome.bandarChoice,
          winner: outcome.winner,
          isDraw: outcome.isDraw,
          rewardCredits: outcome.rewardCredits,
          explanation: outcome.explanation,
        })
      );
    }, 1600);
  };

  const selectedOpt = CHOICES.find((c) => c.id === playerChoice)!;

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

        <Text style={styles.title}>SUIT BANDAR LICIK</Text>
        <Text style={styles.subtitle}>
          Batu • Gunting • Kertas (Server Sudah Tahu Pilihanmu!)
        </Text>

        {/* Arena Adu Suit */}
        <View style={styles.arenaCabinet}>
          {/* Zona Bandar (Server) */}
          <View style={styles.fighterSection}>
            <View style={styles.fighterBadgeRed}>
              <Text style={styles.fighterBadgeText}>🤖 TANGAN BANDAR (SERVER)</Text>
            </View>
            <Animated.View
              style={[
                styles.fighterIconBox,
                { transform: [{ translateY: bandarShakeAnim }] },
              ]}
            >
              <Text style={styles.fighterIconLarge}>{bandarDisplay}</Text>
            </Animated.View>
            <Text style={styles.fighterSubtext}>
              {isPlaying
                ? "Menganalisis taruhan pemain di server..."
                : "Siap mengalahkan pilihanmu"}
            </Text>
          </View>

          {/* Garis Versus */}
          <View style={styles.vsContainer}>
            <View style={styles.vsLine} />
            <View style={styles.vsCircle}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <View style={styles.vsLine} />
          </View>

          {/* Zona Pemain */}
          <View style={styles.fighterSection}>
            <Animated.View
              style={[
                styles.fighterIconBox,
                { transform: [{ translateY: playerShakeAnim }] },
              ]}
            >
              <Text style={styles.fighterIconLarge}>{selectedOpt.icon}</Text>
            </Animated.View>
            <View style={styles.fighterBadgeCyan}>
              <Text style={styles.fighterBadgeText}>
                👤 PILIHANMU: {selectedOpt.label.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Hasil Pertandingan */}
        {lastRoundResult && (
          <View
            style={[
              styles.resultBox,
              lastRoundResult.winner
                ? styles.resultWon
                : lastRoundResult.isDraw
                ? styles.resultDraw
                : styles.resultLoss,
            ]}
          >
            <Text
              style={[
                styles.resultTitle,
                lastRoundResult.winner
                  ? { color: "#00E676" }
                  : lastRoundResult.isDraw
                  ? { color: "#00E5FF" }
                  : { color: "#FF5252" },
              ]}
            >
              {lastRoundResult.title}
            </Text>
            <Text style={styles.resultDetail}>{lastRoundResult.explanation}</Text>
          </View>
        )}

        {/* Pilihan Senjata Pemain */}
        <Text style={styles.pickTitle}>PASANG TARUHAN PILIHANMU:</Text>
        <View style={styles.choiceRow}>
          {CHOICES.map((item) => {
            const isSelected = playerChoice === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.choiceCard,
                  isSelected && styles.choiceCardActive,
                ]}
                onPress={() => !isPlaying && setPlayerChoice(item.id)}
                disabled={isPlaying}
                activeOpacity={0.7}
              >
                <Text style={styles.choiceIcon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.choiceLabel,
                    isSelected && styles.choiceLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
                {isSelected && (
                  <View style={styles.activeDot}>
                    <Text style={styles.activeDotText}>✓ Terpilih</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tombol Mulai Main */}
        <TouchableOpacity
          style={[
            styles.btnPlay,
            (isPlaying || credits === 0) && styles.btnDisabled,
          ]}
          onPress={handlePlaySuit}
          disabled={isPlaying}
        >
          <Text style={styles.btnPlayText}>
            {isPlaying
              ? "⚡ MENGADU HASIL DI SERVER..."
              : credits > 0
              ? `⚔️ ADU SUIT (-1 Kredit)`
              : "+ Top Up Kredit (Habis)"}
          </Text>
        </TouchableOpacity>

        {/* Kartu Edukasi */}
        <View style={styles.educationCard}>
          <Text style={styles.educationTitle}>
            🧠 BONGKAR TRIK: MENGAPA BANDAR SELALU MENANG?
          </Text>
          <Text style={styles.educationText}>
            1. **Taruhan Terkirim Dulu**: Dalam judi online, pilihanmu dikirim ke server sebelum hasil dikeluarkan. Bandar sudah mengetahui apa yang kamu pasang, lalu algoritmanya mengeluarkan lawan yang pasti mengalahkanmu!
            {"\n\n"}
            2. **Ilusi Peluang 50:50**: Di dunia nyata, suit memiliki peluang menang 33%. Namun di kasino online, peluang ini dipotong hingga di bawah 10% melalui manipulasi server.
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
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  backBtnText: {
    color: "#E1E7EF",
    fontSize: 14,
    fontWeight: "700",
  },
  creditBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 229, 255, 0.12)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#00E5FF",
  },
  creditBadgeLabel: {
    color: "#80DEEA",
    fontSize: 12,
    fontWeight: "800",
  },
  creditBadgeValue: {
    color: "#00E5FF",
    fontSize: 16,
    fontWeight: "900",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 18,
    textAlign: "center",
  },
  arenaCabinet: {
    width: "100%",
    backgroundColor: "#131C2E",
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#25334D",
    padding: 18,
    alignItems: "center",
    marginBottom: 16,
  },
  fighterSection: {
    alignItems: "center",
    width: "100%",
  },
  fighterBadgeRed: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
    marginBottom: 8,
  },
  fighterBadgeCyan: {
    backgroundColor: "rgba(0, 229, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00E5FF",
    marginTop: 8,
  },
  fighterBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  fighterIconBox: {
    width: 80,
    height: 80,
    backgroundColor: "#0A0F1A",
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  fighterIconLarge: {
    fontSize: 44,
  },
  fighterSubtext: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
  },
  vsContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    marginVertical: 12,
  },
  vsLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#334155",
  },
  vsCircle: {
    backgroundColor: "#E11D48",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 10,
  },
  vsText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  resultBox: {
    width: "100%",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  resultWon: {
    backgroundColor: "rgba(0, 230, 118, 0.12)",
    borderColor: "#00E676",
  },
  resultDraw: {
    backgroundColor: "rgba(0, 229, 255, 0.12)",
    borderColor: "#00E5FF",
  },
  resultLoss: {
    backgroundColor: "rgba(255, 82, 82, 0.12)",
    borderColor: "#FF5252",
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
    textAlign: "center",
  },
  resultDetail: {
    color: "#CFDCEB",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  pickTitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "800",
    alignSelf: "flex-start",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  choiceRow: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
    marginBottom: 16,
  },
  choiceCard: {
    flex: 1,
    backgroundColor: "#161F30",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#2B3950",
  },
  choiceCardActive: {
    borderColor: "#00E5FF",
    backgroundColor: "rgba(0, 229, 255, 0.12)",
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  choiceIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  choiceLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "800",
  },
  choiceLabelActive: {
    color: "#00E5FF",
    fontWeight: "900",
  },
  activeDot: {
    backgroundColor: "#00E5FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  activeDotText: {
    color: "#0B121E",
    fontSize: 9,
    fontWeight: "900",
  },
  btnPlay: {
    width: "100%",
    backgroundColor: "#E11D48",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#E11D48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 18,
  },
  btnPlayText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  btnDisabled: {
    backgroundColor: "#42566E",
    shadowOpacity: 0,
  },
  educationCard: {
    backgroundColor: "#141C2B",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: "#F43F5E",
  },
  educationTitle: {
    color: "#FDA4AF",
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
