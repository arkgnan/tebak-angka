import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigation } from "../App";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { googleSignIn, clearError } from "../store/slices/authSlice";

export default function Login() {
  const navigation = useNavigation<StackNavigation>();
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    }
  }, [user, navigation]);

  const handleGoogleSignIn = () => {
    dispatch(clearError());
    dispatch(googleSignIn());
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Edukasi Atas */}
        <View style={styles.header}>
          <View style={styles.badgeWarning}>
            <Text style={styles.badgeWarningText}>
              ⚠️ SIMULASI EDUKASI ANTI-JUDOL
            </Text>
          </View>
          <Text style={styles.title}>TEBAK ANGKA</Text>
          <Text style={styles.subtitle}>
            Bongkar Rahasia Mengapa Bandar Selalu Menang!
          </Text>
        </View>

        {/* Kartu Informasi & Fakta */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>MENGAPA GAME INI DIBUAT?</Text>
          <Text style={styles.cardText}>
            Game ini mensimulasikan psikologi dan algoritma jebakan judi online.
            Setiap putaran menggunakan 1 kredit, dan kamu akan melihat bagaimana
            bandar memanipulasi kemenanganmu sesaat hanya sebagai umpan untuk
            membuatmu terus top-up!
          </Text>

          <View style={styles.giftBadge}>
            <Text style={styles.giftText}>
              🎁 Mulai dengan 3 Kredit Gratis Pertama
            </Text>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>⚠️ Gagal Masuk</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Tombol Login Google */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleBtnText}>Masuk dengan Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Catatan Kaki */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tidak ada transaksi uang asli dalam aplikasi ini. 100% didedikasikan
            untuk edukasi pencegahan dan pemulihan dari bahaya judi online di
            Indonesia.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B121E",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  badgeWarning: {
    backgroundColor: "#FF3D00",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 14,
  },
  badgeWarningText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#00E5FF",
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#141D2E",
    borderRadius: 22,
    padding: 24,
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderColor: "#22314A",
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFB300",
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 13,
    color: "#A2B6CF",
    lineHeight: 20,
    marginBottom: 16,
  },
  giftBadge: {
    backgroundColor: "#0D2538",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#00E5FF",
    marginBottom: 20,
    alignItems: "center",
  },
  giftText: {
    color: "#00E5FF",
    fontSize: 12,
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: "#38151B",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF5252",
    marginBottom: 16,
  },
  errorTitle: {
    color: "#FF8A80",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
    textAlign: "center",
  },
  errorText: {
    color: "#FFCDD2",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  googleBtn: {
    backgroundColor: "#4285F4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 4,
    shadowColor: "#4285F4",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  googleIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginRight: 10,
  },
  googleBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#22314A",
  },
  dividerText: {
    color: "#5E7390",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 12,
    letterSpacing: 1,
  },
  guestBtn: {
    backgroundColor: "#1B2A40",
    borderWidth: 1.5,
    borderColor: "#00E5FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  guestIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  guestBtnText: {
    color: "#00E5FF",
    fontSize: 14,
    fontWeight: "700",
  },
  footer: {
    marginTop: 28,
    maxWidth: 380,
  },
  footerText: {
    fontSize: 11,
    color: "#5E7390",
    textAlign: "center",
    lineHeight: 16,
  },
});
