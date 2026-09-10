import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const SCIENTIFIC_FACTS = [
  "Algoritma judi online dirancang agar pemain 100% bangkrut dalam jangka panjang. Coba semua permainan untuk membuktikannya!",
  "Kemenangan di awal hanyalah umpan psikologis bandar agar hormon dopaminmu meledak dan kamu kecanduan deposit.",
  "Mitos 'jam gacor' dan 'pola spin' hanyalah tipuan affiliator untuk menjebak korban baru mendaftar.",
  "Secara matematis, Return to Player (RTP) selalu diatur menguntungkan bandar. Makin lama bermain, peluang bangkrut mendekati 100%.",
  "Efek Near-Miss (nyaris menang) sengaja diciptakan untuk menipu otakmu seolah kemenangan sudah dekat, padahal sudah diatur kalah.",
  "Di server judi online, taruhanmu sudah tercatat sebelum hasil diacak—bandar selalu tahu pilihanmu terlebih dahulu.",
  "Uang yang hilang di judi online tidak akan pernah kembali; mengejar kekalahan (chasing losses) adalah pintu utama jeratan pinjol.",
  "Sistem crash game memanipulasi emosi FOMO (takut ketinggalan untung), padahal titik ledakan roket sudah dipatok bandar sejak detik pertama.",
  "Satu-satunya cara pasti untuk mengalahkan bandar judi online adalah dengan tidak pernah memainkannya sama sekali.",
];

// Atur bagaimana notifikasi tampil saat aplikasi sedang aktif di foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Inisialisasi dan jadwalkan 1 Notifikasi Harian (Pukul 19:00 WIB)
 * Berisi pengingat edukasi bahaya judi online
 */
export async function initDailyNotification() {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("daily-anti-judol", {
        name: "Edukasi Bahaya Judi Online",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#00E5FF",
      });
    }

    // Minta izin notifikasi jika belum diberikan
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("[NotificationService] Izin notifikasi tidak diberikan pengguna.");
      return;
    }

    // Periksa apakah notifikasi harian sudah pernah dijadwalkan sebelumnya
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const alreadyScheduled = scheduled.some(
      (n) => n.identifier === "daily-anti-judol-reminder"
    );

    if (alreadyScheduled) {
      console.log("[NotificationService] Notifikasi harian sudah aktif terjadwal.");
      return;
    }

    // Pilih fakta acak untuk notifikasi hari ini
    const randomFact =
      SCIENTIFIC_FACTS[Math.floor(Math.random() * SCIENTIFIC_FACTS.length)];

    // Jadwalkan notifikasi harian pukul 19:00
    await Notifications.scheduleNotificationAsync({
      identifier: "daily-anti-judol-reminder",
      content: {
        title: "🔔 Pengingat Bahaya Game Online",
        body: randomFact,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 19,
        minute: 0,
      },
    });

    console.log("[NotificationService] Notifikasi harian berhasil dijadwalkan untuk pukul 19:00 WIB!");
  } catch (error) {
    console.log("[NotificationService] Gagal menjadwalkan notifikasi:", error);
  }
}
