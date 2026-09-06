import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  BackHandler,
  ToastAndroid,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigation } from "../App";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { signOut } from "../store/slices/authSlice";
import { resetGameStats } from "../store/slices/gameSlice";
import {
  showExitInterstitialAd,
  preloadExitInterstitialAd,
} from "../services/admobService";
import StatCard from "../components/StatCard";
import AdRewardModal from "../components/AdRewardModal";
import EducationModal from "../components/EducationModal";
import ShareModal from "../components/ShareModal";

const SCIENTIFIC_FACTS = [
  "Pemain tidak pernah bisa menang melawan algoritma bandar.",
  "Algoritma judi online dirancang agar pemain 100% bangkrut dalam jangka panjang. Coba semua 5 permainan untuk membuktikannya!",
  "Kemenangan di awal hanyalah umpan psikologis bandar agar hormon dopaminmu meledak dan kamu kecanduan deposit.",
  "Mitos 'jam gacor' dan 'pola spin' hanyalah tipuan affiliator untuk menjebak korban baru mendaftar.",
  "Secara matematis, Return to Player (RTP) selalu diatur menguntungkan bandar. Makin lama bermain, peluang bangkrut mendekati 100%.",
  "Efek Near-Miss (nyaris menang) sengaja diciptakan untuk menipu otakmu seolah kemenangan sudah dekat, padahal sudah diatur kalah.",
  "Di server judi online, taruhanmu sudah tercatat sebelum hasil diacak—bandar selalu tahu pilihanmu terlebih dahulu.",
  "Uang yang hilang di judi online tidak akan pernah kembali; mengejar kekalahan (chasing losses) adalah pintu utama jeratan pinjol.",
  "Sistem crash game memanipulasi emosi FOMO (takut ketinggalan untung), padahal titik ledakan roket sudah dipatok bandar sejak detik pertama.",
  "Satu-satunya cara pasti untuk mengalahkan bandar judi online adalah dengan tidak pernah memainkannya sama sekali.",
];

