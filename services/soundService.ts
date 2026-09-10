import { Vibration } from "react-native";

// Sumber audio lokal
const SOUND_FILES = {
  click: require("../assets/sounds/btn_click.wav"),
  tick: require("../assets/sounds/spin_tick.wav"),
  win: require("../assets/sounds/win_chime.wav"),
  jackpot: require("../assets/sounds/jackpot.wav"),
  loss: require("../assets/sounds/loss_buzz.wav"),
  rocketFly: require("../assets/sounds/rocket_fly.wav"),
  explosion: require("../assets/sounds/explosion.wav"),
  clash: require("../assets/sounds/clash.wav"),
  wheelSpin: require("../assets/sounds/wheel_spin.wav"),
  slotLever: require("../assets/sounds/slot_lever.wav"),
  slotReel: require("../assets/sounds/slot_reel.wav"),
  slotStop: require("../assets/sounds/slot_stop.wav"),
  tension: require("../assets/sounds/tension.wav"),
};

type SoundKey = keyof typeof SOUND_FILES;

// Cache Sound instances dari expo-av
const soundObjects: Partial<Record<SoundKey, any>> = {};
let isAudioInitialized = false;
let isAudioAvailable = true;

/**
 * Inisialisasi Audio dan preload sound effects
 */
export async function initAudio() {
  if (isAudioInitialized) return;
  isAudioInitialized = true;

  try {
    const { Audio } = require("expo-av");
    if (!Audio) {
      isAudioAvailable = false;
      return;
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    // Preload sounds
    for (const [key, source] of Object.entries(SOUND_FILES)) {
      try {
        const { sound } = await Audio.Sound.createAsync(source, {
          shouldPlay: false,
          volume: 0.85,
        });
        soundObjects[key as SoundKey] = sound;
      } catch (err) {
        console.log(`[SoundService] Gagal memuat sound ${key}:`, err);
      }
    }
  } catch (e) {
    console.log("[SoundService] expo-av tidak aktif di environment saat ini:", e);
    isAudioAvailable = false;
  }
}

/**
 * Mainkan sound effect dengan safe fallback
 */
async function playSound(key: SoundKey, volume = 0.85) {
  try {
    if (!isAudioAvailable) return;

    const sound = soundObjects[key];
    if (sound) {
      await sound.setPositionAsync(0);
      await sound.setVolumeAsync(volume);
      await sound.playAsync();
    } else {
      // Jika belum di-cache, coba buat on-the-fly
      const { Audio } = require("expo-av");
      const { sound: newSound } = await Audio.Sound.createAsync(
        SOUND_FILES[key],
        { shouldPlay: true, volume }
      );
      soundObjects[key] = newSound;
    }
  } catch (e) {
    // Ignore audio error silently agar gameplay tidak terganggu
  }
}

/**
 * Hentikan sound effect tertentu jika sedang diputar
 */
async function stopSound(key: SoundKey) {
  try {
    const sound = soundObjects[key];
    if (sound) {
      await sound.stopAsync();
    }
  } catch (e) {
    // Ignore error
  }
}

/**
 * Service Efek Suara & Getar (Haptics) untuk Seluruh Game
 */
export const SoundEffects = {
  /**
   * Efek tombol diklik (pilihan angka, taruhan, dll)
   */
  playClick() {
    Vibration.vibrate(25);
    playSound("click", 0.7);
  },

  /**
   * Efek tick / ratchet mekanik (roda berputar, rol slot bergerak, kocok tangan suit)
   */
  playSpinTick() {
    Vibration.vibrate(15);
    playSound("tick", 0.5);
  },

  /**
   * Efek saat pemain menang / berhasil tebak / cashout
   */
  playWin() {
    Vibration.vibrate([0, 60, 40, 100]);
    playSound("win", 0.9);
  },

  /**
   * Efek saat pemain dapat Jackpot x10 / 777 / kemenangan besar
   */
  playJackpot() {
    Vibration.vibrate([0, 80, 40, 80, 40, 160]);
    playSound("jackpot", 1.0);
  },

  /**
   * Efek kekalahan / zonk / rungkad
   */
  playLoss() {
    Vibration.vibrate([0, 140]);
    playSound("loss", 0.8);
  },

  /**
   * Efek suara roket terbang dan bergemuruh
   */
  playRocketThrust() {
    Vibration.vibrate(35);
    playSound("rocketFly", 0.75);
  },

  /**
   * Efek ledakan dramatis saat roket meledak (Crash)
   */
  playExplosion() {
    Vibration.vibrate([0, 200, 60, 120]);
    playSound("explosion", 1.0);
  },

  /**
   * Efek benturan adu tangan dalam permainan Suit
   */
  playClash() {
    Vibration.vibrate([0, 50, 30, 70]);
    playSound("clash", 0.85);
  },

  /**
   * Efek putaran roda berkecepatan tinggi yang melambat realistis (Wheel Game)
   */
  playWheelSpin() {
    Vibration.vibrate([0, 30, 50, 30, 80, 25, 120, 20]);
    playSound("wheelSpin", 0.9);
  },

  /**
   * Hentikan suara putaran roda jika selesai lebih cepat
   */
  stopWheelSpin() {
    stopSound("wheelSpin");
  },

  /**
   * Efek hentakan tuas mekanik mesin slot (Slot Game)
   */
  playSlotLever() {
    Vibration.vibrate([0, 50, 40, 60]);
    playSound("slotLever", 0.95);
  },

  /**
   * Efek desingan motor reel berputar (Slot Game)
   */
  playSlotReel() {
    playSound("slotReel", 0.8);
  },

  /**
   * Efek kunci / kait reel mekanik berhenti (Slot Game)
   */
  playSlotStop() {
    Vibration.vibrate(30);
    playSound("slotStop", 0.85);
  },

  /**
   * Efek ketegangan / detak jantung saat reel 1 & 2 kembar 7️⃣ (Near-Miss Suspense)
   */
  playTension() {
    Vibration.vibrate([0, 80, 100, 80]);
    playSound("tension", 0.95);
  },

  /**
   * Hentikan suara desingan slot reel
   */
  stopSlotReel() {
    stopSound("slotReel");
  },
};
