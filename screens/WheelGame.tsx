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
import { playWheelRound } from "../store/slices/gameSlice";
import AdRewardModal from "../components/AdRewardModal";
import { SoundEffects } from "../services/soundService";

interface WheelSegment {
  id: number;
  label: string;
  icon: string;
  rewardCredits: number;
  isJackpot?: boolean;
  color: string;
  textColor: string;
}

const SEGMENTS: WheelSegment[] = [
  {
    id: 0,
    label: "RUNGKAD",
    icon: "💣",
    rewardCredits: 0,
    color: "#2C1820",
    textColor: "#FF5252",
  },
  {
    id: 1,
    label: "+2 KREDIT",
    icon: "🎁",
    rewardCredits: 2,
    color: "#0F2B24",
    textColor: "#00E676",
  },
  {
    id: 2,
    label: "BONCOS",
    icon: "💀",
    rewardCredits: 0,
    color: "#231B2B",
    textColor: "#E040FB",
  },
  {
    id: 3,
    label: "JACKPOT x10",
    icon: "👑",
    rewardCredits: 10,
    isJackpot: true,
    color: "#382C10",
    textColor: "#FFD700",
  },
  {
    id: 4,
    label: "ZONK LAGI",
    icon: "💣",
    rewardCredits: 0,
    color: "#2C1820",
    textColor: "#FF5252",
  },
  {
    id: 5,
    label: "+1 KREDIT",
    icon: "🪙",
    rewardCredits: 1,
    color: "#162B33",
    textColor: "#00E5FF",
  },
  {
    id: 6,
    label: "HABIS DEPO",
    icon: "💸",
    rewardCredits: 0,
    color: "#231B2B",
    textColor: "#E040FB",
  },
  {
    id: 7,
    label: "FREE SPIN",
    icon: "🎰",
    rewardCredits: 0,
    color: "#2B2414",
    textColor: "#FFA726",
  },
];

