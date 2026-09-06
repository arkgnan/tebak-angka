import React, { useState, useRef, useEffect } from "react";
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
import { playSlotRound } from "../store/slices/gameSlice";
import AdRewardModal from "../components/AdRewardModal";

interface SlotSymbol {
  icon: string;
  name: string;
}

const SYMBOLS: SlotSymbol[] = [
  { icon: "7️⃣", name: "Seven" },
  { icon: "💎", name: "Diamond" },
  { icon: "🔔", name: "Bell" },
  { icon: "🍒", name: "Cherry" },
  { icon: "🍋", name: "Lemon" },
  { icon: "💣", name: "Bomb" },
];

export default function SlotGame() {
  const { goBack } = useNavigation<StackNavigation>();
  const dispatch = useAppDispatch();
  const { credits } = useAppSelector((state) => state.game);

  const [reels, setReels] = useState<[string, string, string]>([
    "7️⃣",
    "7️⃣",
    "💣",
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [suspenseReel3, setSuspenseReel3] = useState(false);
  const [lastResult, setLastResult] = useState<{
    winner: boolean;
    isNearMiss: boolean;
    reward: number;
    title: string;
    detail: string;
  } | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);

  // Animasi Reel
  const reel1Anim = useRef(new Animated.Value(0)).current;
  const reel2Anim = useRef(new Animated.Value(0)).current;
  const reel3Anim = useRef(new Animated.Value(0)).current;
  const suspenseGlow = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (suspenseReel3) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(suspenseGlow, {
            toValue: 1.15,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(suspenseGlow, {
            toValue: 1.0,
            duration: 200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      suspenseGlow.setValue(1);
    }
  }, [suspenseReel3]);

  const determineSlotOutcome = (): {
    finalReels: [string, string, string];
    winner: boolean;
    isNearMiss: boolean;
    reward: number;
    title: string;
    detail: string;
  } => {
    // PELUANG SANGAT KECIL (HOUSE EDGE EKSTREM SLOT ONLINE):
    // 0.5% Jackpot 777 (7️⃣ 7️⃣ 7️⃣) -> +10 Kredit
    // 3.5% Jackpot Permata/Lonceng (💎💎💎 atau 🔔🔔🔔) -> +2 atau +3 Kredit
    // 6.0% Menang Kecil Ceri (🍒 🍒 [Acak]) -> +1 Kredit (Balik Modal)
    // 55.0% Trik 'Near-Miss Maxwin' (7️⃣ 7️⃣ 💣 atau 7️⃣ 7️⃣ 🍋)
    // 35.0% Zonk Rungkad Biasa (Campuran acak)
    const roll = Math.random();

    if (roll < 0.005) {
      // 0.5% JACKPOT 777
      return {
        finalReels: ["7️⃣", "7️⃣", "7️⃣"],
        winner: true,
        isNearMiss: false,
        reward: 10,
        title: "👑 MAXWIN JACKPOT 777! (+10 Kredit)",
        detail:
          "Luar biasa langka! Peluang ini hanya 0.5% (1 banding 200 putaran). Bandar hanya memberi ini sesekali untuk membuat tangkapan layar promosi!",
      };
    } else if (roll < 0.04) {
      // 3.5% Menang Lonceng / Diamond
      const isDiamond = Math.random() < 0.5;
      const symbol = isDiamond ? "💎" : "🔔";
      const reward = isDiamond ? 3 : 2;
      return {
        finalReels: [symbol, symbol, symbol],
        winner: true,
        isNearMiss: false,
        reward,
        title: `🎉 MENANG: 3x ${symbol} (+${reward} Kredit)`,
        detail:
          "Umpan kemenangan kecil! Bandar memberi sedikit kemenangan agar kamu merasa 'mesin sedang gacor' dan tidak berhenti.",
      };
    } else if (roll < 0.1) {
      // 6.0% Balik modal
      return {
        finalReels: ["🍒", "🍒", "🍋"],
        winner: false,
        isNearMiss: false,
        reward: 1,
        title: "🍒 SEPASANG CERI (Balik Modal +1 Kredit)",
        detail:
          "Kreditmu kembali utuh. Ini teknik bandar mengulur waktu agar saldo pemain naik-turun seimbang di awal sebelum akhirnya ludes!",
      };
    } else if (roll < 0.65) {
      // 55.0% EFEK NEAR-MISS 'NYARIS 777' (Scatter Bayangan)
      const missSymbol = Math.random() < 0.5 ? "💣" : "🍋";
      return {
        finalReels: ["7️⃣", "7️⃣", missSymbol],
        winner: false,
        isNearMiss: true,
        reward: 0,
        title: "😱 NYARIS MAXWIN 777! (Zonk)",
        detail:
          "Reel 1 & 2 keluar 7️⃣, tapi reel ke-3 sengaja dihentikan pada bom/lemon! Otakmu dibanjiri ilusi seolah 'sedikit lagi jackpot', padahal algoritma sudah menguncinya kalah!",
      };
    } else {
      // 35.0% Rungkad Biasa
      const zonks: [string, string, string][] = [
        ["💣", "🍋", "🍒"],
        ["🍋", "💣", "🔔"],
        ["🔔", "💣", "7️⃣"],
        ["💣", "💣", "🍋"],
      ];
      const picked = zonks[Math.floor(Math.random() * zonks.length)];
      return {
        finalReels: picked,
        winner: false,
        isNearMiss: false,
        reward: 0,
        title: "💀 RUNGKAD! Mesin Menyedot Kredit",
        detail:
          "Kekalahan mutlak. Mesin slot diprogram dengan Return to Player (RTP) rendah yang menjamin bandar selalu mengantongi untung bersih 100% jangka panjang.",
      };
    }
  };

  const spinReel = (anim: Animated.Value, duration: number) => {
    return Animated.sequence([
      Animated.timing(anim, {
        toValue: 1,
        duration,
        easing: Easing.bezier(0.15, 0.85, 0.35, 1.0),
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]);
  };

  const handleSpin = () => {
    if (credits <= 0) {
      setShowAdModal(true);
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);
    setLastResult(null);
    setSuspenseReel3(false);

    const outcome = determineSlotOutcome();

    // Acak tampilan sementara saat berputar
    const interval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].icon,
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].icon,
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].icon,
      ]);
    }, 80);

    // Reel 1 berhenti setelah 1.0 detik
    setTimeout(() => {
      setReels((prev) => [outcome.finalReels[0], prev[1], prev[2]]);
      spinReel(reel1Anim, 300).start();
    }, 1000);

    // Reel 2 berhenti setelah 1.8 detik
    setTimeout(() => {
      setReels((prev) => [outcome.finalReels[0], outcome.finalReels[1], prev[2]]);
      spinReel(reel2Anim, 300).start();

      // Jika reel 1 & 2 adalah 7️⃣, aktifkan efek suspense dramatis pada Reel 3!
      if (outcome.finalReels[0] === "7️⃣" && outcome.finalReels[1] === "7️⃣") {
        setSuspenseReel3(true);
      }
    }, 1800);

    // Reel 3 berhenti setelah 2.8 detik (atau 3.6 detik jika suspense aktif)
    const reel3Delay = outcome.isNearMiss ? 3500 : 2600;

    setTimeout(() => {
      clearInterval(interval);
      setSuspenseReel3(false);
      setReels(outcome.finalReels);
      spinReel(reel3Anim, 400).start(() => {
        setIsSpinning(false);
        setLastResult(outcome);

        dispatch(
          playSlotRound({
            reels: outcome.finalReels,
            rewardCredits: outcome.reward,
            winner: outcome.winner,
            isNearMiss: outcome.isNearMiss,
            explanation: outcome.detail,
          })
        );
      });
    }, reel3Delay);
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

        <Text style={styles.title}>SLOT RUNGKAD 777</Text>
        <Text style={styles.subtitle}>
          Bongkar Jebakan 'Scatter Bayangan' & 'Jam Gacor'
        </Text>

        {/* Mesin Slot Display */}
        <View style={styles.slotCabinet}>
          <View style={styles.cabinetHeader}>
            <Text style={styles.cabinetHeaderText}>⚡ KAKEK ZEUS ENGINE ⚡</Text>
          </View>

          {/* Banner Suspense Reel 3 */}
          {suspenseReel3 && (
            <Animated.View
              style={[
                styles.suspenseBanner,
                { transform: [{ scale: suspenseGlow }] },
              ]}
            >
              <Text style={styles.suspenseText}>
                🔥 NYARIS MAXWIN! TUNGGU REEL 3... 🔥
              </Text>
            </Animated.View>
          )}

          {/* Area 3 Reel */}
          <View style={styles.reelsWindow}>
            {/* Reel 1 */}
            <View style={styles.reelColumn}>
              <Animated.View
                style={[
                  styles.symbolBox,
                  {
                    transform: [
                      {
                        translateY: reel1Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -10],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.symbolIcon}>{reels[0]}</Text>
              </Animated.View>
            </View>

            {/* Reel 2 */}
            <View style={styles.reelColumn}>
              <Animated.View
                style={[
                  styles.symbolBox,
                  {
                    transform: [
                      {
                        translateY: reel2Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -10],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.symbolIcon}>{reels[1]}</Text>
              </Animated.View>
            </View>

            {/* Reel 3 */}
            <View
              style={[
                styles.reelColumn,
                suspenseReel3 && styles.reelColumnSuspense,
              ]}
            >
              <Animated.View
                style={[
                  styles.symbolBox,
                  {
                    transform: [
                      {
                        translateY: reel3Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -10],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.symbolIcon}>{reels[2]}</Text>
              </Animated.View>
            </View>
          </View>

          {/* Payline Indicator */}
          <View style={styles.paylineBar}>
            <View style={styles.paylineDot} />
            <Text style={styles.paylineText}>LINE 1 - SATU GARIS PEMBAYARAN</Text>
            <View style={styles.paylineDot} />
          </View>
        </View>

        {/* Status Hasil Putaran */}
        {lastResult && (
          <View
            style={[
              styles.resultBox,
              lastResult.winner
                ? styles.resultWon
                : lastResult.isNearMiss
                ? styles.resultNearMiss
                : styles.resultLoss,
            ]}
          >
            <Text
              style={[
                styles.resultTitle,
                lastResult.winner
                  ? { color: "#00E676" }
                  : lastResult.isNearMiss
                  ? { color: "#FFB74D" }
                  : { color: "#FF5252" },
              ]}
            >
              {lastResult.title}
            </Text>
            <Text style={styles.resultDetail}>{lastResult.detail}</Text>
          </View>
        )}

        {/* Tabel Skema Hadiah Slot */}
        <View style={styles.paytableCard}>
          <Text style={styles.paytableTitle}>🏆 TABEL BAYARAN (BIAYA: 1 KREDIT):</Text>
          <Text style={styles.paytableRow}>• 7️⃣ 7️⃣ 7️⃣ : MAXWIN JACKPOT (+10 Kredit) [0.5%]</Text>
          <Text style={styles.paytableRow}>• 💎 💎 💎 : Permata Kembar (+3 Kredit) [1.5%]</Text>
          <Text style={styles.paytableRow}>• 🔔 🔔 🔔 : Lonceng Emas (+2 Kredit) [2.0%]</Text>
          <Text style={styles.paytableRow}>• 🍒 🍒 [Acak] : Balik Modal (+1 Kredit) [6.0%]</Text>
          <Text style={styles.paytableRow}>• Selain Itu : Rungkad / Zonk 100% [90.0%]</Text>
        </View>

        {/* Tombol Spin */}
        <TouchableOpacity
          style={[
            styles.btnSpin,
            (isSpinning || credits === 0) && styles.btnDisabled,
          ]}
          onPress={handleSpin}
          disabled={isSpinning}
        >
          <Text style={styles.btnSpinText}>
            {isSpinning
              ? "⚡ MESIN SEDANG BERPUTAR..."
              : credits > 0
              ? "🎰 PUTAR SLOT (-1 Kredit)"
              : "+ Top Up Kredit (Habis)"}
          </Text>
        </TouchableOpacity>

        {/* Kartu Edukasi: Bongkar Trik Jam Gacor */}
        <View style={styles.educationCard}>
          <Text style={styles.educationTitle}>
            🧠 MITOS BOHONG: "POLA & JAM GACOR"
          </Text>
          <Text style={styles.educationText}>
            1. **Tidak Pernah Ada Jam Gacor**: Mesin slot berjalan pada algoritma RNG (Random Number Generator) berbasis server. Jam berapa pun kamu bermain, rumus matematikanya sudah dikunci agar bandar selalu untung (house edge).
            {"\n\n"}
            2. **Ulah Affiliator**: Postingan di medsos tentang 'pola gacor jam 2 malam' adalah jebakan affiliator bandar untuk memancing korban baru agar mendaftar dengan link referral mereka dan menyetor uang deposit!
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
    marginBottom: 20,
    textAlign: "center",
  },
  slotCabinet: {
    width: "100%",
    backgroundColor: "#161F30",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#F59E0B",
    padding: 16,
    alignItems: "center",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 18,
  },
  cabinetHeader: {
    backgroundColor: "#B45309",
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 14,
  },
  cabinetHeaderText: {
    color: "#FEF3C7",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  suspenseBanner: {
    backgroundColor: "#DC2626",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  suspenseText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  reelsWindow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
    marginBottom: 14,
  },
  reelColumn: {
    flex: 1,
    height: 100,
    backgroundColor: "#0A0F18",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  reelColumnSuspense: {
    borderColor: "#EF4444",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 2,
  },
  symbolBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  symbolIcon: {
    fontSize: 48,
  },
  paylineBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  paylineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F59E0B",
  },
  paylineText: {
    color: "#FBBF24",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
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
  resultNearMiss: {
    backgroundColor: "rgba(255, 152, 0, 0.12)",
    borderColor: "#FF9800",
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
  paytableCard: {
    width: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 16,
  },
  paytableTitle: {
    color: "#F59E0B",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  paytableRow: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    marginVertical: 2,
  },
  btnSpin: {
    width: "100%",
    backgroundColor: "#F59E0B",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 20,
  },
  btnSpinText: {
    color: "#0B121E",
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
    borderColor: "#A855F7",
  },
  educationTitle: {
    color: "#C084FC",
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
