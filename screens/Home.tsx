import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigation } from "../App";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { signOut } from "../store/slices/authSlice";
import { resetGameStats } from "../store/slices/gameSlice";
import StatCard from "../components/StatCard";
import AdRewardModal from "../components/AdRewardModal";
import EducationModal from "../components/EducationModal";
import ShareModal from "../components/ShareModal";

export default function Home() {
  const { navigate } = useNavigation<StackNavigation>();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { credits, stats, history } = useAppSelector((state) => state.game);

  const [showAdModal, setShowAdModal] = useState(false);
  const [showEduModal, setShowEduModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleStartGame = () => {
    if (credits <= 0) {
      Alert.alert(
        "Kredit Bermain Habis!",
        "Kreditmu sudah 0. Dalam judi online nyata, ini adalah momen saat kamu boncos dan tergoda top-up uang asli. Tonton simulasi iklan untuk mendapatkan +5 kredit!",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Tonton Iklan (+5 Kredit)",
            onPress: () => setShowAdModal(true),
          },
        ],
      );
      return;
    }
    navigate("Game");
  };

  const handleLogout = () => {
    Alert.alert("Konfirmasi Keluar", "Apakah kamu yakin ingin keluar akun?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: () => {
          dispatch(signOut());
          navigate("Login");
        },
      },
    ]);
  };

  const handleResetStats = () => {
    Alert.alert(
      "Reset Statistik Simulasi",
      "Apakah kamu ingin mengatur ulang seluruh statistik permainan dan mengembalikan 3 kredit awal?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => dispatch(resetGameStats()),
        },
      ],
    );
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
        {/* Bar Atas: Profil & Tombol Keluar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greetingText}>
              Halo, {user?.displayName || "Pemain Cerdas"}
            </Text>
            <Text style={styles.statusSubtext}>
              {user?.email || "Akun Google Terhubung"}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Keluar</Text>
          </TouchableOpacity>
        </View>

        {/* Banner Edukatif */}
        <TouchableOpacity
          style={styles.bannerContainer}
          onPress={() => setShowEduModal(true)}
        >
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>FAKTA BANDAR</Text>
          </View>
          <Text style={styles.bannerText}>
            "Pemain tidak pernah bisa menang melawan algoritma bandar."
          </Text>
          <Text style={styles.bannerCta}>Ketuk untuk pelajari rahasianya →</Text>
        </TouchableOpacity>

        {/* Kartu Statistik & Kredit */}
        <StatCard
          credits={credits}
          totalPlayed={stats.totalPlayed}
          totalWins={stats.totalWins}
          totalLosses={stats.totalLosses}
          moneyLost={stats.simulatedMoneyLost}
          totalAdsWatched={stats.totalAdsWatched}
          onTopUpPress={() => setShowAdModal(true)}
        />

        {/* Section Title: Pilihan Game */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PILIH SIMULASI GAME ANTI-JUDOL</Text>
          <Text style={styles.sectionSubtitle}>
            Buktikan sendiri bagaimana 3 jenis game ini memanipulasi pemain!
          </Text>
        </View>

        {/* Kartu Game 1: Tebak Angka */}
        <TouchableOpacity
          style={[styles.gameCard, styles.gameCardCyan]}
          onPress={() => {
            if (credits <= 0) {
              setShowAdModal(true);
            } else {
              navigate("Game");
            }
          }}
        >
          <View style={styles.gameCardBadge}>
            <Text style={styles.gameCardBadgeText}>MANIPULASI PROBABILITAS</Text>
          </View>
          <View style={styles.gameCardContent}>
            <Text style={styles.gameCardIcon}>🎲</Text>
            <View style={styles.gameCardInfo}>
              <Text style={styles.gameCardTitle}>1. Tebak Angka</Text>
              <Text style={styles.gameCardDesc}>
                Tebak angka lebih tinggi atau rendah. Bandar mengunci kekalahan setelah memberi 1 kemenangan umpan!
              </Text>
              <View style={styles.gameCardFooter}>
                <Text style={styles.gameCardCost}>Biaya: 1 Kredit</Text>
                <Text style={styles.gameCardCta}>Mainkan →</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Kartu Game 2: Roket Boncos (Crash) */}
        <TouchableOpacity
          style={[styles.gameCard, styles.gameCardGreen]}
          onPress={() => {
            if (credits <= 0) {
              setShowAdModal(true);
            } else {
              navigate("CrashGame");
            }
          }}
        >
          <View style={[styles.gameCardBadge, styles.badgeOrange]}>
            <Text style={styles.gameCardBadgeText}>JEBAKAN FOMO & KESERAKAHAN</Text>
          </View>
          <View style={styles.gameCardContent}>
            <Text style={styles.gameCardIcon}>🚀</Text>
            <View style={styles.gameCardInfo}>
              <Text style={styles.gameCardTitle}>2. Roket Boncos (Crash)</Text>
              <Text style={styles.gameCardDesc}>
                Tarik saldo sebelum roket meledak. Bandar sering meledakkannya instan di 1.02x!
              </Text>
              <View style={styles.gameCardFooter}>
                <Text style={styles.gameCardCost}>Biaya: 1 Kredit</Text>
                <Text style={[styles.gameCardCta, styles.textGreen]}>Luncurkan →</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Kartu Game 3: Roda Putar Ilusi (Lucky Wheel) */}
        <TouchableOpacity
          style={[styles.gameCard, styles.gameCardPurple]}
          onPress={() => {
            if (credits <= 0) {
              setShowAdModal(true);
            } else {
              navigate("WheelGame");
            }
          }}
        >
          <View style={[styles.gameCardBadge, styles.badgePurple]}>
            <Text style={styles.gameCardBadgeText}>ILUSI NYARIS JACKPOT</Text>
          </View>
          <View style={styles.gameCardContent}>
            <Text style={styles.gameCardIcon}>🎡</Text>
            <View style={styles.gameCardInfo}>
              <Text style={styles.gameCardTitle}>3. Roda Putar Ilusi</Text>
              <Text style={styles.gameCardDesc}>
                Jarum roda sengaja berhenti 1 milimeter di samping JACKPOT x10 agar kamu kecanduan spin!
              </Text>
              <View style={styles.gameCardFooter}>
                <Text style={styles.gameCardCost}>Biaya: 1 Kredit</Text>
                <Text style={[styles.gameCardCta, styles.textPurple]}>Putar Roda →</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Baris Tombol Aksi Sekunder */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.shareBtn]}
            onPress={() => setShowShareModal(true)}
          >
            <Text style={styles.actionBtnIcon}>📢</Text>
            <Text style={styles.shareBtnText}>Bagikan Sosialisasi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.eduBtn]}
            onPress={() => setShowEduModal(true)}
          >
            <Text style={styles.actionBtnIcon}>🧠</Text>
            <Text style={styles.eduBtnText}>Bongkar Trik</Text>
          </TouchableOpacity>
        </View>

        {/* Riwayat Putaran Terakhir */}
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Riwayat Putaran Terakhir</Text>
            {stats.totalPlayed > 0 && (
              <TouchableOpacity onPress={handleResetStats}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          {history.length === 0 ? (
            <Text style={styles.emptyHistory}>
              Belum ada putaran. Pilih salah satu game di atas untuk membuktikan manipulasi bandar!
            </Text>
          ) : (
            history.slice(0, 6).map((item, idx) => (
              <View key={idx} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <Text
                    style={[
                      styles.historyOutcome,
                      item.winner ? styles.textWin : styles.textLoss,
                    ]}
                  >
                    {item.gameTitle ? `[${item.gameTitle}] ` : ""}
                    {item.winner ? "✅ Menang (Umpan)" : "❌ Rungkad (Kalah)"}
                  </Text>
                  <Text style={styles.historyDetail}>
                    {item.gameType === "crash"
                      ? `Tarik di ${(item.multiplier || 1).toFixed(2)}x (Ledak: ${(item.crashPoint || 1).toFixed(2)}x)`
                      : item.gameType === "wheel"
                      ? `Hasil Roda: ${item.segmentTitle || "Zonk"}`
                      : `Angka: ${item.baseNumber} → ${item.resultNumber} (${item.choice === "higher" ? "Tinggi" : "Rendah"})`}
                  </Text>
                </View>
                <Text style={styles.historyCost}>-1 Kredit</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal-modal Interaktif */}
      <AdRewardModal
        visible={showAdModal}
        onClose={() => setShowAdModal(false)}
      />

      <EducationModal
        visible={showEduModal}
        onClose={() => setShowEduModal(false)}
      />

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        totalPlayed={stats.totalPlayed}
        winRate={winRate}
        moneyLost={stats.simulatedMoneyLost}
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
    gap: 16,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  statusSubtext: {
    fontSize: 12,
    color: "#7E97B8",
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: "#1C273D",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2B3A54",
  },
  logoutBtnText: {
    color: "#FF8A80",
    fontSize: 12,
    fontWeight: "700",
  },
  bannerContainer: {
    backgroundColor: "#161D2B",
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#FF5252",
    borderWidth: 1,
    borderColor: "#222D42",
  },
  bannerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FF5252",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  bannerBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  bannerText: {
    color: "#BAC9DC",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  bannerCta: {
    color: "#00E5FF",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },
  sectionHeader: {
    marginTop: 4,
    marginBottom: -4,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    color: "#6F85A3",
    fontSize: 11,
    marginTop: 2,
  },
  gameCard: {
    backgroundColor: "#121A2A",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  gameCardCyan: {
    borderColor: "#00E5FF",
    shadowColor: "#00E5FF",
  },
  gameCardGreen: {
    borderColor: "#00E676",
    shadowColor: "#00E676",
  },
  gameCardPurple: {
    borderColor: "#E040FB",
    shadowColor: "#E040FB",
  },
  gameCardBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 229, 255, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 10,
  },
  badgeOrange: {
    backgroundColor: "rgba(255, 152, 0, 0.15)",
  },
  badgePurple: {
    backgroundColor: "rgba(224, 64, 251, 0.15)",
  },
  gameCardBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  gameCardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  gameCardIcon: {
    fontSize: 34,
    marginTop: 2,
  },
  gameCardInfo: {
    flex: 1,
  },
  gameCardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  gameCardDesc: {
    fontSize: 12,
    color: "#9BB1CC",
    lineHeight: 17,
    marginBottom: 10,
  },
  gameCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 8,
  },
  gameCardCost: {
    color: "#FFB300",
    fontSize: 11,
    fontWeight: "700",
  },
  gameCardCta: {
    color: "#00E5FF",
    fontSize: 13,
    fontWeight: "800",
  },
  textGreen: {
    color: "#00E676",
  },
  textPurple: {
    color: "#E040FB",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  shareBtn: {
    backgroundColor: "#132738",
    borderColor: "#00E5FF",
  },
  shareBtnText: {
    color: "#00E5FF",
    fontSize: 13,
    fontWeight: "700",
  },
  eduBtn: {
    backgroundColor: "#241E14",
    borderColor: "#FFB300",
  },
  eduBtnText: {
    color: "#FFB300",
    fontSize: 13,
    fontWeight: "700",
  },
  actionBtnIcon: {
    fontSize: 16,
  },
  historyCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E2A3E",
    marginTop: 4,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyTitle: {
    color: "#8FA3BF",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  resetText: {
    color: "#FF5252",
    fontSize: 11,
    fontWeight: "600",
  },
  emptyHistory: {
    color: "#5E7390",
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 14,
    lineHeight: 18,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#172236",
  },
  historyLeft: {
    flex: 1,
  },
  historyOutcome: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 2,
  },
  textWin: {
    color: "#00E676",
  },
  textLoss: {
    color: "#FF5252",
  },
  historyDetail: {
    fontSize: 11,
    color: "#8FA3BF",
  },
  historyCost: {
    color: "#FFB300",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 8,
  },
});