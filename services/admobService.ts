import Constants, { ExecutionEnvironment } from "expo-constants";
import { NativeModules, TurboModuleRegistry } from "react-native";

// ID Unit Iklan AdMob Resmi & Produksi:
export const GOOGLE_TEST_REWARDED_ID = "ca-app-pub-3940256099942544/5224354917";
export const PROD_REWARDED_AD_UNIT_ID = "ca-app-pub-8703649064343703/2122980851";

// ID Unit Iklan Interstitial (Layar Penuh Tanpa Reward - Khusus Tombol Keluar):
export const GOOGLE_TEST_INTERSTITIAL_ID = "ca-app-pub-3940256099942544/1033173712";
// Ganti dengan Unit ID Interstitial asli Anda dari dashboard AdMob saat rilis
export const PROD_INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-8703649064343703/6325220799";

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
    }
  } catch (err) {
    console.warn("[AdMob] Gagal inisialisasi:", err);
  }
};

/**
 * Menampilkan Iklan Interstitial (tanpa reward) saat pengguna keluar aplikasi.
 * Jika iklan gagal dimuat atau timeout, langsung memanggil callback onClose()
 * agar pengguna tidak merasa aplikasi macet/freeze.
 */
export const showExitInterstitialAd = (onDone: () => void) => {
  if (!isAdMobAvailable()) {
    onDone();
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

    // Timeout pengaman 1.5 detik jika koneksi lambat
    const timeout = setTimeout(() => {
      finish();
    }, 1500);

    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        clearTimeout(timeout);
        try {
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
      () => {
        clearTimeout(timeout);
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
