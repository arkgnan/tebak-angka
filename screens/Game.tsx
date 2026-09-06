import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigation } from "../App";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { playRound } from "../store/slices/gameSlice";
import { SoundEffects } from "../services/soundService";
import AnimatedButton from "../components/AnimatedButton";
import AdRewardModal from "../components/AdRewardModal";

export default function Game() {
  const { navigate, goBack } = useNavigation<StackNavigation>();
  const dispatch = useAppDispatch();
  const { credits, lastRound } = useAppSelector((state) => state.game);

  // Acak angka dasar stabil antara 15 dan 85 (tidak berubah di setiap re-render)
  const [baseNumber, setBaseNumber] = useState<number>(() =>
    Math.floor(Math.random() * 71) + 15,
  );
  const [showAdModal, setShowAdModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Validasi kredit saat masuk
  useEffect(() => {
    if (credits <= 0) {
      setShowAdModal(true);
    }
  }, [credits]);

  const handleChoice = (choice: "higher" | "lower") => {
    SoundEffects.playClick();
    if (credits <= 0) {
      setShowAdModal(true);
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    // Jalankan logika putaran dengan algoritma bandar
    dispatch(playRound({ choice, baseNumber }));

    // Ambil hasil terbaru dari store dan arahkan ke layar Hasil
    setTimeout(() => {
      setIsProcessing(false);
      // Generate angka baru untuk ronde berikutnya saat kembali
      setBaseNumber(Math.floor(Math.random() * 71) + 15);
    }, 300);
  };

  // Navigasi ke Result setelah lastRound diperbarui
  useEffect(() => {
    if (lastRound && isProcessing && lastRound.gameType === "higher-lower") {
      navigate("Result", {
        winner: lastRound.winner,
        result: lastRound.resultNumber ?? 50,
        baseNumber: lastRound.baseNumber ?? baseNumber,
        choice: lastRound.choice ?? "higher",
        explanation: lastRound.explanation,
      });
    }
  }, [lastRound, isProcessing, navigate, baseNumber]);

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

        {/* Status Taruhan */}
        <View style={styles.betBanner}>
          <Text style={styles.betBannerText}>
            🎰 Taruhan: 1 Kredit (-1 Kredit per tebakan)
          </Text>
        </View>

        {/* Kartu Angka Utama */}
        <View style={styles.card}>
          <Text style={styles.cardSubtitle}>ANGKA DASAR SAAT INI</Text>
          <View style={styles.numberCircle}>
            <Text style={styles.baseNumberText}>{baseNumber}</Text>
          </View>
          <Text style={styles.questionText}>
            Tebak apakah angka yang dikeluarkan bandar berikutnya LEBIH TINGGI
            atau LEBIH RENDAH?
          </Text>
        </View>

        {/* Tombol Tebakan */}
        <View style={styles.buttonsContainer}>
          <AnimatedButton
            action="higher"
            disabled={isProcessing}
            onPress={() => handleChoice("higher")}
          />
          <AnimatedButton
            action="lower"
            disabled={isProcessing}
            onPress={() => handleChoice("lower")}
          />
        </View>

        {/* Catatan Edukasi */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>
            💡 Catatan Edukasi Simulasi:
          </Text>
          <Text style={styles.disclaimerText}>
            Di judi online, angka yang keluar tidaklah acak murni. Bandar
            mengatur algoritma: kamu dipaksa kalah 3-5x beruntun sebelum diberi
            1x menang sebagai umpan, dan dilarang menang beruntun!
          </Text>
        </View>
      </ScrollView>

      {/* Modal Iklan Saat Kredit Habis */}
      <AdRewardModal
        visible={showAdModal}
        onClose={() => {
          setShowAdModal(false);
          if (credits <= 0) {
            goBack();
          }
        }}
        onRewardClaimed={() => {
          setShowAdModal(false);
        }}
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
  betBanner: {
    backgroundColor: "#191526",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFB300",
    marginBottom: 20,
  },
  betBannerText: {
    color: "#FFD54F",
    fontSize: 12,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#131C2D",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#202E45",
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#7E97B8",
    letterSpacing: 1,
    marginBottom: 16,
  },
  numberCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#0B121E",
    borderWidth: 3,
    borderColor: "#00E5FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 10,
  },
  baseNumberText: {
    fontSize: 64,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  questionText: {
    fontSize: 13,
    color: "#BAC9DC",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 280,
  },
  buttonsContainer: {
    width: "100%",
    marginBottom: 20,
  },
  disclaimerBox: {
    backgroundColor: "#1C141C",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FF5252",
    width: "100%",
  },
  disclaimerTitle: {
    color: "#FF5252",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },
  disclaimerText: {
    color: "#E0B8B8",
    fontSize: 11,
    lineHeight: 16,
  },
});
