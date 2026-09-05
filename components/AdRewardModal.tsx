import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAppDispatch } from "../hooks/useRedux";
import { watchAdReward } from "../store/slices/gameSlice";
import {
  isAdMobAvailable,
  GOOGLE_TEST_REWARDED_ID,
  PROD_REWARDED_AD_UNIT_ID,
} from "../services/admobService";

interface AdRewardModalProps {
  visible: boolean;
  onClose: () => void;
  onRewardClaimed?: () => void;
}

export default function AdRewardModal({
  visible,
  onClose,
  onRewardClaimed,
}: AdRewardModalProps) {
  const dispatch = useAppDispatch();
  const [countdown, setCountdown] = useState(5);
  const [isFinished, setIsFinished] = useState(false);
  const [admobLoading, setAdmobLoading] = useState(false);
  const [admobStatus, setAdmobStatus] = useState<string>("Memuat iklan...");
  const [isNativeAdMob, setIsNativeAdMob] = useState(false);
  const rewardedAdRef = useRef<any>(null);

  const handleRewardEarned = () => {
    dispatch(watchAdReward());
    if (onRewardClaimed) {
      onRewardClaimed();
    }
    onClose();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (visible) {
      setCountdown(5);
      setIsFinished(false);
      setAdmobLoading(true);
      setAdmobStatus("Menghubungkan ke Google AdMob...");

      let adLoaded = false;

      // Cek apakah modul native AdMob tersedia (hanya di standalone APK / dev client)
      if (!isAdMobAvailable()) {
        setIsNativeAdMob(false);
        setAdmobLoading(false);
        setAdmobStatus("Mode Simulasi Iklan (Expo Go)");
      } else {
        try {
          const MobileAds = require("react-native-google-mobile-ads");
          const { RewardedAd, RewardedAdEventType, AdEventType, TestIds } = MobileAds;

          const adUnitId = __DEV__
            ? (TestIds?.REWARDED || GOOGLE_TEST_REWARDED_ID)
            : PROD_REWARDED_AD_UNIT_ID;

          console.log("[AdMob] Memulai request iklan dengan Unit ID:", adUnitId);
          setIsNativeAdMob(true);

          const rewarded = RewardedAd.createForAdRequest(adUnitId, {
            requestNonPersonalizedAdsOnly: true,
          });

          rewardedAdRef.current = rewarded;

          const unsubscribeLoaded = rewarded.addAdEventListener(
            RewardedAdEventType.LOADED,
            () => {
              adLoaded = true;
              setAdmobLoading(false);
              setAdmobStatus("Iklan AdMob siap ditayangkan!");
              try {
                rewarded.show();
              } catch (e) {
                console.log("Gagal menampilkan AdMob:", e);
              }
            }
          );

          const unsubscribeEarned = rewarded.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            () => {
              handleRewardEarned();
            }
          );

          const unsubscribeClosed = rewarded.addAdEventListener(
            AdEventType.CLOSED,
            () => {
              onClose();
            }
          );

          const unsubscribeError = rewarded.addAdEventListener(
            AdEventType.ERROR,
            (error: any) => {
              console.log("AdMob AdEventType.ERROR:", error);
              setAdmobLoading(false);
              setAdmobStatus("Mode Simulasi (AdMob offline / akun baru)");
            }
          );

          rewarded.load();

          return () => {
            unsubscribeLoaded();
            unsubscribeEarned();
            unsubscribeClosed();
            unsubscribeError();
          };
        } catch (err) {
          setIsNativeAdMob(false);
          setAdmobLoading(false);
          setAdmobStatus("Mode Simulasi Iklan (Expo Go)");
        }
      }

      // Hitung mundur simulasi (selalu aktif sebagai fallback aman)
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header Iklan */}
          <View style={styles.adHeader}>
            <View
              style={[
                styles.adBadge,
                !isNativeAdMob && { backgroundColor: "#332211" },
              ]}
            >
              <Text
                style={[
                  styles.adBadgeText,
                  !isNativeAdMob && { color: "#FFA726" },
                ]}
              >
                {isNativeAdMob
                  ? __DEV__
                    ? "Google AdMob (Test Unit)"
                    : "Google AdMob (Live)"
                  : "Mode Simulasi (Expo Go)"}
              </Text>
            </View>
            <Text style={styles.timerText}>
              {isFinished ? "Selesai!" : `Tonton: ${countdown} detik`}
            </Text>
          </View>

          {/* Frame Video Simulasi Iklan */}
          <View style={styles.videoFrame}>
            <Text style={styles.videoLogo}>🎰 TOP-UP DEPO ENGINE</Text>
            <Text style={styles.videoSlogan}>
              "Gacor Hari Ini! Depo Sekarang, Gandakan Uangmu!"
            </Text>
            <Text style={styles.videoFakeStar}>⭐⭐⭐⭐⭐</Text>

            {admobLoading ? (
              <View style={styles.progressContainer}>
                <ActivityIndicator color="#00E5FF" size="small" />
                <Text style={styles.progressText}>{admobStatus}</Text>
              </View>
            ) : !isFinished ? (
              <View style={styles.progressContainer}>
                <ActivityIndicator color="#00E5FF" size="small" />
                <Text style={styles.progressText}>
                  Menonton iklan ({countdown}s)...
                </Text>
              </View>
            ) : (
              <View style={styles.rewardNotice}>
                <Text style={styles.rewardNoticeIcon}>🎁</Text>
                <Text style={styles.rewardNoticeText}>
                  Iklan selesai! +5 Kredit siap diklaim.
                </Text>
              </View>
            )}
          </View>

          {/* Banner Penjelasan Expo Go */}
          {!isNativeAdMob && (
            <View style={styles.expoGoBanner}>
              <Text style={styles.expoGoBannerTitle}>
                📱 Info Pengujian di Expo Go:
              </Text>
              <Text style={styles.expoGoBannerText}>
                Aplikasi Expo Go tidak memiliki binary Google Mobile Ads. Karena itu berjalan mode simulasi 5 detik (+5 kredit). Pada build APK Standalone / rilis Play Store, iklan Google AdMob asli akan tayang otomatis.
              </Text>
            </View>
          )}

          {/* Kotak Edukasi Pembongkar Trik */}
          <View style={styles.educationBox}>
            <Text style={styles.educationTitle}>
              💡 Edukasi Simulasi Top-Up:
            </Text>
            <Text style={styles.educationText}>
              Dalam judi online nyata, kamu akan tergoda menyetor uang asli
              (Depo). Menonton iklan ini mensimulasikan waktu & fokus yang kamu
              korbankan demi ilusi kemenangan yang sudah disetel bandar!
            </Text>
          </View>

          {/* Tombol Aksi */}
          <View style={styles.actions}>
            {isFinished ? (
              <TouchableOpacity
                style={styles.btnClaim}
                onPress={handleRewardEarned}
              >
                <Text style={styles.btnClaimText}>
                  Klaim +5 Kredit Sekarang!
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.btnSkip} onPress={onClose}>
                <Text style={styles.btnSkipText}>
                  Tutup (Batal Top-Up Kredit)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 15, 29, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    backgroundColor: "#131C2D",
    borderRadius: 24,
    width: "100%",
    maxWidth: 420,
    padding: 20,
    borderWidth: 1,
    borderColor: "#22334F",
  },
  adHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  adBadge: {
    backgroundColor: "#2B3A52",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  adBadgeText: {
    color: "#8FA3BF",
    fontSize: 10,
    fontWeight: "700",
  },
  timerText: {
    color: "#00E5FF",
    fontSize: 13,
    fontWeight: "700",
  },
  videoFrame: {
    backgroundColor: "#090E17",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1E2B42",
    marginBottom: 16,
  },
  videoLogo: {
    color: "#FFB300",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 6,
    letterSpacing: 1,
  },
  videoSlogan: {
    color: "#BAC9DC",
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 8,
  },
  videoFakeStar: {
    fontSize: 14,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressText: {
    color: "#00E5FF",
    fontSize: 12,
    fontWeight: "600",
  },
  rewardNotice: {
    alignItems: "center",
  },
  rewardNoticeIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  rewardNoticeText: {
    color: "#00E5FF",
    fontSize: 13,
    fontWeight: "700",
  },
  expoGoBanner: {
    backgroundColor: "#261E14",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF9800",
    marginBottom: 14,
  },
  expoGoBannerTitle: {
    color: "#FFA726",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },
  expoGoBannerText: {
    color: "#FFE0B2",
    fontSize: 11,
    lineHeight: 16,
  },
  educationBox: {
    backgroundColor: "#1F1524",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF5252",
    marginBottom: 16,
  },
  educationTitle: {
    color: "#FF5252",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },
  educationText: {
    color: "#F0C8C8",
    fontSize: 11,
    lineHeight: 16,
  },
  actions: {
    width: "100%",
  },
  btnClaim: {
    backgroundColor: "#00E5FF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnClaimText: {
    color: "#090E17",
    fontSize: 15,
    fontWeight: "800",
  },
  btnSkip: {
    paddingVertical: 12,
    alignItems: "center",
  },
  btnSkipText: {
    color: "#7E97B8",
    fontSize: 13,
  },
});
