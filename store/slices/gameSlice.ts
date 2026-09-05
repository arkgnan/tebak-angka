import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GameRoundResult {
  gameType?: "higher-lower" | "crash" | "wheel";
  gameTitle?: string;
  winner: boolean;
  baseNumber?: number;
  resultNumber?: number;
  choice?: "higher" | "lower";
  multiplier?: number;
  crashPoint?: number;
  rewardCredits?: number;
  segmentTitle?: string;
  explanation: string;
  consecutiveLosses: number;
  timestamp: number;
}

export interface GameState {
  credits: number;
  hasClaimedInitialCredits: boolean;
  consecutiveLosses: number;
  targetLossesBeforeWin: number;
  lastWon: boolean;
  stats: {
    totalPlayed: number;
    totalWins: number;
    totalLosses: number;
    totalAdsWatched: number;
    simulatedMoneyLost: number; // Dalam Rupiah
  };
  lastRound: GameRoundResult | null;
  history: GameRoundResult[];
}

const getRandomTargetLosses = () => Math.floor(Math.random() * 3) + 3; // 3, 4, atau 5

const initialState: GameState = {
  credits: 3, // 3 kredit gratis saat pertama kali mulai
  hasClaimedInitialCredits: true,
  consecutiveLosses: 0,
  targetLossesBeforeWin: getRandomTargetLosses(),
  lastWon: false,
  stats: {
    totalPlayed: 0,
    totalWins: 0,
    totalLosses: 0,
    totalAdsWatched: 0,
    simulatedMoneyLost: 0,
  },
  lastRound: null,
  history: [],
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    playRound: (
      state,
      action: PayloadAction<{ choice: "higher" | "lower"; baseNumber: number }>,
    ) => {
      if (state.credits <= 0) {
        return;
      }

      // Kurangi 1 kredit per putaran
      state.credits -= 1;
      state.stats.totalPlayed += 1;
      state.stats.simulatedMoneyLost += 50000; // Simulasi Rp 50.000 per putaran

      const { choice, baseNumber } = action.payload;
      let winner = false;
      let explanation = "";

      // ATURAN ALGORITMA BANDAR JUDI ONLINE:
      // 1. Setelah 1x menang, putaran berikutnya HARUS KALAH (tidak boleh menang beruntun)
      if (state.lastWon) {
        winner = false;
        state.lastWon = false;
        state.consecutiveLosses = 1;
        explanation =
          "Bandar Mengunci Kemenangan! Setelah diberi menang 1x, algoritma judol otomatis mengunci kekalahan agar saldo kemenanganmu langsung ludes kembali ke bandar.";
      }
      // 2. Jika sudah kalah 3-5 kali beruntun, berikan 1x menang sebagai umpan (baiting)
      else if (state.consecutiveLosses >= state.targetLossesBeforeWin) {
        winner = true;
        state.lastWon = true;
        state.consecutiveLosses = 0;
        state.targetLossesBeforeWin = getRandomTargetLosses(); // Acak target kekalahan berikutnya (3-5)
        explanation =
          "Umpan Bandar Berhasil! Setelah kamu dibuat kalah berkali-kali, algoritma sengaja memberi 1 kemenangan kecil agar otakmu dibanjiri dopamin dan kamu terdorong untuk 'top-up' lagi.";
      }
      // 3. Jika belum mencapai target kekalahan beruntun, WAJIB KALAH
      else {
        winner = false;
        state.consecutiveLosses += 1;
        state.lastWon = false;
        explanation = `Kekalahan ke-${state.consecutiveLosses} beruntun! Inilah realitas matematika judi online: bandar mengatur peluang sedemikian rupa sehingga pemain pasti rugi dalam jangka panjang.`;
      }

      // Hitung resultNumber agar sesuai dengan keputusan winner/loser
      let resultNumber: number;
      if (winner) {
        state.stats.totalWins += 1;
        if (choice === "higher") {
          const min = baseNumber + 1;
          const max = Math.min(99, baseNumber + 20);
          resultNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        } else {
          const min = Math.max(1, baseNumber - 20);
          const max = baseNumber - 1;
          resultNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        }
      } else {
        state.stats.totalLosses += 1;
        if (choice === "higher") {
          const min = Math.max(1, baseNumber - 20);
          const max = baseNumber;
          resultNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        } else {
          const min = baseNumber;
          const max = Math.min(99, baseNumber + 20);
          resultNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        }
      }

      const roundResult: GameRoundResult = {
        gameType: "higher-lower",
        gameTitle: "Tebak Angka",
        winner,
        baseNumber,
        resultNumber,
        choice,
        explanation,
        consecutiveLosses: state.consecutiveLosses,
        timestamp: Date.now(),
      };

      state.lastRound = roundResult;
      state.history = [roundResult, ...state.history.slice(0, 19)];
    },

    playCrashRound: (
      state,
      action: PayloadAction<{
        cashedOut: boolean;
        multiplier: number;
        crashPoint: number;
      }>,
    ) => {
      if (state.credits <= 0) return;

      const { cashedOut, multiplier, crashPoint } = action.payload;

      state.stats.totalPlayed += 1;
      state.stats.simulatedMoneyLost += 50000;

      let explanation = "";
      if (cashedOut) {
        // Menang cashout sebelum ledakan
        const profit = Math.max(1, Math.round(multiplier));
        state.credits = state.credits - 1 + profit;
        state.stats.totalWins += 1;
        state.lastWon = true;
        state.consecutiveLosses = 0;
        explanation = `Berhasil Tarik di ${multiplier.toFixed(2)}x (Roket meledak di ${crashPoint.toFixed(2)}x)! Bandar sengaja meloloskanmu sekali untuk memancing taruhan lebih besar di putaran berikutnya!`;
      } else {
        // Kalah / meledak
        state.credits -= 1;
        state.stats.totalLosses += 1;
        state.lastWon = false;
        state.consecutiveLosses += 1;
        explanation = `Roket Meledak di ${crashPoint.toFixed(2)}x sebelum ditarik! Inilah jebakan FOMO judol: pemain selalu menunggu pengali lebih tinggi, sementara algoritma bandar sudah mematok ledakan di awal!`;
      }

      const roundResult: GameRoundResult = {
        gameType: "crash",
        gameTitle: "Roket Boncos",
        winner: cashedOut,
        multiplier,
        crashPoint,
        explanation,
        consecutiveLosses: state.consecutiveLosses,
        timestamp: Date.now(),
      };

      state.lastRound = roundResult;
      state.history = [roundResult, ...state.history.slice(0, 19)];
    },

    playWheelRound: (
      state,
      action: PayloadAction<{
        segmentTitle: string;
        rewardCredits: number;
        winner: boolean;
        isNearMiss: boolean;
        explanation: string;
      }>,
    ) => {
      if (state.credits <= 0) return;

      const { segmentTitle, rewardCredits, winner, explanation } = action.payload;

      // Taruhan 1 kredit
      state.credits = Math.max(0, state.credits - 1 + rewardCredits);
      state.stats.totalPlayed += 1;
      state.stats.simulatedMoneyLost += 50000;

      if (winner) {
        state.stats.totalWins += 1;
        state.lastWon = true;
        state.consecutiveLosses = 0;
      } else {
        state.stats.totalLosses += 1;
        state.lastWon = false;
        state.consecutiveLosses += 1;
      }

      const roundResult: GameRoundResult = {
        gameType: "wheel",
        gameTitle: "Roda Putar Ilusi",
        winner,
        rewardCredits,
        segmentTitle,
        explanation,
        consecutiveLosses: state.consecutiveLosses,
        timestamp: Date.now(),
      };

      state.lastRound = roundResult;
      state.history = [roundResult, ...state.history.slice(0, 19)];
    },

    watchAdReward: (state) => {
      state.credits += 5;
      state.stats.totalAdsWatched += 1;
    },

    resetGameStats: (state) => {
      state.credits = 3;
      state.consecutiveLosses = 0;
      state.targetLossesBeforeWin = getRandomTargetLosses();
      state.lastWon = false;
      state.stats = {
        totalPlayed: 0,
        totalWins: 0,
        totalLosses: 0,
        totalAdsWatched: 0,
        simulatedMoneyLost: 0,
      };
      state.lastRound = null;
      state.history = [];
    },
  },
});

export const {
  playRound,
  playCrashRound,
  playWheelRound,
  watchAdReward,
  resetGameStats,
} = gameSlice.actions;
export default gameSlice.reducer;
