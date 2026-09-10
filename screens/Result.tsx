import React, { useEffect, useState } from "react";
import {
  BackHandler,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { StackNavigation } from "../App";
import LottieView from "lottie-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAppSelector } from "../hooks/useRedux";
import ShareModal from "../components/ShareModal";
import AdRewardModal from "../components/AdRewardModal";
import BannerAdComponent from "../components/BannerAdComponent";
import { SoundEffects } from "../services/soundService";

export default function Result() {
  const route = useRoute();
  const navigation = useNavigation<StackNavigation>();
  const { navigate, goBack } = navigation;

  const params = (route.params as any) || { winner: false, result: 0 };
  const {
    winner,
    gameType = "higher-lower",
    result,
    baseNumber,
    choice,
    playerChoice,
    bandarChoice,
    isDraw,
    rewardCredits,
    title,
    explanation,
  } = params;

  const { credits, stats } = useAppSelector((state) => state.game);

  const [showShareModal, setShowShareModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);

  const handleBackNavigation = () => {
    SoundEffects.playClick();
    if (gameType === "suit") {
      if (navigation.canGoBack()) {
        goBack();
      } else {
        navigate("SuitGame");
      }
    } else {
      navigate("Home");
    }
  };

  useEffect(() => {
    // Putar sound effect sesuai hasil menang/kalah
    if (winner) {
      SoundEffects.playWin();
    } else if (isDraw) {
      SoundEffects.playClick();
    } else {
      SoundEffects.playLoss();
    }

    const backAction = () => {
      handleBackNavigation();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, [navigation, winner, isDraw, gameType]);

  const handlePlayAgain = () => {
    SoundEffects.playClick();
    if (credits <= 0) {
      setShowAdModal(true);
      return;
    }
    if (gameType === "suit") {
      navigate("SuitGame");
    } else {
      navigate("Game");
    }
  };

  const winRate =
    stats.totalPlayed > 0
      ? Math.round((stats.totalWins / stats.totalPlayed) * 100)
      : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Status */}
        <View
          style={[
            styles.statusBanner,
            winner
              ? styles.bannerWin
              : isDraw
              ? styles.bannerDraw
              : styles.bannerLoss,
          ]}
        >
          <Text style={styles.statusBannerText}>
            {winner
              ? "🎉 KAMU DIBERI MENANG (UMPAN)!"
              : isDraw
              ? "🤝 HASIL SERI (BALIK MODAL)"
              : "💥 KAMU RUNGKAD / KALAH!"}
          </Text>
        </View>

        {/* Animasi Lottie Trophy / Sad */}
        <View style={styles.lottieWrapper}>
          {winner ? (
            <LottieView
              autoPlay
              loop={false}
              style={styles.lottie}
              source={require("../assets/winner.json")}
            />
          ) : (
            <LottieView
              autoPlay
              loop={false}
              style={styles.lottie}
              source={require("../assets/sad.json")}
            />
          )}
        </View>

        {/* Kartu Perbandingan (Suit vs Tebak Angka) */}
        {gameType === "suit" ? (
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>REKAP PERTARUNGAN SUIT</Text>
            <View style={styles.scoreGrid}>
              <View style={styles.scoreCol}>
                <Text style={styles.scoreLabel}>Pilihanmu</Text>
                <Text style={styles.scoreSuitText}>
                  {playerChoice === "rock"
                    ? "✊ Batu"
                    : playerChoice === "scissors"
                    ? "✌️ Gunting"
                    : "✋ Kertas"}
                </Text>
              </View>

              <View style={styles.scoreColDivider} />

              <View style={styles.scoreCol}>
                <Text style={styles.scoreLabel}>Lawan (Server)</Text>
                <Text
                  style={[
                    styles.scoreSuitText,
                    winner ? styles.textWin : isDraw ? styles.textDraw : styles.textLoss,
                  ]}
                >
                  {bandarChoice === "rock"
                    ? "✊ Batu"
                    : bandarChoice === "scissors"
                    ? "✌️ Gunting"
                    : "✋ Kertas"}
                </Text>
              </View>

              <View style={styles.scoreColDivider} />

              <View style={styles.scoreCol}>
                <Text style={styles.scoreLabel}>Hasil Putaran</Text>
                <Text
                  style={[
                    styles.scoreNumber,
                    winner ? styles.textWin : isDraw ? styles.textDraw : styles.textLoss,
                  ]}
                >
                  {winner ? "+2 Kredit" : isDraw ? "Balik Modal" : "-1 Kredit"}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>REKAP HASIL PUTARAN</Text>
            <View style={styles.scoreGrid}>
              <View style={styles.scoreCol}>
                <Text style={styles.scoreLabel}>Angka Awal</Text>
                <Text style={styles.scoreNumber}>{baseNumber ?? "-"}</Text>
              </View>

              <View style={styles.scoreColDivider} />

              <View style={styles.scoreCol}>
                <Text style={styles.scoreLabel}>Tebakanmu</Text>
                <Text
                  style={[
                    styles.scoreChoice,
                    choice === "higher" ? styles.textHigher : styles.textLower,
                  ]}
                >
                  {choice === "higher" ? "▲ Lebih Tinggi" : "▼ Lebih Rendah"}
                </Text>
              </View>

              <View style={styles.scoreColDivider} />

              <View style={styles.scoreCol}>
                <Text style={styles.scoreLabel}>Keluar Bandar</Text>
                <Text
                  style={[
                    styles.scoreNumber,
                    winner ? styles.textWin : styles.textLoss,
                  ]}
                >
                  {result ?? "-"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Kartu Edukasi Psikologis Bandar */}
        <View
          style={[
            styles.explanationCard,
            winner
              ? styles.borderWin
              : isDraw
              ? styles.borderDraw
              : styles.borderLoss,
          ]}
        >
          <Text
            style={[
              styles.explanationHeader,
              winner
                ? styles.textWin
                : isDraw
                ? styles.textDraw
                : styles.textLoss,
            ]}
          >
            {winner
              ? "🧠 PSIKOLOGI UMPAN BANDAR (BAITING):"
              : isDraw
              ? "🤝 TEKNIK MENGIKAT WAKTU (DRAW TRICK):"
              : "📉 REALITAS MATEMATIKA JUDI ONLINE:"}
          </Text>
          <Text style={styles.explanationText}>
            {explanation ||
              (winner
                ? "Bandar sengaja memberimu kemenangan ini setelah kamu dibuat kalah berturut-turut! Ini adalah umpan dopamin agar kamu tidak berhenti bermain dan terus melakukan deposit/top-up."
                : "Kekalahanmu bukanlah nasib sial, melainkan kepastian matematika. Bandar judol selalu memprogram algoritma agar pemain kalah dalam jangka panjang.")}
          </Text>
        </View>

        {/* Indikator Sisa Kredit */}
        <View style={styles.creditInfoRow}>
          <Text style={styles.creditInfoLabel}>Sisa Kreditmu:</Text>
          <Text style={styles.creditInfoValue}>{credits} Kredit</Text>
          {credits === 0 && (
            <Text style={styles.creditInfoAlert}> (Habis! Perlu Top Up)</Text>
          )}
        </View>

        {/* Tombol Aksi */}
        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={[
              styles.btnPrimary,
              credits === 0 && styles.btnPrimaryTopUp,
            ]}
            onPress={handlePlayAgain}
          >
            <Text style={styles.btnPrimaryText}>
              {credits > 0
                ? gameType === "suit"
                  ? "Adu Suit Lagi (-1 Kredit)"
                  : "Main Putaran Berikutnya (-1)"
                : "+ Top Up Kredit (Tonton Iklan)"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnShare}
            onPress={() => setShowShareModal(true)}
          >
            <Text style={styles.btnShareText}>
              📢 Bagikan Fakta Ini ke Teman & Keluarga
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={handleBackNavigation}
          >
            <Text style={styles.btnSecondaryText}>
              {gameType === "suit" ? "Kembali ke Suit Game" : "Kembali ke Beranda"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Banner Ad di bagian bawah layar Result */}
      <BannerAdComponent position="bottom" />

      {/* Modal Berbagi dan Iklan */}
      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        totalPlayed={stats.totalPlayed}
        winRate={winRate}
        moneyLost={stats.simulatedMoneyLost}
      />

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
  statusBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  bannerWin: {
    backgroundColor: "rgba(0, 230, 118, 0.15)",
    borderWidth: 1,
    borderColor: "#00E676",
  },
  bannerDraw: {
    backgroundColor: "rgba(0, 229, 255, 0.15)",
    borderWidth: 1,
    borderColor: "#00E5FF",
  },
  bannerLoss: {
    backgroundColor: "rgba(255, 82, 82, 0.15)",
    borderWidth: 1,
    borderColor: "#FF5252",
  },
  statusBannerText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  lottieWrapper: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: "100%",
    height: "100%",
  },
  scoreCard: {
    backgroundColor: "#131C2D",
    borderRadius: 18,
    padding: 18,
    width: "100%",
    borderWidth: 1,
    borderColor: "#202E45",
    marginBottom: 16,
  },
  scoreTitle: {
    color: "#7E97B8",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  scoreGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreCol: {
    flex: 1,
    alignItems: "center",
  },
  scoreColDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#202E45",
  },
  scoreLabel: {
    fontSize: 10,
    color: "#7E97B8",
    fontWeight: "600",
    marginBottom: 4,
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  scoreChoice: {
    fontSize: 11,
    fontWeight: "800",
  },
  textHigher: {
    color: "#00E676",
  },
  textLower: {
    color: "#FF5252",
  },
  textWin: {
    color: "#00E676",
  },
  textDraw: {
    color: "#00E5FF",
  },
  textLoss: {
    color: "#FF5252",
  },
  scoreSuitText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
  },
  explanationCard: {
    backgroundColor: "#141C2B",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    borderWidth: 1.5,
    marginBottom: 16,
  },
  borderWin: {
    borderColor: "#00E676",
  },
  borderDraw: {
    borderColor: "#00E5FF",
  },
  borderLoss: {
    borderColor: "#FF5252",
  },
  explanationHeader: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  explanationText: {
    fontSize: 12,
    color: "#BAC9DC",
    lineHeight: 18,
  },
  creditInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  creditInfoLabel: {
    color: "#7E97B8",
    fontSize: 13,
  },
  creditInfoValue: {
    color: "#00E5FF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 6,
  },
  creditInfoAlert: {
    color: "#FF5252",
    fontSize: 12,
    fontWeight: "700",
  },
  actionGroup: {
    width: "100%",
    gap: 10,
  },
  btnPrimary: {
    backgroundColor: "#00E5FF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  btnPrimaryTopUp: {
    backgroundColor: "#FFB300",
  },
  btnPrimaryText: {
    color: "#0B121E",
    fontSize: 15,
    fontWeight: "800",
  },
  btnShare: {
    backgroundColor: "#132738",
    borderWidth: 1.5,
    borderColor: "#00E5FF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnShareText: {
    color: "#00E5FF",
    fontSize: 13,
    fontWeight: "700",
  },
  btnSecondary: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    alignItems: "center",
  },
  btnSecondaryText: {
    color: "#7E97B8",
    fontSize: 13,
    fontWeight: "600",
  },
});
