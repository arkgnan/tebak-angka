import Constants, { ExecutionEnvironment } from "expo-constants";
import { NativeModules, TurboModuleRegistry } from "react-native";

// ID Unit Iklan AdMob Resmi & Produksi:
export const GOOGLE_TEST_REWARDED_ID = "ca-app-pub-3940256099942544/5224354917";
export const PROD_REWARDED_AD_UNIT_ID =
  process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID || GOOGLE_TEST_REWARDED_ID;

// ID Unit Iklan Interstitial (Layar Penuh Tanpa Reward - Khusus Tombol Keluar):
export const GOOGLE_TEST_INTERSTITIAL_ID = "ca-app-pub-3940256099942544/1033173712";
export const PROD_INTERSTITIAL_AD_UNIT_ID =
  process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID || GOOGLE_TEST_INTERSTITIAL_ID;

/**
 * Memeriksa apakah aplikasi saat ini berjalan di dalam Expo Go Client.
 * Expo Go adalah aplikasi sandbox pre-compiled dari Expo yang tidak menyertakan
 * library binary native seperti react-native-google-mobile-ads.
 */
export const isRunningInExpoGo = (): boolean => {
  return (
    Constants.appOwnership === "expo" ||
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  );
};

/**
 * Memeriksa apakah modul native Google Mobile Ads benar-benar terdaftar di binary aplikasi.
 * Pemeriksaan ini mencegah crash:
 * "TurboModuleRegistry.getEnforcing(...): 'RNGoogleMobileAdsModule' could not be found"
 */
export const isAdMobAvailable = (): boolean => {
  if (isRunningInExpoGo()) {
    return false;
  }
  try {
    const hasTurbo =
      typeof TurboModuleRegistry?.get === "function" &&
      TurboModuleRegistry.get("RNGoogleMobileAdsModule") != null;
    const hasNative = NativeModules?.RNGoogleMobileAdsModule != null;
    return !!(hasTurbo || hasNative);
  } catch (e) {
    return false;
  }
};

/**
 * Inisialisasi Google Mobile Ads SDK secara aman jika modul native tersedia.
 */
export const initializeMobileAds = async () => {
  if (!isAdMobAvailable()) {
    console.log(
      "[AdMob] Berjalan di Expo Go / native module tidak terpasang. Mode simulasi aktif."
    );
    return;
  }

  try {
    const mobileAds = require("react-native-google-mobile-ads").default;
    if (mobileAds) {
      const statuses = await mobileAds().initialize();
      console.log("[AdMob] SDK berhasil diinisialisasi:", statuses);
      preloadExitInterstitialAd();
    }
  } catch (err) {
    console.warn("[AdMob] Gagal inisialisasi:", err);
  }
};

// State singleton untuk preloading Iklan Interstitial
let exitInterstitialAdInstance: any = null;
let isExitAdReady = false;
let isCurrentlyLoadingExitAd = false;
let exitAdOnDoneCallback: (() => void) | null = null;

/**
 * Melakukan pre-loading Iklan Interstitial di background agar saat pengguna
 * menekan tombol keluar (2x back), iklan sudah siap 100% dan langsung tampil
 * tanpa jeda waktu unduh.
 */
