import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native";

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
  return `⚠️ PERINGATAN: KAMU PASTI KALAH! Tidak ada kemenangan dalam judi online!\n\n` +
    `Bandar judi online memakai algoritma curang: kamu hanya 'dikasih menang' sesaat sebagai umpan, lalu dibantai habis sampai boncos!\n\n` +
    `📊 Fakta Hasil Simulasi Algoritma Judol:\n` +
    `• Total Putaran: ${totalPlayed} putaran\n` +
    `• Rasio Menang: hanya ${winRate}%\n` +
    `• Simulasi Uang Terbakar: Rp ${formattedMoney}\n\n` +
    `Buktikan sendiri manipulasi bandar sebelum uang aslimu habis:\n` +
    `👉 Coba simulasi gratis: https://play.google.com/store/apps/details?id=com.arkgnan.tebakangka\n\n` +
    `#StopJudiOnline #KeluargaBahagiaTanpaJudi #AntiJudol`;
};

export default function ShareModal({
  visible,
  onClose,
  totalPlayed,
  winRate,
  moneyLost,
}: ShareModalProps) {
  const handleShare = async () => {
    const message = generateShareMessage(totalPlayed, winRate, moneyLost);
    try {
      const result = await Share.share({
        message,
        title: "Sosialisasi Bahaya Judi Online",
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
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.badge}>SOSIALISASI & EDUKASI</Text>
            <Text style={styles.title}>📢 Bagikan Bahaya Judol</Text>
            <Text style={styles.subtitle}>
              Bantu selamatkan teman dan keluarga dari jeratan ilusi kemenangan
              judi online.
            </Text>
          </View>

          <View style={styles.previewBox}>
            <Text style={styles.previewTitle}>Pesan yang akan dibagikan:</Text>
            <Text style={styles.previewContent} numberOfLines={8}>
              {generateShareMessage(totalPlayed, winRate, moneyLost)}
            </Text>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.btn, styles.btnShare]}
              onPress={handleShare}
            >
              <Text style={styles.btnShareText}>Bagikan Sekarang</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnCancel]}
              onPress={onClose}
            >
              <Text style={styles.btnCancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 15, 29, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#161F30",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    padding: 24,
    borderWidth: 1,
    borderColor: "#26354D",
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  badge: {
    backgroundColor: "#FF5252",
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#8FA3BF",
    textAlign: "center",
    lineHeight: 18,
  },
  previewBox: {
    backgroundColor: "#0D1424",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E2B42",
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#00E5FF",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  previewContent: {
    fontSize: 12,
    color: "#B4C4D9",
    lineHeight: 17,
  },
  buttonGroup: {
    gap: 10,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnShare: {
    backgroundColor: "#00E5FF",
  },
  btnShareText: {
    color: "#0B132B",
    fontSize: 15,
    fontWeight: "700",
  },
  btnCancel: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#2C3D5A",
  },
  btnCancelText: {
    color: "#8FA3BF",
    fontSize: 14,
    fontWeight: "600",
  },
});
