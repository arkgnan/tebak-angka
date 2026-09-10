import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface EducationModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EducationModal({
  visible,
  onClose,
}: EducationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Top Bar Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Text style={styles.backBtnText}>← Kembali</Text>
          </TouchableOpacity>
          <View style={styles.badgeTop}>
            <Text style={styles.badgeTopText}>🧠 EDUKASI & FAKTA NYATA</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.mainTitle}>
              🧠 Membongkar Rahasia Bandar Judol
            </Text>
            <Text style={styles.subtitle}>
              Mengapa pemain TIDAK PERNAH bisa menang melawan algoritma bandar
              dalam jangka panjang?
            </Text>
          </View>

          {/* Section 1: Algoritma Umpan */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionIcon}>🎰</Text>
              <Text style={styles.sectionTitle}>
                1. Algoritma Umpan (Baiting Dopamin)
              </Text>
            </View>
            <Text style={styles.sectionText}>
              Sistem tidak menggunakan angka acak murni (RNG jujur). Bandar
              memprogram algoritma agar pemain kalah beruntun (3-5 kali), lalu
              sengaja memberikan 1 kemenangan kecil. Otak Anda dibanjiri hormon
              dopamin dan tertipu ilusi bahwa kemenangan berikutnya sudah dekat.
            </Text>
          </View>

          {/* Section 2: Dilarang Menang Beruntun */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionIcon}>🔒</Text>
              <Text style={styles.sectionTitle}>
                2. Dilarang Menang Beruntun (Loss-Locking)
              </Text>
            </View>
            <Text style={styles.sectionText}>
              Pernahkah Anda memperhatikan bahwa setelah menang sekali, putaran
              berikutnya selalu ludes? Algoritma bandar langsung mengunci
              kekalahan otomatis agar modal dan profit Anda disedot kembali
              tanpa sempat ditarik (withdraw).
            </Text>
          </View>

          {/* Section 3: Ilusi Top-Up & Sunk Cost */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionIcon}>💸</Text>
              <Text style={styles.sectionTitle}>
                3. Ilusi Top-Up & Sunk Cost Fallacy
              </Text>
            </View>
            <Text style={styles.sectionText}>
              Pemain merasa "cuma depo sedikit lagi untuk balas modal".
              Padahal, semakin sering Anda top-up, semakin dalam lubang boncos
              yang Anda gali. Inilah pintu utama yang menjebak jutaan korban ke
              dalam pinjaman online (pinjol).
            </Text>
          </View>

          {/* Section 4: Binary Option & Judi Berkedok Trading */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionIcon}>📈</Text>
              <Text style={styles.sectionTitle}>
                4. Kedok Trading Binary Option (Binomo / Quotex)
              </Text>
            </View>
            <Text style={styles.sectionText}>
              Platform binary option bukanlah investasi atau bursa saham resmi
              (dilarang Bappebti & OJK). Mekanismenya murni tebak-tebakan harga
              50:50 dengan grafik internal yang bisa disentak sesuka server
              (trik candle jarum detik terakhir). Lebih dari 70% kerugian pemain
              mengalir langsung ke kantong affiliate/influencer!
            </Text>
          </View>

          {/* Section 5: House Always Wins */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionIcon}>⚖️</Text>
              <Text style={styles.sectionTitle}>
                5. House Always Wins (Kemustahilan Matematis)
              </Text>
            </View>
            <Text style={styles.sectionText}>
              Secara hukum matematika probabilitas terapan, Return to Player (RTP)
              selalu diatur di bawah 100% untuk keuntungan pengelola. Makin lama
              Anda bermain, peluang bangkrut mendekati 100%. Satu-satunya cara
              pasti untuk mengalahkan bandar adalah: JANGAN PERNAH BERMAIN!
            </Text>
          </View>

          {/* Hotline Box Darurat */}
          <View style={styles.hotlineBox}>
            <Text style={styles.hotlineTitle}>
              🚨 BUTUH BANTUAN BERHENTI DARI KECANDUAN?
            </Text>
            <Text style={styles.hotlineItem}>
              • <Text style={styles.boldWhite}>Hotline SEJIWA Kemenkes:</Text> 119 (ext 8)
            </Text>
            <Text style={styles.hotlineItem}>
              • <Text style={styles.boldWhite}>Aduan Konten Komdigi:</Text> aduankonten.id / WA: 0811-9224-545
            </Text>
            <Text style={styles.hotlineItem}>
              • <Text style={styles.boldWhite}>Cek & Lapor Rekening Penipu:</Text> cekrekening.id
            </Text>
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeBtnText}>Saya Mengerti & Sadar</Text>
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
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1A2638",
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#162235",
  },
  backBtnText: {
    color: "#00E5FF",
    fontSize: 13,
    fontWeight: "700",
  },
  badgeTop: {
    backgroundColor: "rgba(0, 229, 255, 0.12)",
    borderColor: "#00E5FF",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTopText: {
    color: "#00E5FF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#8FA3BF",
    lineHeight: 19,
  },
  section: {
    backgroundColor: "#131D2D",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#FFB300",
    borderWidth: 1,
    borderColor: "#1F2E45",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFB300",
    flex: 1,
  },
  sectionText: {
    fontSize: 12.5,
    color: "#BAC9DC",
    lineHeight: 19,
  },
  hotlineBox: {
    backgroundColor: "#26131D",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#FF5252",
    marginTop: 8,
    marginBottom: 12,
  },
  hotlineTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FF5252",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  hotlineItem: {
    fontSize: 12,
    color: "#E2CFD6",
    lineHeight: 20,
    marginBottom: 4,
  },
  boldWhite: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#1A2638",
    backgroundColor: "#0E1726",
  },
  closeBtn: {
    backgroundColor: "#00E5FF",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  closeBtnText: {
    color: "#07111E",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
