import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  totalPlayed: number;
  winRate: number;
  moneyLost: number;
}

export const generateShareMessage = (
  totalPlayed: number,
  winRate: number,
  moneyLost: number,
) => {
  const formattedMoney = moneyLost.toLocaleString("id-ID");
  return (
    `⚠️ PERINGATAN: KAMU PASTI KALAH! Tidak ada kemenangan dalam judi online!\n\n` +
    `Bandar judi online memakai algoritma curang: kamu hanya 'dikasih menang' sesaat sebagai umpan, lalu dibantai habis sampai boncos!\n\n` +
    `📊 Fakta Hasil Simulasi Algoritma Judol:\n` +
    `• Total Putaran: ${totalPlayed} putaran\n` +
    `• Rasio Menang: hanya ${winRate}%\n` +
    `• Simulasi Uang Terbakar: Rp ${formattedMoney}\n\n` +
    `Buktikan sendiri manipulasi bandar sebelum uang aslimu habis:\n` +
    `👉 Coba simulasi gratis: https://play.google.com/store/apps/details?id=com.arkgnan.tebakangka\n\n` +
    `#StopJudiOnline #KeluargaBahagiaTanpaJudi #AntiJudol`
  );
};

export default function ShareModal({
  visible,
  onClose,
  totalPlayed,
  winRate,
  moneyLost,
}: ShareModalProps) {
  const shareMessage = generateShareMessage(totalPlayed, winRate, moneyLost);

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: shareMessage,
        title: "Sosialisasi Bahaya Judi Online & Trading Abal-abal",
      });
      if (result.action === Share.sharedAction) {
        onClose();
      }
    } catch (error: any) {
      Alert.alert("Gagal Membagikan", error?.message || "Terjadi kesalahan.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Text style={styles.backBtnText}>← Kembali</Text>
          </TouchableOpacity>
          <View style={styles.badgeWarning}>
            <Text style={styles.badgeWarningText}>📢 SOSIALISASI PUBLIK</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Judul & Penjelasan */}
          <View style={styles.headerSection}>
            <Text style={styles.mainTitle}>Bagikan Edukasi Bahaya Judol</Text>
            <Text style={styles.subtitle}>
              Bantu selamatkan teman dan keluarga dari ilusi kemenangan judi online dan jeratan hutang atau pinjol.
            </Text>
          </View>

          {/* 3 Kartu Metrik Statistik Hasil Simulasi */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Putaran</Text>
              <Text style={styles.statValue}>{totalPlayed}</Text>
              <Text style={styles.statSub}>Sesi Simulasi</Text>
            </View>

            <View style={[styles.statCard, styles.statCardWinRate]}>
              <Text style={styles.statLabel}>Win Rate</Text>
              <Text style={[styles.statValue, styles.statValueWinRate]}>
                {winRate}%
              </Text>
              <Text style={styles.statSub}>Peluang Bandar</Text>
            </View>

            <View style={[styles.statCard, styles.statCardLoss]}>
              <Text style={styles.statLabel}>Uang Boncos</Text>
              <Text style={[styles.statValue, styles.statValueLoss]} numberOfLines={1}>
                {moneyLost >= 1000000
                  ? `${(moneyLost / 1000000).toFixed(1)} Jt`
                  : moneyLost >= 1000
                    ? `${Math.round(moneyLost / 1000)} Rb`
                    : `Rp ${moneyLost}`}
              </Text>
              <Text style={styles.statSub}>Simulasi Terbakar</Text>
            </View>
          </View>

          {/* Preview Box Pesan yang Akan Dibagikan (Tampil Utuh) */}
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTag}>PRATINJAU PESAN</Text>
              <Text style={styles.previewHint}>Akan dikirim ke WhatsApp / Sosmed</Text>
            </View>

            <View style={styles.previewMessageBox}>
              <Text style={styles.previewMessageText}>{shareMessage}</Text>
            </View>
          </View>

          {/* Misi Sosial Edukasi */}
          <View style={styles.missionCard}>
            <Text style={styles.missionTitle}>💡 MENGAPA INI PENTING?</Text>
            <Text style={styles.missionText}>
              Banyak korban judol terjebak karena merasa <Text style={styles.boldWhite}>"sedang kurang hoki saja"</Text> atau termakan mitos <Text style={styles.boldWhite}>"jam gacor & pola spin"</Text>.
              {"\n\n"}
              Data simulasimu membuktikan secara ilmiah bahwa <Text style={styles.boldGreen}>kemenangan jangka panjang adalah kemustahilan matematis</Text>. Bagikan fakta ini sekarang!
            </Text>
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.btnSharePrimary}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Text style={styles.btnSharePrimaryText}>
              📢 Bagikan ke WhatsApp & Sosmed
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B121E",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#17263A",
  },
  backBtn: {
    backgroundColor: "#162238",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  backBtnText: {
    color: "#BAC9DC",
    fontSize: 13,
    fontWeight: "700",
  },
  badgeWarning: {
    backgroundColor: "rgba(255, 82, 82, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 82, 82, 0.4)",
  },
  badgeWarningText: {
    color: "#FF5252",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: "#8FA3BF",
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#121C2D",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E2E48",
  },
  statCardWinRate: {
    borderColor: "#2E3D52",
  },
  statCardLoss: {
    borderColor: "rgba(255, 82, 82, 0.3)",
    backgroundColor: "#191724",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7E92AB",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#00E5FF",
    marginBottom: 2,
  },
  statValueWinRate: {
    color: "#FFB300",
  },
  statValueLoss: {
    color: "#FF5252",
  },
  statSub: {
    fontSize: 9,
    color: "#5E728B",
    fontWeight: "600",
  },
  previewContainer: {
    backgroundColor: "#0E1626",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E2F4C",
    marginBottom: 20,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  previewTag: {
    fontSize: 10,
    fontWeight: "800",
    color: "#00E5FF",
    letterSpacing: 0.6,
  },
  previewHint: {
    fontSize: 10,
    color: "#5C7089",
  },
  previewMessageBox: {
    backgroundColor: "#070D18",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#172338",
  },
  previewMessageText: {
    fontSize: 12,
    color: "#BAC9DC",
    lineHeight: 19,
  },
  missionCard: {
    backgroundColor: "#141D2E",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#00E5FF",
  },
  missionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#00E5FF",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  missionText: {
    fontSize: 12,
    color: "#8FA3BF",
    lineHeight: 19,
  },
  boldWhite: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  boldGreen: {
    color: "#00E676",
    fontWeight: "700",
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#17263A",
    backgroundColor: "#0B121E",
  },
  btnSharePrimary: {
    backgroundColor: "#00E5FF",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  btnSharePrimaryText: {
    color: "#08101E",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
