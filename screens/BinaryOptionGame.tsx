import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigation } from "../App";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { playBinaryOptionRound } from "../store/slices/gameSlice";
import AdRewardModal from "../components/AdRewardModal";
import { SoundEffects } from "../services/soundService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface AssetConfig {
  id: string;
  name: string;
  symbol: string;
  basePrice: number;
  step: number;
  volatility: number;
}

const ASSETS: AssetConfig[] = [
  {
    id: "usd_idr",
    name: "USD / IDR",
    symbol: "💵",
    basePrice: 15850.0,
    step: 2.5,
    volatility: 0.6,
  },
  {
    id: "ihsg",
    name: "IHSG (Indeks)",
    symbol: "📈",
    basePrice: 7280.0,
    step: 1.8,
    volatility: 0.8,
  },
  {
    id: "btc_usdt",
    name: "BTC / USDT",
    symbol: "⚡",
    basePrice: 65420.0,
    step: 12.0,
    volatility: 1.5,
  },
];

type TradeStatus = "idle" | "active" | "won" | "lost";

export default function BinaryOptionGame() {
  const { goBack } = useNavigation<StackNavigation>();
  const dispatch = useAppDispatch();
  const { credits } = useAppSelector((state) => state.game);

  const [selectedAsset, setSelectedAsset] = useState<AssetConfig>(ASSETS[0]);
  const [duration, setDuration] = useState<5 | 10>(5); // 5s (Turbo) vs 10s (Standar)
  const [betCredits, setBetCredits] = useState<number>(1);
  const [status, setStatus] = useState<TradeStatus>("idle");
  const [tradeDirection, setTradeDirection] = useState<"up" | "down" | null>(null);

  // Price & Chart State (18 titik harga)
  const [currentPrice, setCurrentPrice] = useState<number>(selectedAsset.basePrice);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [entryPrice, setEntryPrice] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isSpikeLoss, setIsSpikeLoss] = useState<boolean>(false);
  const [showAdModal, setShowAdModal] = useState(false);

  // Animasi Pulsing Titik Harga Live
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const priceInterval = useRef<NodeJS.Timeout | null>(null);

  // Inisialisasi Riwayat Grafik Awal
  useEffect(() => {
    let p = selectedAsset.basePrice;
    const initialHistory: number[] = [];
    for (let i = 0; i < 20; i++) {
      p += (Math.random() - 0.48) * selectedAsset.step * selectedAsset.volatility;
      initialHistory.push(+p.toFixed(2));
    }
    setPriceHistory(initialHistory);
    setCurrentPrice(initialHistory[initialHistory.length - 1]);
  }, [selectedAsset]);

  // Efek Denyut Titik Live
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Pergerakan Harga Live Real-Time (Setiap 100ms)
  useEffect(() => {
    priceInterval.current = setInterval(() => {
      setCurrentPrice((prev) => {
        const delta = (Math.random() - 0.49) * selectedAsset.step * selectedAsset.volatility;
        const newPrice = +(prev + delta).toFixed(2);
        setPriceHistory((hist) => [...hist.slice(-19), newPrice]);
        return newPrice;
      });
    }, 120);

    return () => {
      if (priceInterval.current) clearInterval(priceInterval.current);
    };
  }, [selectedAsset]);

  // Sesuaikan taruhan jika kredit berkurang
  useEffect(() => {
    if (credits > 0 && betCredits > credits) {
      setBetCredits(credits);
    }
  }, [credits]);

  // Otomatis buka modal iklan jika kredit habis
  useEffect(() => {
    if (credits <= 0 && status === "idle") {
      const t = setTimeout(() => setShowAdModal(true), 600);
      return () => clearTimeout(t);
    }
  }, [credits, status]);

  // Eksekusi Membuka Posisi Order (Beli/Naik atau Jual/Turun)
  const handleOpenTrade = (direction: "up" | "down") => {
    if (credits <= 0) {
      SoundEffects.playClick();
      setShowAdModal(true);
      return;
    }

    SoundEffects.playClick();
    const fixedEntry = currentPrice;
    setEntryPrice(fixedEntry);
    setTradeDirection(direction);
    setStatus("active");
    setSecondsLeft(duration);
    setIsSpikeLoss(false);

    // Algoritma Bandar Binary Option:
    // 65% Bandar menang (Pemain kalah, 40% di antaranya dengan jarum detik terakhir)
    // 35% Pemain menang (Umpan psikologis)
    const bandarRoll = Math.random();
    const willWin = bandarRoll < 0.35;
    const willSpike = !willWin && Math.random() < 0.65; // Trik Jarum Detik Terakhir

    let remaining = duration;

    if (timerInterval.current) clearInterval(timerInterval.current);

    timerInterval.current = setInterval(() => {
      remaining -= 1;
      setSecondsLeft(remaining);

      if (remaining > 0) {
        SoundEffects.playClick();
      }

      // Detik terakhir (0s): Evaluasi Hasil
      if (remaining <= 0) {
        if (timerInterval.current) clearInterval(timerInterval.current);

        let finalPrice = currentPrice;
        if (willWin) {
          // Buat harga menguntungkan pemain
          finalPrice =
            direction === "up"
              ? +(fixedEntry + Math.random() * 3 + 1.2).toFixed(2)
              : +(fixedEntry - Math.random() * 3 - 1.2).toFixed(2);
        } else {
          // Buat pemain kalah
          if (willSpike) {
            // Trik Jarum: Hanya beda 0.2 - 0.8 pips berlawanan
            finalPrice =
              direction === "up"
                ? +(fixedEntry - (Math.random() * 0.5 + 0.3)).toFixed(2)
                : +(fixedEntry + (Math.random() * 0.5 + 0.3)).toFixed(2);
            setIsSpikeLoss(true);
          } else {
            finalPrice =
              direction === "up"
                ? +(fixedEntry - Math.random() * 2.5 - 1.0).toFixed(2)
                : +(fixedEntry + Math.random() * 2.5 + 1.0).toFixed(2);
          }
        }

        setCurrentPrice(finalPrice);

        if (willWin) {
          SoundEffects.playWin();
          setStatus("won");
        } else {
          SoundEffects.playLoss();
          setStatus("lost");
        }

        dispatch(
          playBinaryOptionRound({
            won: willWin,
            betCredits,
            assetTitle: selectedAsset.name,
            direction,
            entryPrice: fixedEntry,
            exitPrice: finalPrice,
            isLastSecondSpike: willSpike,
          }),
        );
      }
    }, 1000);
  };

  const handleResetOrder = () => {
    SoundEffects.playClick();
    setStatus("idle");
    setEntryPrice(null);
    setTradeDirection(null);
    setIsSpikeLoss(false);
  };

  // Kalkulasi Tampilan Grafik Sederhana (Rentang Min & Max)
  const minPrice = Math.min(...priceHistory, entryPrice ?? currentPrice);
  const maxPrice = Math.max(...priceHistory, entryPrice ?? currentPrice);
  const priceRange = maxPrice - minPrice || 1;

  // Status visual saat trade aktif
  const isWinningLive =
    entryPrice !== null &&
    (tradeDirection === "up"
      ? currentPrice > entryPrice
      : currentPrice < entryPrice);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => goBack()}>
            <Text style={styles.backBtnText}>← Kembali</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>TRADING BINARY</Text>
            <View style={styles.badgeFake}>
              <Text style={styles.badgeFakeText}>⚠️ SIMULASI ABAL-ABAL</Text>
            </View>
          </View>

          <View style={styles.creditBadge}>
            <Text style={styles.creditBadgeLabel}>KREDIT:</Text>
            <Text style={styles.creditBadgeValue}>{credits}</Text>
          </View>
        </View>

        {/* 1. Selector Aset Emiten */}
        <View style={styles.assetTabs}>
          {ASSETS.map((asset) => (
            <TouchableOpacity
              key={asset.id}
              style={[
                styles.assetTabItem,
                selectedAsset.id === asset.id && styles.assetTabItemActive,
              ]}
              onPress={() => {
                if (status === "active") return;
                SoundEffects.playClick();
                setSelectedAsset(asset);
                handleResetOrder();
              }}
              disabled={status === "active"}
            >
              <Text style={styles.assetTabSymbol}>{asset.symbol}</Text>
              <Text
                style={[
                  styles.assetTabText,
                  selectedAsset.id === asset.id && styles.assetTabTextActive,
                ]}
              >
                {asset.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 2. Layar Chart Grafik Real-Time */}
        <View style={styles.chartContainer}>
          {/* Top Bar Chart: Harga Terkini & Timer */}
          <View style={styles.chartTopBar}>
            <View>
              <Text style={styles.chartAssetTitle}>
                {selectedAsset.symbol} {selectedAsset.name}
              </Text>
              <Text
                style={[
                  styles.chartCurrentPrice,
                  isWinningLive ? styles.textGreen : styles.textYellow,
                ]}
              >
                {currentPrice.toFixed(2)}
              </Text>
            </View>

            {/* Indikator Waktu Hitung Mundur */}
            {status === "active" ? (
              <View style={styles.timerBadgeActive}>
                <Text style={styles.timerTextActive}>⏱️ {secondsLeft}s</Text>
              </View>
            ) : (
              <View style={styles.durationSelector}>
                <TouchableOpacity
                  style={[
                    styles.durationBtn,
                    duration === 5 && styles.durationBtnActive,
                  ]}
                  onPress={() => setDuration(5)}
                >
                  <Text
                    style={[
                      styles.durationBtnText,
                      duration === 5 && styles.durationBtnTextActive,
                    ]}
                  >
                    ⚡ 5s
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.durationBtn,
                    duration === 10 && styles.durationBtnActive,
                  ]}
                  onPress={() => setDuration(10)}
                >
                  <Text
                    style={[
                      styles.durationBtnText,
                      duration === 10 && styles.durationBtnTextActive,
                    ]}
                  >
                    ⏱️ 10s
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Area Visual Candlestick / Bar Chart */}
          <View style={styles.chartArea}>
            {/* Garis Horizontal Titik Masuk (Entry Price) */}
            {entryPrice !== null && (
              <View
                style={[
                  styles.entryLine,
                  {
                    top: `${Math.max(
                      10,
                      Math.min(
                        85,
                        ((maxPrice - entryPrice) / priceRange) * 100,
                      ),
                    )}%`,
                  },
                ]}
              >
                <View style={styles.entryFlag}>
                  <Text style={styles.entryFlagText}>
                    {tradeDirection === "up" ? "BUY ▲" : "SELL ▼"}{" "}
                    {entryPrice.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            {/* Titik Batang Harga Real-Time */}
            <View style={styles.barsContainer}>
              {priceHistory.map((val, idx) => {
                const prev = idx > 0 ? priceHistory[idx - 1] : val;
                const isUp = val >= prev;
                const heightPct = Math.max(
                  15,
                  Math.min(90, ((val - minPrice) / priceRange) * 100),
                );
                const isLast = idx === priceHistory.length - 1;

                return (
                  <View key={idx} style={styles.barColumn}>
                    <View
                      style={[
                        styles.candleBar,
                        {
                          height: `${heightPct}%`,
                          backgroundColor: isUp ? "#00E676" : "#FF5252",
                        },
                        isLast && styles.candleBarActive,
                      ]}
                    />
                    {isLast && (
                      <Animated.View
                        style={[
                          styles.livePoint,
                          {
                            backgroundColor: isUp ? "#00E676" : "#FF5252",
                            transform: [{ scale: pulseAnim }],
                          },
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Status Bar Floating di bawah chart */}
          {status === "active" && (
            <View
              style={[
                styles.floatingStatus,
                isWinningLive ? styles.statusWinning : styles.statusLosing,
              ]}
            >
              <Text style={styles.floatingStatusText}>
                {isWinningLive
                  ? `🟢 Posisi Menguntungkan (Potensi: +${betCredits} Kredit)`
                  : `🔴 Posisi Merugi (-${betCredits} Kredit)`}
              </Text>
            </View>
          )}

          {/* Banner Hasil Selesai Putaran */}
          {(status === "won" || status === "lost") && (
            <View
              style={[
                styles.resultBanner,
                status === "won" ? styles.bannerWon : styles.bannerLost,
              ]}
            >
              <Text style={styles.resultTitle}>
                {status === "won"
                  ? "🎉 PROFIT! (Umpan Kemenangan)"
                  : isSpikeLoss
                  ? "💥 JARUM DETIK TERAKHIR!"
                  : "💀 SALDO HANGUS (Rungkad)"}
              </Text>
              <Text style={styles.resultDesc}>
                {status === "won"
                  ? `Berhasil untung +${betCredits} Kredit. Bandar membiarkanmu menang agar kamu merasa hebat dan menaikkan nominal taruhan!`
                  : isSpikeLoss
                  ? `Tepat di detik terakhir, grafik disentak 1 pips oleh algoritma bandar untuk menggagalkan kemenanganmu!`
                  : `Tebakan arah salah. Di binary option, bandar selalu menang 100% modalmu saat kalah.`}
              </Text>
              <TouchableOpacity
                style={styles.btnNextRound}
                onPress={handleResetOrder}
              >
                <Text style={styles.btnNextRoundText}>Putaran Berikutnya →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 3. Pengaturan Taruhan Kredit */}
        <View style={styles.betControlCard}>
          <View style={styles.betHeaderRow}>
            <Text style={styles.betLabel}>NOMINAL TARUHAN KREDIT:</Text>
            <Text style={styles.payoutInfo}>Payout: 100% (+{betCredits} Kredit)</Text>
          </View>

          {/* Quick Bet Buttons */}
          <View style={styles.betButtonsRow}>
            {[1, 2].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.quickBetBtn,
                  betCredits === num && styles.quickBetBtnActive,
                ]}
                onPress={() => {
                  if (status === "active") return;
                  SoundEffects.playClick();
                  setBetCredits(Math.min(credits || 1, num));
                }}
                disabled={status === "active"}
              >
                <Text
                  style={[
                    styles.quickBetBtnText,
                    betCredits === num && styles.quickBetBtnTextActive,
                  ]}
                >
                  {num} Kredit
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[
                styles.quickBetBtn,
                credits > 1 &&
                  betCredits === Math.max(1, Math.floor(credits / 2)) &&
                  styles.quickBetBtnActive,
              ]}
              onPress={() => {
                if (status === "active") return;
                SoundEffects.playClick();
                setBetCredits(Math.max(1, Math.floor(credits / 2)));
              }}
              disabled={status === "active"}
            >
              <Text style={styles.quickBetBtnText}>½ Saldo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickBetBtn,
                styles.quickBetBtnMax,
                betCredits === credits && credits > 0 && styles.quickBetBtnActive,
              ]}
              onPress={() => {
                if (status === "active") return;
                SoundEffects.playClick();
                setBetCredits(Math.max(1, credits));
              }}
              disabled={status === "active"}
            >
              <Text style={[styles.quickBetBtnText, styles.textRed]}>All-In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Tombol Aksi Beli (Naik) & Jual (Turun) */}
        <View style={styles.actionButtonsRow}>
          {/* Tombol NAIK / BUY */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.btnUp,
              (status === "active" || credits <= 0) && styles.btnDisabled,
            ]}
            onPress={() => handleOpenTrade("up")}
            disabled={status === "active"}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>▲</Text>
            <View>
              <Text style={styles.actionBtnTitle}>NAIK (BUY)</Text>
              <Text style={styles.actionBtnSubtitle}>Tebak Harga Naik</Text>
            </View>
          </TouchableOpacity>

          {/* Tombol TURUN / SELL */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.btnDown,
              (status === "active" || credits <= 0) && styles.btnDisabled,
            ]}
            onPress={() => handleOpenTrade("down")}
            disabled={status === "active"}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>▼</Text>
            <View>
              <Text style={styles.actionBtnTitle}>TURUN (SELL)</Text>
              <Text style={styles.actionBtnSubtitle}>Tebak Harga Turun</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 5. Kotak Edukasi Pembongkar Trik Binary Option */}
        <View style={styles.educationCard}>
          <Text style={styles.educationTitle}>
            🧠 BONGKAR KEDOK BINARY OPTION (BINOMO / QUOTEX):
          </Text>
          <Text style={styles.educationText}>
            1. <Text style={styles.boldWhite}>Bukan Pasar Saham/Forex Riil</Text>:
            Grafik binary option tidak terhubung ke bursa resmi manapun. Ini adalah server internal bandar yang bebas dimanipulasi.
            {"\n\n"}
            2. <Text style={styles.boldRed}>Jarum Detik Terakhir (Spike Manipulation)</Text>:
            Pernahkah kamu merasa menang di 4 detik pertama, lalu tiba-tiba kalah di detik ke-5? Server bandar sengaja menggeser 1 pips untuk mencuri taruhanmu!
            {"\n\n"}
            3. <Text style={styles.boldGreen}>Fatwa Regulasi</Text>:
            Bappebti dan OJK secara tegas menetapkan Binary Option sebagai <Text style={styles.boldRed}>Judi Daring Berkedok Trading</Text> yang 100% ilegal di Indonesia.
          </Text>
        </View>
      </ScrollView>

      {/* Modal Iklan Top-Up saat Kredit Habis */}
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
    backgroundColor: "#080E1A",
  },
  scrollContent: {
    padding: 16,
    paddingTop: 44,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: "#131E30",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E2F48",
  },
  backBtnText: {
    color: "#BAC9DC",
    fontSize: 12,
    fontWeight: "700",
  },
  headerTitleBox: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  badgeFake: {
    backgroundColor: "rgba(255, 82, 82, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  badgeFakeText: {
    color: "#FF5252",
    fontSize: 9,
    fontWeight: "800",
  },
  creditBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#132338",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#00E5FF",
  },
  creditBadgeLabel: {
    color: "#8FA3BF",
    fontSize: 10,
    fontWeight: "700",
    marginRight: 4,
  },
  creditBadgeValue: {
    color: "#00E5FF",
    fontSize: 13,
    fontWeight: "900",
  },
  assetTabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  assetTabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#101826",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1B2A40",
  },
  assetTabItemActive: {
    backgroundColor: "#16253C",
    borderColor: "#00E5FF",
  },
  assetTabSymbol: {
    fontSize: 14,
  },
  assetTabText: {
    color: "#7E92AB",
    fontSize: 11,
    fontWeight: "700",
  },
  assetTabTextActive: {
    color: "#00E5FF",
  },
  chartContainer: {
    backgroundColor: "#0C1422",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1B2B44",
    padding: 14,
    marginBottom: 16,
    position: "relative",
  },
  chartTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  chartAssetTitle: {
    color: "#8FA3BF",
    fontSize: 11,
    fontWeight: "700",
  },
  chartCurrentPrice: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  textGreen: {
    color: "#00E676",
  },
  textYellow: {
    color: "#FFB300",
  },
  textRed: {
    color: "#FF5252",
  },
  durationSelector: {
    flexDirection: "row",
    backgroundColor: "#121E32",
    borderRadius: 8,
    padding: 2,
  },
  durationBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  durationBtnActive: {
    backgroundColor: "#00E5FF",
  },
  durationBtnText: {
    color: "#7E92AB",
    fontSize: 11,
    fontWeight: "700",
  },
  durationBtnTextActive: {
    color: "#080E1A",
  },
  timerBadgeActive: {
    backgroundColor: "#FF5252",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerTextActive: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  chartArea: {
    height: 180,
    backgroundColor: "#070C15",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#152236",
    overflow: "hidden",
    position: "relative",
    justifyContent: "flex-end",
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: "100%",
    paddingHorizontal: 6,
    paddingBottom: 8,
    gap: 3,
  },
  barColumn: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  candleBar: {
    width: "100%",
    borderRadius: 2,
    opacity: 0.75,
  },
  candleBarActive: {
    opacity: 1,
  },
  livePoint: {
    position: "absolute",
    top: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  entryLine: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#FFB300",
    borderStyle: "dashed",
    zIndex: 10,
  },
  entryFlag: {
    position: "absolute",
    right: 6,
    top: -10,
    backgroundColor: "#FFB300",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  entryFlagText: {
    color: "#080E1A",
    fontSize: 9,
    fontWeight: "900",
  },
  floatingStatus: {
    position: "absolute",
    bottom: 22,
    left: 20,
    right: 20,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    zIndex: 20,
  },
  statusWinning: {
    backgroundColor: "rgba(0, 230, 118, 0.9)",
  },
  statusLosing: {
    backgroundColor: "rgba(255, 82, 82, 0.9)",
  },
  floatingStatusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  resultBanner: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  bannerWon: {
    backgroundColor: "#0A241A",
    borderColor: "#00E676",
  },
  bannerLost: {
    backgroundColor: "#2B1116",
    borderColor: "#FF5252",
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  resultDesc: {
    fontSize: 11,
    color: "#BAC9DC",
    lineHeight: 17,
    marginBottom: 10,
  },
  btnNextRound: {
    backgroundColor: "#00E5FF",
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: "center",
  },
  btnNextRoundText: {
    color: "#080E1A",
    fontSize: 12,
    fontWeight: "800",
  },
  betControlCard: {
    backgroundColor: "#0C1422",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1B2B44",
    padding: 14,
    marginBottom: 16,
  },
  betHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  betLabel: {
    color: "#8FA3BF",
    fontSize: 10,
    fontWeight: "800",
  },
  payoutInfo: {
    color: "#00E676",
    fontSize: 11,
    fontWeight: "800",
  },
  betButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickBetBtn: {
    flex: 1,
    backgroundColor: "#131E30",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1C2D46",
  },
  quickBetBtnActive: {
    backgroundColor: "#182C48",
    borderColor: "#00E5FF",
  },
  quickBetBtnMax: {
    borderColor: "rgba(255, 82, 82, 0.4)",
  },
  quickBetBtnText: {
    color: "#BAC9DC",
    fontSize: 11,
    fontWeight: "700",
  },
  quickBetBtnTextActive: {
    color: "#00E5FF",
    fontWeight: "900",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnUp: {
    backgroundColor: "#00C853",
    shadowColor: "#00C853",
  },
  btnDown: {
    backgroundColor: "#D50000",
    shadowColor: "#D50000",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  actionIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  actionBtnTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  actionBtnSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 10,
    fontWeight: "600",
  },
  educationCard: {
    backgroundColor: "#121B2C",
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FF5252",
  },
  educationTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FF5252",
    marginBottom: 8,
  },
  educationText: {
    fontSize: 11,
    color: "#8FA3BF",
    lineHeight: 18,
  },
  boldWhite: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  boldRed: {
    color: "#FF5252",
    fontWeight: "700",
  },
  boldGreen: {
    color: "#00E676",
    fontWeight: "700",
  },
});
