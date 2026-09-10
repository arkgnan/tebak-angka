import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GameRoundResult {
  gameType?: "higher-lower" | "crash" | "wheel" | "slot" | "suit" | "binary-option";
  gameTitle?: string;
  winner: boolean;
  baseNumber?: number;
  resultNumber?: number;
  choice?: "higher" | "lower";
  playerChoice?: "rock" | "paper" | "scissors";
  bandarChoice?: "rock" | "paper" | "scissors";
  multiplier?: number;
  crashPoint?: number;
  rewardCredits?: number;
  segmentTitle?: string;
  reels?: [string, string, string];
  explanation: string;
  consecutiveLosses: number;
  timestamp: number;
}

export interface QuizSessionResult {
  id: string;
  topicId: string;
  topicTitle: string;
  correctCount: number;
  totalQuestions: number; // 4
  grade: "A" | "B" | "C" | "D" | "E";
  gradePoint: number; // 4.0, 3.0, 2.0, 1.0, 0.0
  rewardCredits: number;
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
    nearMissCount?: number;
    gamesPlayed?: {
      higherLower: { played: number; wins: number };
      crash: { played: number; wins: number };
      wheel: { played: number; wins: number };
      slot: { played: number; wins: number };
      suit: { played: number; wins: number };
      binaryOption?: { played: number; wins: number };
    };
  };
  quizStats: {
    totalSessions: number;
    cumulativeGpa: number;
    topicStats: Record<
      string,
      { totalPoints: number; attempts: number; averageGradePoint: number }
    >;
  };
  quizHistory: QuizSessionResult[];
  lastRound: GameRoundResult | null;
  history: GameRoundResult[];
}

const getRandomTargetLosses = () => Math.floor(Math.random() * 3) + 3; // 3, 4, atau 5

