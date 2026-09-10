import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleProp,
  ViewStyle,
  TextStyle,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { StackNavigation } from "../App";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { recordQuizSession } from "../store/slices/gameSlice";
import { SoundEffects } from "../services/soundService";
import { QUIZ_TOPICS, QuizQuestion, QuizTopic } from "../services/quizData";
import BannerAdComponent from "../components/BannerAdComponent";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function QuizScreen() {
  const navigation = useNavigation<StackNavigation>();
  const dispatch = useAppDispatch();
  const { credits, quizStats, quizHistory } = useAppSelector(
    (state) => state.game
  );

  // 0: Pilihan Topik, 1: Riwayat Quiz
  const [activeTab, setActiveTab] = useState<number>(0);
  const horizontalScrollRef = useRef<ScrollView>(null);

  const handleTabPress = (index: number) => {
    SoundEffects.playClick();
    setActiveTab(index);
    horizontalScrollRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    if (page !== activeTab) {
      setActiveTab(page);
    }
  };

  // State sesi kuis
  const [activeSession, setActiveSession] = useState<{
    topicId: string;
    topicTitle: string;
    questions: QuizQuestion[];
    currentIndex: number;
    selectedOption: number | null;
    isAnswered: boolean;
    answers: { questionId: string; correct: boolean }[];
    isCompleted: boolean;
  } | null>(null);

  // Helper fungsi untuk mengambil 4 soal acak unik
  const getRandomQuestions = (topic: QuizTopic, count = 4): QuizQuestion[] => {
    const shuffled = [...topic.questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const startQuizSession = (topic: QuizTopic | "random") => {
    SoundEffects.playClick();
    let questions: QuizQuestion[] = [];
    let topicId = "";
    let topicTitle = "";

    if (topic === "random") {
      topicId = "random";
      topicTitle = "Topik Acak (Campuran)";
      // Ambil 4 pertanyaan acak dari seluruh 60 soal
      const allQuestions = QUIZ_TOPICS.flatMap((t) => t.questions);
      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
      questions = shuffled.slice(0, 4);
    } else {
      topicId = topic.id;
      topicTitle = topic.title;
      questions = getRandomQuestions(topic, 4);
    }

    setActiveSession({
      topicId,
      topicTitle,
      questions,
      currentIndex: 0,
      selectedOption: null,
      isAnswered: false,
      answers: [],
      isCompleted: false,
    });
  };

  const handleSelectOption = (index: number) => {
    if (!activeSession || activeSession.isAnswered) return;

    const currentQ = activeSession.questions[activeSession.currentIndex];
    const isCorrect = index === currentQ.correctIndex;

    if (isCorrect) {
      SoundEffects.playWin();
    } else {
      SoundEffects.playLoss();
    }

    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        selectedOption: index,
        isAnswered: true,
        answers: [
          ...prev.answers,
          { questionId: currentQ.id, correct: isCorrect },
        ],
      };
    });
  };

  const handleNextQuestion = () => {
    SoundEffects.playClick();
    if (!activeSession) return;

    if (activeSession.currentIndex + 1 < activeSession.questions.length) {
      setActiveSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentIndex: prev.currentIndex + 1,
          selectedOption: null,
          isAnswered: false,
        };
      });
    } else {
      // Selesai 4 pertanyaan!
      const correctCount = activeSession.answers.filter((a) => a.correct).length;
      dispatch(
        recordQuizSession({
          topicId: activeSession.topicId,
          topicTitle: activeSession.topicTitle,
          correctCount,
          totalQuestions: activeSession.questions.length,
        })
      );

      setActiveSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          isCompleted: true,
        };
      });
    }
  };

  const handleRetrySameQuestions = () => {
    SoundEffects.playClick();
    if (!activeSession) return;
    setActiveSession({
      ...activeSession,
      currentIndex: 0,
      selectedOption: null,
      isAnswered: false,
      answers: [],
      isCompleted: false,
    });
  };

  const handleNewSession = () => {
    if (!activeSession) return;
    if (activeSession.topicId === "random") {
      startQuizSession("random");
    } else {
      const topicObj = QUIZ_TOPICS.find((t) => t.id === activeSession.topicId);
      if (topicObj) {
        startQuizSession(topicObj);
      } else {
        startQuizSession("random");
      }
    }
  };

  // Predikat literasi berdasarkan IPK kumulatif
  const gpa = quizStats?.cumulativeGpa ?? 0;
  const literacyStatus = useMemo(() => {
    if (gpa >= 3.5) return "Sadar Literasi";
    if (gpa >= 2.75) return "Paham Risiko";
    if (gpa >= 2.0) return "Mulai Waspada";
    if (gpa >= 1.0) return "Perlu Belajar";
    if (gpa > 0) return "Rentan Terjebak";
    return "Belum Ada Nilai";
  }, [gpa]);

  // Render Layar Hasil Sesi (Setelah 4 Pertanyaan)
  if (activeSession?.isCompleted) {
    const correctCount = activeSession.answers.filter((a) => a.correct).length;
    let grade = "E";
    let gradeColor = "#FF5252";
    if (correctCount === 4) {
      grade = "A";
      gradeColor = "#00E676";
    } else if (correctCount === 3) {
      grade = "B";
      gradeColor = "#00E5FF";
    } else if (correctCount === 2) {
      grade = "C";
      gradeColor = "#FFD700";
    } else if (correctCount === 1) {
      grade = "D";
      gradeColor = "#FFA726";
    }

    return (
      <View style={styles.container}>
        {/* Banner Ad permanen di bagian atas */}
        <BannerAdComponent position="top" />

        <ScrollView
          contentContainerStyle={styles.sessionResultContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Animasi Badge Lottie */}
          <View style={styles.badgeLottieContainer}>
            <LottieView
              autoPlay
              loop={false}
              style={styles.badgeLottie}
              source={require("../assets/badge.json")}
            />
          </View>

          {/* Kartu Grade & Nilai */}
          <View style={[styles.resultGradeCard, { borderColor: gradeColor }]}>
            <Text style={styles.resultGradeLabel}>HASIL SESI KUIS</Text>
            <Text style={[styles.resultGradeText, { color: gradeColor }]}>
              GRADE {grade}
            </Text>
            <Text style={styles.resultScoreText}>
              {correctCount} dari {activeSession.questions.length} Benar
            </Text>

            {grade === "A" && (
              <View style={styles.rewardPill}>
                <Text style={styles.rewardPillText}>
                  🎉 Sempurna! +1 Kredit Gratis Ditambahkan!
                </Text>
              </View>
            )}
          </View>

          {/* Rekap Jawaban dan Edukasi */}
          <Text style={styles.recapHeading}>PEMBAHASAN JAWABAN:</Text>
          {activeSession.questions.map((q, idx) => {
            const ans = activeSession.answers[idx];
            return (
              <View key={q.id} style={styles.recapItem}>
                <View style={styles.recapQuestionRow}>
                  <Text
                    style={[
                      styles.recapStatus,
                      ans?.correct ? styles.textWin : styles.textLoss,
                    ]}
                  >
                    {ans?.correct ? "✅ Benar" : "❌ Salah"}
                  </Text>
                  <Text style={styles.recapQuestionText}>
                    {idx + 1}. {q.question}
                  </Text>
                </View>
                <Text style={styles.recapCorrectAnswer}>
                  Kunci: {q.options[q.correctIndex]}
                </Text>
                <Text style={styles.recapExplanation}>{q.explanation}</Text>
              </View>
            );
          })}

          {/* Tombol Aksi */}
          <View style={styles.actionGroup}>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.btnPrimary, styles.actionBtnHalf]}
                onPress={handleNewSession}
                activeOpacity={0.8}
              >
                <Text style={styles.btnPrimaryText}>🎲 Sesi Baru</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnSecondary, styles.actionBtnHalf]}
                onPress={handleRetrySameQuestions}
                activeOpacity={0.8}
              >
                <Text style={styles.btnSecondaryText}>🔄 Coba Lagi</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => setActiveSession(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnOutlineText}>
                📋 Kembali ke Daftar Topik
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Render Pertanyaan Kuis Aktif (Pertanyaan 1 - 4)
  if (activeSession) {
    const currentQ = activeSession.questions[activeSession.currentIndex];
    const progressPercent =
      ((activeSession.currentIndex + 1) / activeSession.questions.length) * 100;

    return (
      <View style={styles.container}>
        {/* Banner Ad permanen di bagian atas */}
        <BannerAdComponent position="top" />

        <ScrollView
          contentContainerStyle={styles.activeQuizContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Sesi */}
          <View style={styles.sessionHeader}>
            <TouchableOpacity
              style={styles.exitBtn}
              onPress={() => setActiveSession(null)}
            >
              <Text style={styles.exitBtnText}>✕ Keluar</Text>
            </TouchableOpacity>
            <Text style={styles.sessionTopicTitle} numberOfLines={1}>
              {activeSession.topicTitle}
            </Text>
            <Text style={styles.questionCounter}>
              {activeSession.currentIndex + 1}/
              {activeSession.questions.length}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
            />
          </View>

          {/* Kartu Pertanyaan */}
          <View style={styles.questionCard}>
            <Text style={styles.questionNumberText}>
              PERTANYAAN {activeSession.currentIndex + 1}
            </Text>
            <Text style={styles.questionText}>{currentQ.question}</Text>
          </View>

          {/* Opsi Pilihan Ganda */}
          <View style={styles.optionsList}>
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = activeSession.selectedOption === oIdx;
              const isCorrectAnswer = oIdx === currentQ.correctIndex;
              let optionStyle: StyleProp<ViewStyle> = styles.optionItem;
              let textStyle: StyleProp<TextStyle> = styles.optionText;

              if (activeSession.isAnswered) {
                if (isCorrectAnswer) {
                  optionStyle = [styles.optionItem, styles.optionCorrect];
                  textStyle = [styles.optionText, styles.optionTextCorrect];
                } else if (isSelected && !isCorrectAnswer) {
                  optionStyle = [styles.optionItem, styles.optionWrong];
                  textStyle = [styles.optionText, styles.optionTextWrong];
                }
              }

              return (
                <TouchableOpacity
                  key={oIdx}
                  style={optionStyle}
                  onPress={() => handleSelectOption(oIdx)}
                  disabled={activeSession.isAnswered}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionIndexBadge}>
                    <Text style={styles.optionIndexText}>
                      {String.fromCharCode(65 + oIdx)}
                    </Text>
                  </View>
                  <Text style={textStyle}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Penjelasan Edukatif jika sudah dijawab */}
          {activeSession.isAnswered && (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationHeading}>
                🧠 FAKTA LITERASI:
              </Text>
              <Text style={styles.explanationContent}>
                {currentQ.explanation}
              </Text>

              <TouchableOpacity
                style={styles.btnNext}
                onPress={handleNextQuestion}
                activeOpacity={0.8}
              >
                <Text style={styles.btnNextText}>
                  {activeSession.currentIndex + 1 <
                    activeSession.questions.length
                    ? "Lanjut ke Pertanyaan Berikutnya →"
                    : "Lihat Hasil Nilai & Grade →"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // Render Layar Utama Kuis (Tab 0: Pilihan Topik, Tab 1: Riwayat Quiz)
  return (
    <SafeAreaView style={styles.container}>
      {/* Banner Ad permanen di bagian atas */}
      <BannerAdComponent position="top" />

      {/* Header Halaman Kuis */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>KUIS LITERASI KEUANGAN</Text>
        <View style={styles.creditBadge}>
          <Text style={styles.creditBadgeText}>{credits} Kredit</Text>
        </View>
      </View>

      {/* Tab Switcher: Pilihan Topik & Riwayat Quiz */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 0 && styles.tabBtnActive]}
          onPress={() => handleTabPress(0)}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 0 && styles.tabBtnTextActive,
            ]}
          >
            📚 Pilihan Topik
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 1 && styles.tabBtnActive]}
          onPress={() => handleTabPress(1)}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 1 && styles.tabBtnTextActive,
            ]}
          >
            📊 Riwayat Quiz
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pager Horizontal: Mendukung Swipe Kiri & Kanan */}
      <ScrollView
        ref={horizontalScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={styles.pager}
      >
        {/* ================= TAB 1: PILIHAN TOPIK ================= */}
        <View style={{ width: SCREEN_WIDTH }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.introCard}>
              <Text style={styles.introTitle}>
                🧠 Asah Mindset & Literasi Finansial
              </Text>
              <Text style={styles.introDesc}>
                Setiap sesi berisi 4 pertanyaan acak. Jawab semua dengan benar
                untuk mendapat <Text style={styles.textHighlight}>Grade A</Text>{" "}
                dan raih bonus <Text style={styles.textGreen}>+1 Kredit Gratis</Text>{" "}
                untuk bermain simulasi!
              </Text>
            </View>

            {/* Kartu Topik Acak */}
            <TouchableOpacity
              style={[styles.topicCard, styles.randomTopicCard]}
              onPress={() => startQuizSession("random")}
              activeOpacity={0.8}
            >
              <View style={styles.topicIconContainer}>
                <Text style={styles.topicIcon}>🎲</Text>
              </View>
              <View style={styles.topicInfo}>
                <Text style={styles.topicTitle}>Topik Acak / Random</Text>
                <Text style={styles.topicDesc}>
                  Uji pemahamanmu dengan 4 soal campuran dari seluruh 5 topik
                  literasi!
                </Text>
              </View>
              <Text style={styles.topicArrow}>Mulai →</Text>
            </TouchableOpacity>

            {/* 5 Topik Utama */}
            {QUIZ_TOPICS.map((topic) => {
              const tStats = quizStats?.topicStats?.[topic.id];
              const avgGpa = tStats?.averageGradePoint ?? null;

              let gradeLetter = "E";
              let gradeColor = "#FF5252";
              if (avgGpa !== null) {
                if (avgGpa >= 3.5) {
                  gradeLetter = "A";
                  gradeColor = "#00E676";
                } else if (avgGpa >= 2.75) {
                  gradeLetter = "B";
                  gradeColor = "#00E5FF";
                } else if (avgGpa >= 2.0) {
                  gradeLetter = "C";
                  gradeColor = "#FFD700";
                } else if (avgGpa >= 1.0) {
                  gradeLetter = "D";
                  gradeColor = "#FFA726";
                } else {
                  gradeLetter = "E";
                  gradeColor = "#FF5252";
                }
              }

              return (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.topicCard}
                  onPress={() => startQuizSession(topic)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.topicIconContainer,
                      { backgroundColor: `${topic.color}20` },
                    ]}
                  >
                    <Text style={styles.topicIcon}>{topic.icon}</Text>
                  </View>
                  <View style={styles.topicInfo}>
                    <View style={styles.topicTitleRow}>
                      <Text style={styles.topicTitle} numberOfLines={1}>
                        {topic.title}
                      </Text>
                      {avgGpa !== null && (
                        <View
                          style={[
                            styles.gradeCircle,
                            {
                              backgroundColor: `${gradeColor}20`,
                              borderColor: gradeColor,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.gradeCircleText,
                              { color: gradeColor },
                            ]}
                          >
                            {gradeLetter}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.topicDesc}>{topic.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ================= TAB 2: RIWAYAT QUIZ ================= */}
        <View style={{ width: SCREEN_WIDTH }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Kartu Ringkasan IPK Kumulatif */}
            <View style={styles.gpaCard}>
              <Text style={styles.gpaCardTitle}>INDEKS PRESTASI LITERASI</Text>
              <Text style={styles.gpaScore}>
                {gpa > 0 ? gpa.toFixed(2) : "0.00"}{" "}
                <Text style={styles.gpaMax}>/ 4.00</Text>
              </Text>
              <View style={styles.literacyPill}>
                <Text style={styles.literacyPillText}>
                  Status: {literacyStatus}
                </Text>
              </View>
              <Text style={styles.gpaSubtext}>
                Total Sesi Kuis Selesai: {quizStats?.totalSessions ?? 0} Kali
              </Text>
            </View>

            {/* Riwayat Sesi Kuis */}
            <Text style={styles.sectionHeading}>RIWAYAT SESI TERAKHIR</Text>
            {!quizHistory || quizHistory.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  Belum ada sesi kuis yang dimainkan. Pilih topik di tab sebelah
                  untuk mulai mengasah literasi keuanganmu!
                </Text>
              </View>
            ) : (
              quizHistory.map((item) => {
                let gradeColor = "#FF5252";
                if (item.grade === "A") gradeColor = "#00E676";
                else if (item.grade === "B") gradeColor = "#00E5FF";
                else if (item.grade === "C") gradeColor = "#FFD700";
                else if (item.grade === "D") gradeColor = "#FFA726";

                const dateStr = new Date(item.timestamp).toLocaleDateString(
                  "id-ID",
                  {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );

                return (
                  <View key={item.id} style={styles.historyCard}>
                    <View style={styles.historyLeft}>
                      <Text style={styles.historyTopicTitle} numberOfLines={1}>
                        {item.topicTitle}
                      </Text>
                      <Text style={styles.historyDate}>
                        {dateStr} • {item.correctCount}/{item.totalQuestions}{" "}
                        Benar
                      </Text>
                    </View>
                    <View style={styles.historyRight}>
                      <View
                        style={[
                          styles.historyGradePill,
                          { backgroundColor: `${gradeColor}20`, borderColor: gradeColor },
                        ]}
                      >
                        <Text
                          style={[
                            styles.historyGradeText,
                            { color: gradeColor },
                          ]}
                        >
                          Grade {item.grade}
                        </Text>
                      </View>
                      {item.rewardCredits > 0 && (
                        <Text style={styles.rewardIndicator}>+1 Kredit</Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B121E",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#172236",
  },
  backBtn: {
    backgroundColor: "#162032",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#23334D",
  },
  backBtnText: {
    color: "#BAC9DC",
    fontSize: 12,
    fontWeight: "700",
  },
  topBarTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  creditBadge: {
    backgroundColor: "#00E5FF20",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#00E5FF",
  },
  creditBadgeText: {
    color: "#00E5FF",
    fontSize: 12,
    fontWeight: "800",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: "#0B121E",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#131C2D",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E2B42",
  },
  tabBtnActive: {
    backgroundColor: "#1A2B42",
    borderColor: "#00E5FF",
  },
  tabBtnText: {
    color: "#7E97B8",
    fontSize: 13,
    fontWeight: "700",
  },
  tabBtnTextActive: {
    color: "#00E5FF",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  introCard: {
    backgroundColor: "#131C2D",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#202E45",
    marginBottom: 16,
  },
  introTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },
  introDesc: {
    color: "#BAC9DC",
    fontSize: 12,
    lineHeight: 18,
  },
  textHighlight: {
    color: "#FFD700",
    fontWeight: "800",
  },
  textGreen: {
    color: "#00E676",
    fontWeight: "800",
  },
  textWin: {
    color: "#00E676",
  },
  textLoss: {
    color: "#FF5252",
  },
  topicCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131C2D",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1E2B42",
    marginBottom: 12,
  },
  randomTopicCard: {
    borderColor: "#00E5FF",
    backgroundColor: "#112238",
  },
  topicIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  topicIcon: {
    fontSize: 22,
  },
  topicInfo: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  topicTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  topicTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginRight: 6,
  },
  topicDesc: {
    color: "#7E97B8",
    fontSize: 11,
    lineHeight: 16,
  },
  topicArrow: {
    color: "#00E5FF",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 8,
  },
  gradeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  gradeCircleText: {
    fontSize: 11,
    fontWeight: "900",
  },
  gpaCard: {
    backgroundColor: "#131C2D",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#00E5FF",
    marginBottom: 20,
  },
  gpaCardTitle: {
    color: "#7E97B8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 6,
  },
  gpaScore: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "900",
  },
  gpaMax: {
    color: "#7E97B8",
    fontSize: 18,
    fontWeight: "600",
  },
  literacyPill: {
    backgroundColor: "#00E5FF15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#00E5FF",
    marginVertical: 10,
  },
  literacyPillText: {
    color: "#00E5FF",
    fontSize: 12,
    fontWeight: "800",
  },
  gpaSubtext: {
    color: "#7E97B8",
    fontSize: 12,
  },
  sectionHeading: {
    color: "#BAC9DC",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  emptyCard: {
    backgroundColor: "#131C2D",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E2B42",
  },
  emptyText: {
    color: "#7E97B8",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#131C2D",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1E2B42",
    marginBottom: 8,
  },
  historyLeft: {
    flex: 1,
    marginRight: 10,
  },
  historyTopicTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  historyDate: {
    color: "#7E97B8",
    fontSize: 11,
  },
  historyRight: {
    alignItems: "flex-end",
  },
  historyGradePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  historyGradeText: {
    fontSize: 12,
    fontWeight: "900",
  },
  rewardIndicator: {
    color: "#00E676",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
  },
  // Active Quiz View Styles
  activeQuizContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  exitBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  exitBtnText: {
    color: "#FF8A80",
    fontSize: 12,
    fontWeight: "700",
  },
  sessionTopicTitle: {
    flex: 1,
    color: "#BAC9DC",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginHorizontal: 8,
  },
  questionCounter: {
    color: "#00E5FF",
    fontSize: 12,
    fontWeight: "800",
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "#172236",
    borderRadius: 2,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#00E5FF",
  },
  questionCard: {
    backgroundColor: "#131C2D",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#202E45",
    marginBottom: 16,
  },
  questionNumberText: {
    color: "#7E97B8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  questionText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 22,
  },
  optionsList: {
    gap: 10,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141C2B",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#202E45",
  },
  optionCorrect: {
    borderColor: "#00E676",
    backgroundColor: "#00E67615",
  },
  optionWrong: {
    borderColor: "#FF5252",
    backgroundColor: "#FF525215",
  },
  optionIndexBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#1F2B3E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  optionIndexText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  optionText: {
    flex: 1,
    color: "#BAC9DC",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  optionTextCorrect: {
    color: "#00E676",
    fontWeight: "800",
  },
  optionTextWrong: {
    color: "#FF5252",
    fontWeight: "800",
  },
  explanationBox: {
    backgroundColor: "#111A28",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E2C44",
  },
  explanationHeading: {
    color: "#00E5FF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  explanationContent: {
    color: "#BAC9DC",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  btnNext: {
    backgroundColor: "#00E5FF",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnNextText: {
    color: "#0B121E",
    fontSize: 13,
    fontWeight: "900",
  },
  // Session Result Styles
  sessionResultContent: {
    padding: 16,
    paddingBottom: 40,
    alignItems: "center",
  },
  badgeLottieContainer: {
    width: 140,
    height: 140,
    marginBottom: 6,
  },
  badgeLottie: {
    width: "100%",
    height: "100%",
  },
  resultGradeCard: {
    width: "100%",
    backgroundColor: "#131C2D",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    borderWidth: 2,
    marginBottom: 16,
  },
  resultGradeLabel: {
    color: "#7E97B8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
  },
  resultGradeText: {
    fontSize: 34,
    fontWeight: "900",
  },
  resultScoreText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  rewardPill: {
    backgroundColor: "#00E67620",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#00E676",
    marginTop: 10,
  },
  rewardPillText: {
    color: "#00E676",
    fontSize: 12,
    fontWeight: "800",
  },
  recapHeading: {
    alignSelf: "flex-start",
    color: "#BAC9DC",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  recapItem: {
    width: "100%",
    backgroundColor: "#111927",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1D2B3F",
    marginBottom: 8,
  },
  recapQuestionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  recapStatus: {
    fontSize: 11,
    fontWeight: "800",
    marginRight: 6,
  },
  recapQuestionText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  recapCorrectAnswer: {
    color: "#00E5FF",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  recapExplanation: {
    color: "#8FA3BC",
    fontSize: 11,
    lineHeight: 16,
  },
  actionGroup: {
    width: "100%",
    marginTop: 12,
    gap: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  actionBtnHalf: {
    flex: 1,
  },
  btnPrimary: {
    backgroundColor: "#00E5FF",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    color: "#0B121E",
    fontSize: 13,
    fontWeight: "900",
  },
  btnSecondary: {
    backgroundColor: "#162234",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#23354E",
  },
  btnSecondaryText: {
    color: "#BAC9DC",
    fontSize: 13,
    fontWeight: "700",
  },
  btnOutline: {
    paddingVertical: 10,
    alignItems: "center",
  },
  btnOutlineText: {
    color: "#7E97B8",
    fontSize: 12,
    fontWeight: "700",
  },
});