export default function WheelGame() {
  const { goBack } = useNavigation<StackNavigation>();
  const dispatch = useAppDispatch();
  const { credits, consecutiveLosses } = useAppSelector((state) => state.game);

  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<WheelSegment | null>(null);
  const [isNearMiss, setIsNearMiss] = useState(false);
  const [freeSpins, setFreeSpins] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);

  // Otomatis putar iklan ketika kredit dan free spin habis
  useEffect(() => {
    if (credits <= 0 && freeSpins === 0 && !isSpinning) {
      const timer = setTimeout(() => {
        setShowAdModal(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [credits, freeSpins, isSpinning]);

  // Animasi Rotasi Roda
  const spinValue = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);

  const determineOutcome = (): { targetIndex: number; nearMiss: boolean } => {
    // PELUANG SANGAT KECIL (SIMULASI HOUSE EDGE JUDI ONLINE):
    // 0.5% Jackpot x10 (Index 3)
    // 3.0% Menang +2 Kredit (Index 1)
    // 5.5% Balik Modal +1 Kredit (Index 5)
    // 4.0% Free Spin (Index 7)
    // 52.0% Efek 'Near-Miss' nyaris Jackpot (Index 2: Boncos atau Index 4: Zonk Lagi)
    // 35.0% Zonk Rungkad / Habis Depo (Index 0: Rungkad atau Index 6: Habis Depo)
    const roll = Math.random();

    if (roll < 0.005) {
      // 0.5% Jackpot x10
      return { targetIndex: 3, nearMiss: false };
    } else if (roll < 0.035) {
      // 3.0% Menang +2 Kredit
      return { targetIndex: 1, nearMiss: false };
    } else if (roll < 0.09) {
      // 5.5% Balik Modal +1 Kredit
      return { targetIndex: 5, nearMiss: false };
    } else if (roll < 0.13) {
      // 4.0% Free Spin
      return { targetIndex: 7, nearMiss: false };
    } else if (roll < 0.65) {
      // 52% Efek Near-Miss di sebelah Jackpot (index 2 atau 4)
      const nearMissIndex = Math.random() < 0.5 ? 2 : 4;
      return { targetIndex: nearMissIndex, nearMiss: true };
    } else {
      // 35% Zonk Rungkad atau Habis Depo
      const zonkIndex = Math.random() < 0.5 ? 0 : 6;
      return { targetIndex: zonkIndex, nearMiss: false };
    }
  };

  const handleSpin = () => {
    const isUsingFreeSpin = freeSpins > 0;

    if (credits <= 0 && !isUsingFreeSpin) {
      SoundEffects.playClick();
      setShowAdModal(true);
      return;
    }

    if (isSpinning) return;
    SoundEffects.playClick();

    if (isUsingFreeSpin) {
      setFreeSpins((prev) => Math.max(0, prev - 1));
    }

    setIsSpinning(true);
    setSelectedSegment(null);
    setIsNearMiss(false);

    // Suara ratchet tick saat roda berputar
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      tickCount++;
      SoundEffects.playSpinTick();
      if (tickCount >= 16) clearInterval(tickInterval);
    }, 220);

    const { targetIndex, nearMiss } = determineOutcome();
    const segmentAngle = 360 / SEGMENTS.length; // 45 derajat per segmen

    // Rumus presisi agar segmen targetIndex berhenti tepat di bawah jarum (posisi 0 derajat / atas):
    // Setiap segmen berada di sudut (targetIndex * segmentAngle).
    // Agar segmen berada di jarum atas, rotasi kumulatif modulo 360 harus (360 - targetIndex * segmentAngle) % 360.
    const targetAngleMod = (360 - targetIndex * segmentAngle) % 360;
    const currentAngleMod = currentRotation.current % 360;
    let delta = targetAngleMod - currentAngleMod;
    if (delta <= 0) {
      delta += 360;
    }

    const extraRounds = 5; // Minimal 5 putaran penuh agar visual dramatis
    const nextTotalRotation =
      currentRotation.current + delta + extraRounds * 360;

    Animated.timing(spinValue, {
      toValue: nextTotalRotation,
      duration: 4000,
      easing: Easing.bezier(0.2, 0.8, 0.25, 1),
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      currentRotation.current = nextTotalRotation;
      const resultSegment = SEGMENTS[targetIndex];
      setSelectedSegment(resultSegment);
      setIsNearMiss(nearMiss);

      // Suara hasil roda
      if (resultSegment.isJackpot) {
        SoundEffects.playJackpot();
      } else if (resultSegment.rewardCredits > 0 || resultSegment.id === 7) {
        SoundEffects.playWin();
      } else {
        SoundEffects.playLoss();
      }

      // Jika mendarat di Free Spin (Index 7), tambahkan free spin token
      if (resultSegment.id === 7) {
        setFreeSpins((prev) => prev + 1);
      }

      let explanation = "";
      if (nearMiss) {
        explanation =
          "Efek 'Near-Miss' (Nyaris Menang)! Bandar sengaja menghentikan roda tepat 1 kotak di samping JACKPOT x10 agar kamu merasa 'sedikit lagi dapat' dan terus memutar!";
      } else if (resultSegment.id === 7) {
        explanation =
          "Dapat Free Spin! Trik bandar memberi putaran gratis agar pemain tidak menutup aplikasi dan merasa penasaran untuk lanjut bertaruh.";
      } else if (resultSegment.isJackpot) {
        explanation =
          "JACKPOT x10! Peluang ini hanya 0.5% di dunia nyata. Bandar hanya memberi kemenangan ini pada 1 dari ribuan putaran agar dijadikan bahan promosi!";
      } else if (resultSegment.rewardCredits > 0) {
        explanation =
          resultSegment.rewardCredits === 2
            ? "Menang +2 Kredit! Umpan kemenangan kecil untuk menumbuhkan rasa percaya diri palsu."
            : "Balik Modal +1 Kredit! Saldo tidak bertambah, bandar mengulur waktu agar kamu lelah dan terus bermain.";
      } else {
        explanation =
          "Zonk! Mesin putar judol selalu diprogram dengan house edge besar sehingga peluang kekalahan pemain mencapai lebih dari 90%.";
      }

      dispatch(
        playWheelRound({
          segmentTitle: resultSegment.label,
          rewardCredits: resultSegment.rewardCredits,
          winner: resultSegment.rewardCredits > 0 || resultSegment.id === 7,
          isNearMiss: nearMiss,
          isFreeSpin: isUsingFreeSpin,
          explanation,
        }),
      );
    });
  };

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

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

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {freeSpins > 0 && (
              <View style={[styles.creditBadge, { backgroundColor: "rgba(255, 167, 38, 0.15)", borderColor: "#FFA726" }]}>
                <Text style={[styles.creditBadgeLabel, { color: "#FFA726" }]}>FREE: </Text>
                <Text style={[styles.creditBadgeValue, { color: "#FFA726" }]}>{freeSpins}x</Text>
              </View>
            )}
            <View style={styles.creditBadge}>
              <Text style={styles.creditBadgeLabel}>KREDIT: </Text>
              <Text style={styles.creditBadgeValue}>{credits}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>RODA PUTAR ILUSI</Text>
        <Text style={styles.subtitle}>Bongkar Trik Psikologi 'Nyaris Jackpot'</Text>

        {/* Pointer Jarum Roda */}
        <View style={styles.pointerContainer}>
          <Text style={styles.pointerIcon}>🔻</Text>
        </View>

        {/* Roda Putar Grafis */}
        <View style={styles.wheelOuter}>
          <Animated.View
            style={[
              styles.wheelCircle,
              { transform: [{ rotate: spinInterpolate }] },
            ]}
          >
            {SEGMENTS.map((seg, idx) => {
              const angle = (idx * 360) / SEGMENTS.length;
              return (
                <View
                  key={seg.id}
                  style={[
                    styles.segmentItem,
                    {
                      transform: [
                        { rotate: `${angle}deg` },
                        { translateY: -85 },
                      ],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.segmentBadge,
                      { backgroundColor: seg.color },
                      seg.isJackpot && styles.jackpotBadge,
                    ]}
                  >
                    <Text style={styles.segmentIcon}>{seg.icon}</Text>
                    <Text
                      style={[
                        styles.segmentText,
                        { color: seg.textColor },
                      ]}
                    >
                      {seg.label}
                    </Text>
                  </View>
                </View>
              );
            })}
            <View style={styles.centerKnob}>
              <Text style={styles.centerKnobText}>🎰</Text>
            </View>
          </Animated.View>
        </View>

        {/* Status Hasil Putaran */}
        {selectedSegment && (
          <View
            style={[
              styles.resultBox,
              selectedSegment.id === 7
                ? { backgroundColor: "rgba(255, 167, 38, 0.12)", borderColor: "#FFA726" }
                : selectedSegment.rewardCredits > 0
                ? styles.resultWon
                : isNearMiss
                ? styles.resultNearMiss
                : styles.resultLoss,
            ]}
          >
            <Text
              style={[
                styles.resultTitle,
                selectedSegment.id === 7 && { color: "#FFA726" },
              ]}
            >
              {selectedSegment.id === 7
                ? "🎰 BONUS: 1x FREE SPIN GRATIS!"
                : selectedSegment.rewardCredits > 0
                ? `🎉 MENANG: ${selectedSegment.label} (+${selectedSegment.rewardCredits} Kredit)`
                : isNearMiss
                ? "😱 NYARIS JACKPOT! (Zonk)"
                : `💀 HASIL: ${selectedSegment.label} (Zonk)`}
            </Text>
            <Text style={styles.resultDetail}>
              {selectedSegment.id === 7
                ? "Kamu mendapatkan 1x Putaran Gratis! Saldo kreditmu tidak dipotong pada putaran selanjutnya."
                : isNearMiss
                ? "Jarum berhenti tepat di samping JACKPOT x10! Inilah trik visual bandar untuk memancingmu terus deposit."
                : selectedSegment.rewardCredits > 0
                ? "Bandar memberimu umpan kemenangan agar tidak berhenti bermain."
                : "Saldo berkurang 1 kredit. Bandar mengunci keuntungan!"}
            </Text>
          </View>
        )}

        {/* Tombol Putar Roda */}
        <TouchableOpacity
          style={[
            styles.btnSpin,
            freeSpins > 0 && { backgroundColor: "#FFA726", borderColor: "#FFB74D" },
            credits === 0 && freeSpins === 0
              ? styles.btnTopUp
              : isSpinning
              ? styles.btnDisabled
              : null,
          ]}
          onPress={handleSpin}
          disabled={isSpinning}
        >
          <Text
            style={[
              styles.btnSpinText,
              (freeSpins > 0 || (credits === 0 && freeSpins === 0)) && styles.btnTopUpText,
            ]}
          >
            {isSpinning
              ? "⏳ RODA SEDANG BERPUTAR..."
              : freeSpins > 0
              ? `🎰 PUTAR GRATIS (${freeSpins} Free Spin Aktif)`
              : credits > 0
              ? "🎡 PUTAR RODA (-1 Kredit)"
              : "+ Top Up Kredit (Tonton Iklan)"}
          </Text>
        </TouchableOpacity>

        {/* Kotak Edukasi Near Miss */}
        <View style={styles.educationCard}>
          <Text style={styles.educationTitle}>
            🧠 PSIKOLOGI EFEK 'NEAR-MISS' (NYARIS MENANG):
          </Text>
          <Text style={styles.educationText}>
            Dalam psikologi perjudian, efek <Text style={styles.strongHighlight}>Near-Miss</Text> adalah ketika kamu kalah namun hasil visual berada tepat 1 milimeter di samping Jackpot.
            {"\n\n"}
            Otak merespons <Text style={styles.strongHighlight}>Near-Miss</Text> sama persis seperti saat menang: membanjiri dopamin dan menipu alam bawah sadar seolah kemenangan sudah dekat, padahal roda sudah diatur bandar untuk selalu kalah!
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
    marginBottom: 10,
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
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 12,
    color: "#00E5FF",
    fontWeight: "600",
    marginBottom: 16,
  },
  pointerContainer: {
    zIndex: 10,
    marginBottom: -16,
  },
  pointerIcon: {
    fontSize: 32,
    color: "#FF3D00",
  },
  wheelOuter: {
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 5,
    borderColor: "#00E5FF",
    backgroundColor: "#080D16",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 20,
  },
  wheelCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  segmentItem: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 70,
  },
  segmentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    width: 68,
  },
  jackpotBadge: {
    borderColor: "#FFD700",
    borderWidth: 1.5,
  },
  segmentIcon: {
    fontSize: 14,
    marginBottom: 2,
  },
  segmentText: {
    fontSize: 8,
    fontWeight: "900",
    textAlign: "center",
  },
  centerKnob: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#162235",
    borderWidth: 2,
    borderColor: "#00E5FF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  centerKnobText: {
    fontSize: 18,
  },
  resultBox: {
    width: "100%",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  resultWon: {
    backgroundColor: "rgba(0, 230, 118, 0.15)",
    borderColor: "#00E676",
  },
  resultNearMiss: {
    backgroundColor: "rgba(255, 179, 0, 0.15)",
    borderColor: "#FFB300",
  },
  resultLoss: {
    backgroundColor: "rgba(255, 82, 82, 0.15)",
    borderColor: "#FF5252",
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 4,
    textAlign: "center",
  },
  resultDetail: {
    fontSize: 11,
    color: "#BAC9DC",
    lineHeight: 16,
    textAlign: "center",
  },
  btnSpin: {
    backgroundColor: "#00E5FF",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#00E5FF",
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
  btnTopUp: {
    backgroundColor: "#FFB300",
    shadowColor: "#FFB300",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  btnTopUpText: {
    color: "#0B121E",
    fontWeight: "900",
  },
  educationCard: {
    backgroundColor: "#141C2B",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: "#E040FB",
  },
  educationTitle: {
    color: "#EA80FC",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
  },
  educationText: {
    color: "#CFDCEB",
    fontSize: 12,
    lineHeight: 18,
  },
  strongHighlight: {
    color: "#FDE047",
    fontWeight: "900",
    textDecorationLine: "underline",
  },
});
