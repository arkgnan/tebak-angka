import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

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
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.badge}>EDUKASI & FAKTA NYATA</Text>
            <Text style={styles.title}>🧠 Membongkar Rahasia Bandar Judol</Text>
            <Text style={styles.subtitle}>
              Mengapa pemain TIDAK PERNAH bisa menang dalam judi online?
            </Text>
          </View>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                1. Algoritma Umpan (Baiting Dopamin)
              </Text>
              <Text style={styles.sectionText}>
                Sistem tidak menggunakan angka acak murni (RNG jujur). Bandar
                memprogram algoritma agar pemain kalah beruntun (3-5 kali), lalu
                sengaja memberikan 1 kemenangan. Otak Anda dibanjiri dopamin dan
                tertipu ilusi bahwa kemenangan berikutnya sudah dekat.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                2. Dilarang Menang Beruntun
              </Text>
              <Text style={styles.sectionText}>
                Pernahkah Anda memperhatikan bahwa setelah menang sekali, putaran
                berikutnya selalu ludes? Algoritma bandar langsung mengunci
                kekalahan agar modal dan profit Anda disedot kembali tanpa
                sempat ditarik (withdraw).
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                3. Ilusi Top-Up & Sunk Cost Fallacy
              </Text>
              <Text style={styles.sectionText}>
                Menonton iklan pada game ini mensimulasikan top-up uang asli.
                Pemain merasa "cuma depo sedikit lagi untuk balas modal".
                Padahal, semakin sering Anda top-up, semakin dalam lubang boncos
                yang Anda gali.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                4. House Always Wins (Bandar Selalu Menang)
              </Text>
              <Text style={styles.sectionText}>
                Secara hukum probabilitas dan matematika terapan, peluang selalu
                berat sebelah ke bandar. Satu-satunya cara agar tidak kalah judi
                online adalah: JANGAN PERNAH BERMAIN!
              </Text>
            </View>

            <View style={styles.hotlineBox}>
              <Text style={styles.hotlineTitle}>
                🚨 BUTUH BANTUAN BERHENTI JUDOL?
              </Text>
              <Text style={styles.hotlineItem}>
                • Hotline SEJIWA Kemenkes: 119 (ext 8)
              </Text>
              <Text style={styles.hotlineItem}>
                • Aduan Konten Komdigi: aduankonten.id / WA: 0811-9224-545
              </Text>
              <Text style={styles.hotlineItem}>
                • Laporkan Rekening Penampung: cekrekening.id
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Saya Mengerti & Sadar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 15, 29, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#161F30",
    borderRadius: 24,
    width: "100%",
    maxWidth: 440,
    maxHeight: "85%",
    padding: 22,
    borderWidth: 1,
    borderColor: "#283954",
  },
  header: {
    alignItems: "center",
    marginBottom: 14,
  },
  badge: {
    backgroundColor: "#00E5FF",
    color: "#0B132B",
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#8FA3BF",
    textAlign: "center",
    marginTop: 4,
  },
  scroll: {
    marginVertical: 10,
  },
  section: {
    backgroundColor: "#0E1524",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#FFB300",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFB300",
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 12,
    color: "#BAC9DC",
    lineHeight: 18,
  },
  hotlineBox: {
    backgroundColor: "#2E151E",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FF5252",
    marginVertical: 6,
  },
  hotlineTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FF5252",
    marginBottom: 6,
  },
  hotlineItem: {
    fontSize: 12,
    color: "#FFD0D0",
    lineHeight: 18,
  },
  closeBtn: {
    backgroundColor: "#00E5FF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  closeBtnText: {
    color: "#0B132B",
    fontSize: 15,
    fontWeight: "700",
  },
});
