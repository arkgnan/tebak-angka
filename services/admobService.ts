import Constants, { ExecutionEnvironment } from "expo-constants";
import { NativeModules, TurboModuleRegistry } from "react-native";

// ID Unit Iklan AdMob Resmi & Produksi:
export const GOOGLE_TEST_REWARDED_ID = "ca-app-pub-3940256099942544/5224354917";
export const PROD_REWARDED_AD_UNIT_ID = "ca-app-pub-8703649064343703/2122980851";

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
