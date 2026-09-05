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
import { playWheelRound } from "../store/slices/gameSlice";
import AdRewardModal from "../components/AdRewardModal";

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
  const [showAdModal, setShowAdModal] = useState(false);

  // Animasi Rotasi Roda
  const spinValue = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);

  const determineOutcome = (): { targetIndex: number; nearMiss: boolean } => {
    // ALGORITMA BANDAR NEAR-MISS (ILUSI NYARIS JACKPOT):
    // Jika sudah kalah 3x beruntun -> berikan umpan menang kecil (index 1 / +2 Kredit)
    if (consecutiveLosses >= 3) {
      return { targetIndex: 1, nearMiss: false };
    }

    // 60% waktu: Rekayasa efek NEAR-MISS (berhenti di index 2 atau 4, tepat 1 kotak di samping Jackpot index 3)
    const roll = Math.random();
    if (roll < 0.6) {
      const nearMissIndex = Math.random() < 0.5 ? 2 : 4;
      return { targetIndex: nearMissIndex, nearMiss: true };
    } else {
      // 40% waktu zonk acak lain
      const otherZonks = [0, 6, 7];
      const targetIndex = otherZonks[Math.floor(Math.random() * otherZonks.length)];
      return { targetIndex, nearMiss: false };
    }
  };

  const handleSpin = () => {
    if (credits <= 0) {
      setShowAdModal(true);
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedSegment(null);
    setIsNearMiss(false);

    const { targetIndex, nearMiss } = determineOutcome();
    const segmentAngle = 360 / SEGMENTS.length; // 45 derajat per segmen

    // Hitung putaran penuh (5 sampai 8 putaran) + offset ke segmen tujuan
    const extraRounds = 5;
    const targetAngle = 360 - targetIndex * segmentAngle;
    const totalRotation = currentRotation.current + extraRounds * 360 + targetAngle;

    Animated.timing(spinValue, {
      toValue: totalRotation,
      duration: 4000,
      easing: Easing.bezier(0.2, 0.8, 0.25, 1),
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      currentRotation.current = totalRotation % 360;
      const resultSegment = SEGMENTS[targetIndex];
      setSelectedSegment(resultSegment);
      setIsNearMiss(nearMiss);

      let explanation = "";
      if (nearMiss) {
        explanation =
          "Efek 'Near-Miss' (Nyaris Menang)! Bandar sengaja menghentikan roda tepat 1 kotak di samping JACKPOT x10 agar kamu merasa 'sedikit lagi dapat' dan terus memutar!";
      } else if (resultSegment.rewardCredits > 0) {
        explanation =
          "Umpan Kemenangan Kecil! Bandar memberimu kemenangan kecil agar kamu bertahan dan terdorong menaikkan taruhan.";
      } else {
        explanation =
          "Zonk! Mesin putar judol selalu diprogram dengan house edge besar sehingga peluang kekalahan pemain mencapai lebih dari 90%.";
      }

      dispatch(
        playWheelRound({
          segmentTitle: resultSegment.label,
          rewardCredits: resultSegment.rewardCredits,
          winner: resultSegment.rewardCredits > 0,
          isNearMiss: nearMiss,
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

          <View style={styles.creditBadge}>
            <Text style={styles.creditBadgeLabel}>KREDIT: </Text>
            <Text style={styles.creditBadgeValue}>{credits}</Text>
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
              selectedSegment.rewardCredits > 0
                ? styles.resultWon
                : isNearMiss
                ? styles.resultNearMiss
                : styles.resultLoss,
            ]}
          >
            <Text style={styles.resultTitle}>
              {selectedSegment.rewardCredits > 0
                ? `🎉 MENANG: ${selectedSegment.label} (+${selectedSegment.rewardCredits} Kredit)`
                : isNearMiss
                ? "😱 NYARIS JACKPOT! (Zonk)"
                : `💀 HASIL: ${selectedSegment.label} (Zonk)`}
            </Text>
            <Text style={styles.resultDetail}>
              {isNearMiss
                ? "Jarum berhenti tepat di samping JACKPOT x10! Inilah trik visual bandar untuk memancingmu terus deposit."
                : selectedSegment.rewardCredits > 0
                ? "Bandar memberimu umpan menang agar tidak berhenti bermain."
                : "Saldo berkurang 1 kredit. Bandar mengunci keuntungan!"}
            </Text>
          </View>
        )}

        {/* Tombol Putar Roda */}
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
              ? "⏳ RODA SEDANG BERPUTAR..."
              : credits > 0
              ? "🎡 PUTAR RODA (-1 Kredit)"
              : "+ Top Up Kredit (Habis)"}
          </Text>
        </TouchableOpacity>

        {/* Kotak Edukasi Near Miss */}
        <View style={styles.educationCard}>
          <Text style={styles.educationTitle}>
            🧠 PSIKOLOGI EFEK 'NEAR-MISS' (NYARIS MENANG):
          </Text>
          <Text style={styles.educationText}>
            Dalam psikologi perjudian, efek *Near-Miss* adalah ketika kamu kalah namun hasil visual berada tepat 1 milimeter di samping Jackpot.
            {"\n\n"}
            Otak merespons *Near-Miss* sama persis seperti saat menang: membanjiri dopamin dan menipu alam bawah sadar seolah kemenangan sudah dekat, padahal roda sudah diatur bandar untuk selalu kalah!
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
});