const initialGamesPlayed = {
  higherLower: { played: 0, wins: 0 },
  crash: { played: 0, wins: 0 },
  wheel: { played: 0, wins: 0 },
  slot: { played: 0, wins: 0 },
  suit: { played: 0, wins: 0 },
  binaryOption: { played: 0, wins: 0 },
};

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
    nearMissCount: 0,
    gamesPlayed: initialGamesPlayed,
  },
  quizStats: {
    totalSessions: 0,
    cumulativeGpa: 0,
    topicStats: {},
  },
  quizHistory: [],
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
      if (!state.stats.gamesPlayed) {
        state.stats.gamesPlayed = initialGamesPlayed;
      }
      state.stats.gamesPlayed.higherLower.played += 1;

      if (winner) {
        state.stats.totalWins += 1;
        state.stats.gamesPlayed.higherLower.wins += 1;
        // User menang: berikan +2 kredit (setelah dikurangi 1 di awal, untung bersih = +1 kredit)
        state.credits += 2;
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
        rewardCredits: winner ? 2 : 0,
        baseNumber,
        resultNumber,
        choice,
        explanation,
        consecutiveLosses: state.consecutiveLosses,
        timestamp: Date.now(),
      };

      state.lastRound = roundResult;
      state.history = [roundResult, ...state.history.slice(0, 49)];
    },

    playCrashRound: (
      state,
      action: PayloadAction<{
        cashedOut: boolean;
        multiplier: number;
        crashPoint: number;
        rewardCredits?: number;
      }>,
    ) => {
      if (state.credits <= 0) return;

      const { cashedOut, multiplier, crashPoint } = action.payload;

      state.stats.totalPlayed += 1;
      state.stats.simulatedMoneyLost += 50000;

      let explanation = "";
      let rewardCredits = 0;
      if (cashedOut) {
        // Menang cashout sebelum ledakan
        // Multiplier >= 2.0x -> 3 kredit (untung +2)
        // Multiplier >= 1.2x -> 2 kredit (untung +1)
        // Multiplier < 1.2x -> 1 kredit (balik modal)
        rewardCredits =
          action.payload.rewardCredits ??
          (multiplier >= 2.0 ? 3 : multiplier >= 1.2 ? 2 : 1);
        state.credits = state.credits - 1 + rewardCredits;
        state.stats.totalWins += 1;
        state.lastWon = true;
        state.consecutiveLosses = 0;
        const profit = rewardCredits - 1;
        explanation = `Berhasil Tarik di ${multiplier.toFixed(2)}x (Roket meledak di ${crashPoint.toFixed(2)}x)! Dapat +${rewardCredits} Kredit (Untung +${profit} Kredit). Bandar sengaja meloloskanmu sekali untuk memancing taruhan lebih besar di putaran berikutnya!`;
      } else {
        // Kalah / meledak
        state.credits -= 1;
        state.stats.totalLosses += 1;
        state.lastWon = false;
        state.consecutiveLosses += 1;
        explanation = `Roket Meledak di ${crashPoint.toFixed(2)}x sebelum ditarik! Inilah jebakan FOMO judol: pemain selalu menunggu pengali lebih tinggi, sementara algoritma bandar sudah mematok ledakan di awal!`;
      }

      if (!state.stats.gamesPlayed) {
        state.stats.gamesPlayed = initialGamesPlayed;
      }
      state.stats.gamesPlayed.crash.played += 1;
      if (cashedOut) {
        state.stats.gamesPlayed.crash.wins += 1;
      }
      if (crashPoint <= 1.25) {
        // Ledakan instan awal (jebakan dekat)
        state.stats.nearMissCount = (state.stats.nearMissCount || 0) + 1;
      }

      const roundResult: GameRoundResult = {
        gameType: "crash",
        gameTitle: "Roket Boncos",
        winner: cashedOut,
        multiplier,
        crashPoint,
        rewardCredits,
        explanation,
        consecutiveLosses: state.consecutiveLosses,
        timestamp: Date.now(),
      };

      state.lastRound = roundResult;
      state.history = [roundResult, ...state.history.slice(0, 49)];
    },

    playWheelRound: (
      state,
      action: PayloadAction<{
        segmentTitle: string;
        rewardCredits: number;
        winner: boolean;
        isNearMiss: boolean;
        isFreeSpin?: boolean;
        explanation: string;
      }>,
    ) => {
      const {
        segmentTitle,
        rewardCredits,
        winner,
        isNearMiss,
        isFreeSpin,
        explanation,
      } = action.payload;

      if (state.credits <= 0 && !isFreeSpin) return;

      // Taruhan 1 kredit jika bukan free spin
      if (isFreeSpin) {
        state.credits += rewardCredits;
      } else {
        state.credits = Math.max(0, state.credits - 1 + rewardCredits);
      }
      state.stats.totalPlayed += 1;
      state.stats.simulatedMoneyLost += 50000;

      if (!state.stats.gamesPlayed) {
        state.stats.gamesPlayed = initialGamesPlayed;
      }
      state.stats.gamesPlayed.wheel.played += 1;

      if (winner) {
        state.stats.totalWins += 1;
        state.lastWon = true;
        state.consecutiveLosses = 0;
        state.stats.gamesPlayed.wheel.wins += 1;
      } else {
        state.stats.totalLosses += 1;
        state.lastWon = false;
        state.consecutiveLosses += 1;
      }

      if (isNearMiss) {
        state.stats.nearMissCount = (state.stats.nearMissCount || 0) + 1;
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
      state.history = [roundResult, ...state.history.slice(0, 49)];
    },

    playSlotRound: (
      state,
      action: PayloadAction<{
        reels: [string, string, string];
        rewardCredits: number;
        winner: boolean;
        isNearMiss: boolean;
        explanation: string;
      }>,
    ) => {
      if (state.credits <= 0) return;

      const { reels, rewardCredits, winner, isNearMiss, explanation } =
        action.payload;

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

      if (isNearMiss) {
        state.stats.nearMissCount = (state.stats.nearMissCount || 0) + 1;
      }
      if (!state.stats.gamesPlayed) {
        state.stats.gamesPlayed = initialGamesPlayed;
      }
      state.stats.gamesPlayed.slot.played += 1;
      if (winner) state.stats.gamesPlayed.slot.wins += 1;

      const roundResult: GameRoundResult = {
        gameType: "slot",
        gameTitle: "Slot Rungkad 777",
        winner,
        rewardCredits,
        reels,
        explanation,
        consecutiveLosses: state.consecutiveLosses,
        timestamp: Date.now(),
      };

      state.lastRound = roundResult;
      state.history = [roundResult, ...state.history.slice(0, 49)];
    },

    playSuitRound: (
      state,
      action: PayloadAction<{
        playerChoice: "rock" | "paper" | "scissors";
        bandarChoice: "rock" | "paper" | "scissors";
        winner: boolean;
        isDraw: boolean;
        rewardCredits: number;
        explanation: string;
      }>,
    ) => {
      if (state.credits <= 0) return;

      const {
        playerChoice,
        bandarChoice,
        winner,
        isDraw,
        rewardCredits,
        explanation,
      } = action.payload;

      // Taruhan 1 kredit
      state.credits = Math.max(0, state.credits - 1 + rewardCredits);
      state.stats.totalPlayed += 1;
      state.stats.simulatedMoneyLost += 50000;

      if (!state.stats.gamesPlayed) {
        state.stats.gamesPlayed = initialGamesPlayed;
      }
      state.stats.gamesPlayed.suit.played += 1;

      if (winner) {
        state.stats.totalWins += 1;
        state.lastWon = true;
        state.consecutiveLosses = 0;
        state.stats.gamesPlayed.suit.wins += 1;
      } else if (!isDraw) {
        state.stats.totalLosses += 1;
        state.lastWon = false;
        state.consecutiveLosses += 1;
      }

      const roundResult: GameRoundResult = {
        gameType: "suit",
        gameTitle: "Suit Bandar Licik",
        winner,
        rewardCredits,
        playerChoice,
        bandarChoice,
        explanation,
        consecutiveLosses: state.consecutiveLosses,
        timestamp: Date.now(),
      };

      state.lastRound = roundResult;
      state.history = [roundResult, ...state.history.slice(0, 49)];
    },

    recordQuizSession: (
      state,
      action: PayloadAction<{
        topicId: string;
        topicTitle: string;
        correctCount: number;
        totalQuestions: number;
      }>
    ) => {
      const { topicId, topicTitle, correctCount, totalQuestions } = action.payload;
      let grade: "A" | "B" | "C" | "D" | "E" = "E";
      let gradePoint = 0.0;
      let rewardCredits = 0;

      if (correctCount === 4) {
        grade = "A";
        gradePoint = 4.0;
        rewardCredits = 1;
        state.credits += 1;
      } else if (correctCount === 3) {
        grade = "B";
        gradePoint = 3.0;
      } else if (correctCount === 2) {
        grade = "C";
        gradePoint = 2.0;
      } else if (correctCount === 1) {
        grade = "D";
        gradePoint = 1.0;
      } else {
        grade = "E";
        gradePoint = 0.0;
      }

      if (!state.quizStats) {
        state.quizStats = { totalSessions: 0, cumulativeGpa: 0, topicStats: {} };
      }
      if (!state.quizStats.topicStats) {
        state.quizStats.topicStats = {};
      }
      if (!state.quizStats.topicStats[topicId]) {
        state.quizStats.topicStats[topicId] = { totalPoints: 0, attempts: 0, averageGradePoint: 0 };
      }

      const tStat = state.quizStats.topicStats[topicId];
      tStat.totalPoints += gradePoint;
      tStat.attempts += 1;
      tStat.averageGradePoint = +(tStat.totalPoints / tStat.attempts).toFixed(2);

      state.quizStats.totalSessions += 1;

      // Recalculate overall cumulative GPA
      let sumPoints = 0;
      let sumAttempts = 0;
      Object.values(state.quizStats.topicStats).forEach((ts) => {
        sumPoints += ts.totalPoints;
        sumAttempts += ts.attempts;
      });
      state.quizStats.cumulativeGpa = sumAttempts > 0 ? +(sumPoints / sumAttempts).toFixed(2) : 0;

      const sessionRecord: QuizSessionResult = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        topicId,
        topicTitle,
        correctCount,
        totalQuestions,
        grade,
        gradePoint,
        rewardCredits,
        timestamp: Date.now(),
      };

      state.quizHistory = [sessionRecord, ...(state.quizHistory || []).slice(0, 49)];
    },

    playBinaryOptionRound: (
      state,
      action: PayloadAction<{
        won: boolean;
        betCredits: number;
        assetTitle: string;
        direction: "up" | "down";
        entryPrice: number;
        exitPrice: number;
        isLastSecondSpike?: boolean;
      }>,
    ) => {
      const {
        won,
        betCredits,
        assetTitle,
        direction,
        entryPrice,
        exitPrice,
        isLastSecondSpike,
      } = action.payload;

      if (state.credits < betCredits) return;

      state.stats.totalPlayed += 1;
      state.stats.simulatedMoneyLost += betCredits * 50000;

      let rewardCredits = 0;
      let explanation = "";

      if (won) {
        rewardCredits = betCredits * 2; // Payout 100% (+betCredits)
        state.credits = state.credits - betCredits + rewardCredits;
        state.stats.totalWins += 1;
        state.lastWon = true;
        state.consecutiveLosses = 0;
        explanation = `Tebakan ${direction === "up" ? "NAIK (BUY)" : "TURUN (SELL)"} pada ${assetTitle} berhasil! Entry: ${entryPrice.toFixed(2)}, Exit: ${exitPrice.toFixed(2)}. Dapat +${rewardCredits} Kredit (Untung +${betCredits} Kredit). Bandar sengaja membiarkanmu menang di awal agar hormon dopaminmu meledak dan kamu tergiur melipatgandakan taruhan!`;
      } else {
        state.credits -= betCredits;
        state.stats.totalLosses += 1;
        state.lastWon = false;
        state.consecutiveLosses += 1;
        if (isLastSecondSpike) {
          state.stats.nearMissCount = (state.stats.nearMissCount || 0) + 1;
          explanation = `💥 JARUM CANDLE DETIK TERAKHIR! Tebakanmu ${direction === "up" ? "NAIK" : "TURUN"} meleset tipis (Entry: ${entryPrice.toFixed(2)}, Exit: ${exitPrice.toFixed(2)}). Di detik terakhir, algoritma bandar sengaja membanting harga 1 pips untuk membatalkan kemenanganmu!`;
        } else {
          explanation = `Tebakan ${direction === "up" ? "NAIK" : "TURUN"} pada ${assetTitle} salah! Entry: ${entryPrice.toFixed(2)}, Exit: ${exitPrice.toFixed(2)}. Saldo hangus -${betCredits} Kredit. Binary option bukanlah investasi atau bursa saham resmi, melainkan judi tebak harga ilegal!`;
        }
      }

      if (!state.stats.gamesPlayed) {
        state.stats.gamesPlayed = initialGamesPlayed;
      }
      if (!state.stats.gamesPlayed.binaryOption) {
        state.stats.gamesPlayed.binaryOption = { played: 0, wins: 0 };
      }
      state.stats.gamesPlayed.binaryOption.played += 1;
      if (won) {
        state.stats.gamesPlayed.binaryOption.wins += 1;
      }

      const result: GameRoundResult = {
        gameType: "binary-option",
        gameTitle: `Binary Option (${assetTitle})`,
        winner: won,
        rewardCredits: won ? rewardCredits : 0,
        explanation,
        consecutiveLosses: state.consecutiveLosses,
        timestamp: Date.now(),
      };

      state.lastRound = result;
      state.history.unshift(result);
      if (state.history.length > 20) {
        state.history.pop();
      }
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
        nearMissCount: 0,
        gamesPlayed: initialGamesPlayed,
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
  playSlotRound,
  playSuitRound,
  playBinaryOptionRound,
  recordQuizSession,
  watchAdReward,
  resetGameStats,
} = gameSlice.actions;
export default gameSlice.reducer;