export default function Home() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const navigation = useNavigation<StackNavigation>();
  const { navigate } = navigation;
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { credits, stats, history } = useAppSelector((state) => state.game);

  const [randomFact] = useState<string>(
    () => SCIENTIFIC_FACTS[Math.floor(Math.random() * SCIENTIFIC_FACTS.length)]
  );
  const [activeTab, setActiveTab] = useState<number>(0); // 0: Game, 1: Statistik
  const [showAdModal, setShowAdModal] = useState(false);
  const [showEduModal, setShowEduModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(10);

  const horizontalScrollRef = useRef<ScrollView>(null);
  const lastBackPressTime = useRef<number>(0);

  // Pre-load iklan keluar segera saat halaman utama terbuka
  useEffect(() => {
    preloadExitInterstitialAd();
  }, []);

  // Tangani tombol Back hardware Android:
  // 1x tekan -> Munculkan Toast "Tekan sekali lagi untuk keluar" & pastikan iklan ter-preload
  // 2x tekan berturut-turut (< 2 detik) -> Tampilkan Iklan Interstitial (tanpa reward), lalu keluar aplikasi
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        const now = Date.now();
        if (lastBackPressTime.current && now - lastBackPressTime.current < 2000) {
          // Pengguna menekan tombol back 2 kali dalam 2 detik
          showExitInterstitialAd(() => {
            BackHandler.exitApp();
          });
          return true;
        }

        lastBackPressTime.current = now;
        preloadExitInterstitialAd();
        ToastAndroid.show("Tekan sekali lagi untuk keluar", ToastAndroid.SHORT);
        return true; // Cegah navigasi kembali ke layar Login
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    horizontalScrollRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setActiveTab(page);
  };

  const handleLogout = () => {
    Alert.alert("Konfirmasi Keluar", "Apakah kamu yakin ingin keluar akun?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: () => {
          dispatch(signOut());
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
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
      {/* 1. Bar Profil Atas (Selalu Menetap di Atas Kedua Tab) */}
      <View style={styles.topBar}>
        <View style={styles.profileInfo}>
          <Text style={styles.greetingText} numberOfLines={1}>
            Halo, {user?.displayName || "Pemain Cerdas"}
          </Text>
          <Text style={styles.statusSubtext} numberOfLines={1}>
            {user?.email || "Akun Google Terhubung"}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Keluar</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Switcher Tab Swipe (Game & Statistik) */}
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 0 && styles.tabItemActiveGame,
            ]}
            onPress={() => handleTabPress(0)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 0 && styles.tabTextActiveGame,
              ]}
            >
              🎮 Game
            </Text>
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>5 Game</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 1 && styles.tabItemActiveStats,
            ]}
            onPress={() => handleTabPress(1)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 1 && styles.tabTextActiveStats,
              ]}
            >
              📊 Statistik
            </Text>
            <View
              style={[
                styles.tabBadge,
                credits === 0 && { backgroundColor: "#FF3D00" },
              ]}
            >
              <Text style={styles.tabBadgeText}>{credits} Kredit</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Horizontal Pager (Bisa Di-Swipe Kiri & Kanan) */}
      <ScrollView
        ref={horizontalScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={styles.pager}
      >
        {/* ================= TAB 1: PILIHAN GAME SIMULASI ================= */}
        <View style={[styles.tabContentPage, { width: SCREEN_WIDTH }]}>
          <ScrollView
            contentContainerStyle={styles.scrollPageContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Banner Motivasi Anti-Judol */}
            <TouchableOpacity
              style={styles.bannerContainer}
              onPress={() => setShowEduModal(true)}
              activeOpacity={0.85}
            >
              <View style={styles.bannerBadge}>
                <Text style={styles.bannerBadgeText}>FAKTA ILMIAH</Text>
              </View>
              <Text style={styles.bannerText}>
                {randomFact}
              </Text>
              <Text style={styles.bannerCta}>Bongkar Trik Bandar Selengkapnya →</Text>
            </TouchableOpacity>

            {/* Sub-header Pilihan Game */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>PILIH SIMULASI GAME ANTI-JUDOL</Text>
              <Text style={styles.sectionSubtitle}>
                Buktikan sendiri bagaimana 5 jenis game ini memanipulasi pemain!
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
                <Text style={styles.gameCardBadgeText}>
                  MANIPULASI PROBABILITAS
                </Text>
              </View>
              <View style={styles.gameCardContent}>
                <Text style={styles.gameCardIcon}>🎯</Text>
                <View style={styles.gameCardInfo}>
                  <Text style={styles.gameCardTitle}>1. Tebak Angka (Tinggi / Rendah)</Text>
                  <Text style={styles.gameCardDesc}>
                    Tebak apakah angka berikutnya lebih tinggi atau rendah. Pelajari bagaimana bandar mengunci kekalahan setelah memberimu umpan menang!
                  </Text>
                  <View style={styles.gameCardFooter}>
                    <Text style={styles.gameCardCost}>Biaya: 1 Kredit (Menang +2)</Text>
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
                <Text style={styles.gameCardBadgeText}>
                  JEBAKAN FOMO & KESERAKAHAN
                </Text>
              </View>
              <View style={styles.gameCardContent}>
                <Text style={styles.gameCardIcon}>🚀</Text>
                <View style={styles.gameCardInfo}>
                  <Text style={styles.gameCardTitle}>2. Roket Boncos (Crash / Aviator)</Text>
                  <Text style={styles.gameCardDesc}>
                    Tarik saldo sebelum roket meledak. Bandar memprogram ledakan instan di 1.01x - 1.15x untuk menguras kreditmu!
                  </Text>
                  <View style={styles.gameCardFooter}>
                    <Text style={styles.gameCardCost}>Biaya: 1 Kredit (Tarik Untung)</Text>
                    <Text style={[styles.gameCardCta, styles.textGreen]}>
                      Luncurkan →
                    </Text>
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
                <Text style={styles.gameCardBadgeText}>
                  ILUSI NYARIS JACKPOT
                </Text>
              </View>
              <View style={styles.gameCardContent}>
                <Text style={styles.gameCardIcon}>🎡</Text>
                <View style={styles.gameCardInfo}>
                  <Text style={styles.gameCardTitle}>3. Roda Putar Ilusi</Text>
                  <Text style={styles.gameCardDesc}>
                    Jarum roda sengaja berhenti 1 milimeter di samping JACKPOT x10 agar kamu kecanduan spin dan terus top-up!
                  </Text>
                  <View style={styles.gameCardFooter}>
                    <Text style={styles.gameCardCost}>Biaya: 1 Kredit (Peluang 0.5%)</Text>
                    <Text style={[styles.gameCardCta, styles.textPurple]}>
                      Putar Roda →
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Kartu Game 4: Slot Rungkad 777 */}
            <TouchableOpacity
              style={[styles.gameCard, styles.gameCardGold]}
              onPress={() => {
                if (credits <= 0) {
                  setShowAdModal(true);
                } else {
                  navigate("SlotGame");
                }
              }}
            >
              <View style={[styles.gameCardBadge, styles.badgeGold]}>
                <Text style={styles.gameCardBadgeText}>MITOS JAM GACOR & SCATTER BAYANGAN</Text>
              </View>
              <View style={styles.gameCardContent}>
                <Text style={styles.gameCardIcon}>🎰</Text>
                <View style={styles.gameCardInfo}>
                  <Text style={styles.gameCardTitle}>4. Slot Rungkad 777</Text>
                  <Text style={styles.gameCardDesc}>
                    Mesin 3-Reel klasik dengan trik visual reel ke-3 'nyaris Maxwin' 777 yang memancing dopamin sampai kredit ludes!
                  </Text>
                  <View style={styles.gameCardFooter}>
                    <Text style={styles.gameCardCost}>Biaya: 1 Kredit (Maxwin x10)</Text>
                    <Text style={[styles.gameCardCta, styles.textGold]}>
                      Putar Slot →
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Kartu Game 5: Suit Bandar Licik (Batu Gunting Kertas) */}
            <TouchableOpacity
              style={[styles.gameCard, styles.gameCardRose]}
              onPress={() => {
                if (credits <= 0) {
                  setShowAdModal(true);
                } else {
                  navigate("SuitGame");
                }
              }}
            >
              <View style={[styles.gameCardBadge, styles.badgeRose]}>
                <Text style={styles.gameCardBadgeText}>SERVER SUDAH TAHU TARUHANMU</Text>
              </View>
              <View style={styles.gameCardContent}>
                <Text style={styles.gameCardIcon}>✌️</Text>
                <View style={styles.gameCardInfo}>
                  <Text style={styles.gameCardTitle}>5. Suit Bandar Licik</Text>
                  <Text style={styles.gameCardDesc}>
                    Batu (✊) • Gunting (✌️) • Kertas (✋). Buktikan bahwa server bandar sudah membaca pilihanmu sebelum mengocok kartu lawan!
                  </Text>
                  <View style={styles.gameCardFooter}>
                    <Text style={styles.gameCardCost}>Biaya: 1 Kredit (Menang +2)</Text>
                    <Text style={[styles.gameCardCta, styles.textRose]}>
                      Adu Suit →
                    </Text>
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
          </ScrollView>
        </View>

        {/* ================= TAB 2: STATISTIK & RIWAYAT ================= */}
        <View style={[styles.tabContentPage, { width: SCREEN_WIDTH }]}>
          <ScrollView
            contentContainerStyle={styles.scrollPageContent}
            showsVerticalScrollIndicator={false}
          >
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
                  Belum ada riwayat permainan. Swipe ke tab "Pilihan Game" untuk mulai mencoba simulasi!
                </Text>
              ) : (
                <>
                  {history.slice(0, historyLimit).map((item, idx) => {
                    const netCredits =
                      item.rewardCredits !== undefined
                        ? item.rewardCredits > 1
                          ? `+${item.rewardCredits - 1} Kredit`
                          : item.rewardCredits === 1
                            ? "Balik Modal"
                            : "-1 Kredit"
                        : item.winner
                          ? "+1 Kredit"
                          : "-1 Kredit";

                    return (
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
                                : item.gameType === "slot"
                                  ? `Reel: ${item.reels ? item.reels.join(" ") : "Slot 777"}`
                                  : item.gameType === "suit"
                                    ? `Kamu: ${item.playerChoice?.toUpperCase()} vs Bandar: ${item.bandarChoice?.toUpperCase()}`
                                    : `Angka: ${item.baseNumber} → ${item.resultNumber} (${item.choice === "higher" ? "Tinggi" : "Rendah"})`}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.historyCost,
                            item.winner && { color: "#00E676" },
                          ]}
                        >
                          {netCredits}
                        </Text>
                      </View>
                    );
                  })}

                  {/* Tombol Expand Riwayat */}
                  {history.length > historyLimit ? (
                    <TouchableOpacity
                      style={styles.expandHistoryBtn}
                      onPress={() => setHistoryLimit((prev) => prev + 10)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.expandHistoryText}>
                        📖 Lihat Lebih Banyak (+10 Riwayat)
                      </Text>
                    </TouchableOpacity>
                  ) : historyLimit > 10 ? (
                    <TouchableOpacity
                      style={styles.expandHistoryBtn}
                      onPress={() => setHistoryLimit(10)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.expandHistoryText}>
                        ▲ Ciutkan Riwayat
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              )}
            </View>

            {/* Catatan Edukasi Keuangan */}
            <View style={styles.financeInsightBox}>
              <Text style={styles.financeInsightTitle}>
                📉 Pelajaran Keuangan:
              </Text>
              <Text style={styles.financeInsightText}>
                Total uang boncos simulasi (Rp {stats.simulatedMoneyLost.toLocaleString("id-ID")}) menunjukkan betapa cepatnya uang terbuang sia-sia hanya dalam beberapa puluh putaran judi online.
              </Text>
            </View>
          </ScrollView>
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
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0B121E",
    borderBottomWidth: 1,
    borderBottomColor: "#172236",
  },
  profileInfo: {
    flex: 1,
    marginRight: 12,
  },
  greetingText: {
    fontSize: 18,
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
  tabBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#0B121E",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#121A2A",
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: "#1E2B42",
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabItemActiveGame: {
    backgroundColor: "#1A2B42",
    borderWidth: 1,
    borderColor: "#00E5FF",
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  tabItemActiveStats: {
    backgroundColor: "#1D283E",
    borderWidth: 1,
    borderColor: "#FFB300",
    shadowColor: "#FFB300",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6F85A3",
  },
  tabTextActiveGame: {
    color: "#00E5FF",
    fontWeight: "900",
  },
  tabTextActiveStats: {
    color: "#FFB300",
    fontWeight: "900",
  },
  tabBadge: {
    backgroundColor: "#0E1826",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tabBadgeText: {
    color: "#A2B6CF",
    fontSize: 9,
    fontWeight: "800",
  },
  pager: {
    flex: 1,
  },
  tabContentPage: {
    flex: 1,
  },
  scrollPageContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 36,
    gap: 14,
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
    marginTop: 2,
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
  gameCardGold: {
    borderColor: "#F59E0B",
    shadowColor: "#F59E0B",
  },
  gameCardRose: {
    borderColor: "#F43F5E",
    shadowColor: "#F43F5E",
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
  badgeGold: {
    backgroundColor: "rgba(245, 158, 11, 0.18)",
  },
  badgeRose: {
    backgroundColor: "rgba(244, 63, 94, 0.18)",
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
  textGold: {
    color: "#F59E0B",
  },
  textRose: {
    color: "#F43F5E",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
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
  expandHistoryBtn: {
    backgroundColor: "rgba(0, 229, 255, 0.08)",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.25)",
  },
  expandHistoryText: {
    color: "#00E5FF",
    fontSize: 12,
    fontWeight: "800",
  },
  financeInsightBox: {
    backgroundColor: "#1A1523",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FF5252",
  },
  financeInsightTitle: {
    color: "#FF5252",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  financeInsightText: {
    color: "#E2C6C6",
    fontSize: 11,
    lineHeight: 16,
  },
});