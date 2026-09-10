declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?: string;
    EXPO_PUBLIC_ADMOB_APP_ID?: string;
    EXPO_PUBLIC_ADMOB_REWARDED_ID?: string;
    EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID?: string;
    EXPO_PUBLIC_ADMOB_BANNER_ID?: string;
    [key: string]: string | undefined;
  }
}