export const preloadExitInterstitialAd = () => {
  if (!isAdMobAvailable() || isCurrentlyLoadingExitAd || isExitAdReady) {
    return;
  }

  try {
    const {
      InterstitialAd,
      AdEventType,
      TestIds,
    } = require("react-native-google-mobile-ads");

    const adUnitId = __DEV__
      ? TestIds?.INTERSTITIAL || GOOGLE_TEST_INTERSTITIAL_ID
      : PROD_INTERSTITIAL_AD_UNIT_ID || GOOGLE_TEST_INTERSTITIAL_ID;

    console.log("[AdMob] Memulai pre-loading Exit Interstitial Ad dengan Unit ID:", adUnitId);
    isCurrentlyLoadingExitAd = true;

    const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        isCurrentlyLoadingExitAd = false;
        isExitAdReady = true;
        exitInterstitialAdInstance = interstitial;
        console.log("[AdMob] Exit Interstitial Ad BERHASIL di-load & siap tayang seketika!");
      }
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log("[AdMob] Exit Interstitial Ad ditutup oleh user.");
        isExitAdReady = false;
        exitInterstitialAdInstance = null;
        unsubscribeLoaded();
        unsubscribeClosed();

        if (exitAdOnDoneCallback) {
          const cb = exitAdOnDoneCallback;
          exitAdOnDoneCallback = null;
          cb();
        }

        // Otomatis preload lagi untuk sesi berikutnya
        preloadExitInterstitialAd();
      }
    );

    const unsubscribeError = interstitial.addAdEventListener(
      AdEventType.ERROR,
      (err: any) => {
        isCurrentlyLoadingExitAd = false;
        isExitAdReady = false;
        exitInterstitialAdInstance = null;
        console.warn("[AdMob] Gagal preload exit interstitial ad:", err);
        unsubscribeLoaded();
        unsubscribeClosed();
        unsubscribeError();

        // Jika user sedang menunggu keluar saat error terjadi, jalankan callback keluar
        if (exitAdOnDoneCallback) {
          const cb = exitAdOnDoneCallback;
          exitAdOnDoneCallback = null;
          cb();
        }
      }
    );

    interstitial.load();
  } catch (error) {
    isCurrentlyLoadingExitAd = false;
    console.warn("[AdMob] Error saat membuat instance interstitial:", error);
  }
};

/**
 * Menampilkan Iklan Interstitial (tanpa reward) saat pengguna keluar aplikasi.
 * Jika iklan sudah di-preload, iklan langsung muncul instan.
 * Jika belum selesai di-preload, sistem akan menunggu sampai ad selesai dimuat.
 */
export const showExitInterstitialAd = (onDone: () => void) => {
  if (!isAdMobAvailable()) {
    console.log("[AdMob] Modul AdMob tidak tersedia, langsung keluar.");
    onDone();
    return;
  }

  // KASUS 1: Iklan sudah selesai di-preload sebelumnya (Paling Cepat & Instan)
  if (isExitAdReady && exitInterstitialAdInstance) {
    console.log("[AdMob] Menampilkan pre-loaded Exit Interstitial Ad...");
    exitAdOnDoneCallback = onDone;
    try {
      exitInterstitialAdInstance.show();
      return;
    } catch (e) {
      console.warn("[AdMob] Gagal show preloaded interstitial:", e);
      onDone();
      return;
    }
  }

  // KASUS 2: Iklan belum siap di memori -> Load on-demand dengan timeout realistis (3.5 detik)
  console.log("[AdMob] Exit ad belum ready di cache, memuat on-demand...");
  try {
    const {
      InterstitialAd,
      AdEventType,
      TestIds,
    } = require("react-native-google-mobile-ads");

    const adUnitId = __DEV__
      ? TestIds?.INTERSTITIAL || GOOGLE_TEST_INTERSTITIAL_ID
      : PROD_INTERSTITIAL_AD_UNIT_ID || GOOGLE_TEST_INTERSTITIAL_ID;

    const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    let hasHandled = false;
    const finish = () => {
      if (!hasHandled) {
        hasHandled = true;
        onDone();
      }
    };

    // Timeout pengaman 3.5 detik jika koneksi internet sangat lambat
    const timeout = setTimeout(() => {
      console.log("[AdMob] Timeout memuat iklan exit (3.5s), keluar aplikasi.");
      finish();
    }, 3500);

    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        clearTimeout(timeout);
        try {
          console.log("[AdMob] On-demand interstitial loaded, menampilkan...");
          interstitial.show();
        } catch (e) {
          finish();
        }
      }
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        clearTimeout(timeout);
        unsubscribeLoaded();
        unsubscribeClosed();
        finish();
      }
    );

    const unsubscribeError = interstitial.addAdEventListener(
      AdEventType.ERROR,
      (err: any) => {
        clearTimeout(timeout);
        console.warn("[AdMob] Error saat on-demand interstitial:", err);
        unsubscribeLoaded();
        unsubscribeClosed();
        unsubscribeError();
        finish();
      }
    );

    interstitial.load();
  } catch (error) {
    console.warn("[AdMob] Error saat memuat exit interstitial ad:", error);
    onDone();
  }
};
