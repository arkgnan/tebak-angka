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

        {/* Tombol Utama: Mulai Permainan */}
        <TouchableOpacity
          style={[styles.playButton, credits === 0 && styles.playButtonEmpty]}
          onPress={handleStartGame}
        >
          <Text style={styles.playButtonIcon}>🎲</Text>
          <View>
            <Text style={styles.playButtonTitle}>
              {credits > 0 ? "Mulai Main Tebak Angka" : "Kredit Habis (Top Up)"}
            </Text>
            <Text style={styles.playButtonSubtitle}>
              {credits > 0
                ? "Biaya: 1 Kredit per putaran"
                : "Tonton iklan untuk dapat +5 Kredit"}
            </Text>
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
              Belum ada putaran. Klik "Mulai Main" di atas untuk membuktikan
              manipulasi bandar!
            </Text>
          ) : (
            history.slice(0, 5).map((item, idx) => (
              <View key={idx} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <Text
                    style={[
                      styles.historyOutcome,
                      item.winner ? styles.textWin : styles.textLoss,
                    ]}
                  >
                    {item.winner ? "✅ Menang (Umpan)" : "❌ Rungkad (Kalah)"}
                  </Text>
                  <Text style={styles.historyDetail}>
                    Angka awal: {item.baseNumber} → Keluar: {item.resultNumber}{" "}
                    ({item.choice === "higher" ? "Tinggi" : "Rendah"})
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
  playButton: {
    backgroundColor: "#00E5FF",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  playButtonEmpty: {
    backgroundColor: "#FFB300",
    shadowColor: "#FFB300",
  },
  playButtonIcon: {
    fontSize: 32,
  },
  playButtonTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0B121E",
  },
  playButtonSubtitle: {
    fontSize: 12,
    color: "#182A45",
    fontWeight: "600",
    marginTop: 2,
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