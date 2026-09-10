import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import {
  isAdMobAvailable,
  GOOGLE_TEST_BANNER_ID,
  PROD_BANNER_AD_UNIT_ID,
} from "../services/admobService";

interface BannerAdComponentProps {
  position?: "top" | "bottom";
}

export default function BannerAdComponent({
  position = "bottom",
}: BannerAdComponentProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adFailed, setAdFailed] = useState(false);

  // Animasi 3 titik berdenyut (loading indicator saat proses lelang AdMob)
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!adLoaded && !adFailed) {
      const createDotAnimation = (dot: Animated.Value, delay: number) => {
        return Animated.sequence([
          Animated.delay(delay),
          Animated.loop(
            Animated.sequence([
              Animated.timing(dot, {
                toValue: 1,
                duration: 380,
                useNativeDriver: true,
              }),
              Animated.timing(dot, {
                toValue: 0,
                duration: 380,
                useNativeDriver: true,
              }),
            ])
          ),
        ]);
      };

      const anim = Animated.parallel([
        createDotAnimation(dot1, 0),
        createDotAnimation(dot2, 180),
        createDotAnimation(dot3, 360),
      ]);

      anim.start();

      return () => anim.stop();
    }
  }, [adLoaded, adFailed]);

  // Timeout pengaman 10 detik: jika lelang tidak menemukan pengiklan (No Fill) atau offline, sembunyikan container
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!adLoaded) {
        setAdFailed(true);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [adLoaded]);

  if (!isAdMobAvailable() || adFailed) {
    return null;
  }

  let BannerAd: any = null;
  let BannerAdSize: any = null;
  let TestIds: any = null;

  try {
    const mobileAds = require("react-native-google-mobile-ads");
    BannerAd = mobileAds.BannerAd;
    BannerAdSize = mobileAds.BannerAdSize;
    TestIds = mobileAds.TestIds;
  } catch (e) {
    return null;
  }

  if (!BannerAd || !BannerAdSize) {
    return null;
  }

  const adUnitId = __DEV__
    ? TestIds?.BANNER || GOOGLE_TEST_BANNER_ID
    : PROD_BANNER_AD_UNIT_ID;

  return (
    <View
      style={[
        styles.container,
        position === "top" ? styles.containerTop : styles.containerBottom,
        !adLoaded && styles.loadingContainer,
      ]}
    >
      {/* Indikator 3 Titik Berdenyut (Muncul hanya selama proses lelang / sebelum iklan dirender) */}
      {!adLoaded && (
        <View style={styles.loaderWrapper}>
          <Animated.View
            style={[
              styles.dot,
              styles.dotCyan,
              {
                opacity: dot1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.35, 1],
                }),
                transform: [
                  {
                    scale: dot1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.3],
                    }),
                  },
                  {
                    translateY: dot1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -3],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              styles.dotBlue,
              {
                opacity: dot2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.35, 1],
                }),
                transform: [
                  {
                    scale: dot2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.3],
                    }),
                  },
                  {
                    translateY: dot2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -3],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              styles.dotCyan,
              {
                opacity: dot3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.35, 1],
                }),
                transform: [
                  {
                    scale: dot3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.3],
                    }),
                  },
                  {
                    translateY: dot3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -3],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      )}

      {/* Komponen Banner Ad Native */}
      <View style={!adLoaded ? styles.adHidden : styles.adVisible}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdLoaded={() => {
            setAdLoaded(true);
          }}
          onAdFailedToLoad={(error: any) => {
            console.warn(
              `[AdMob Banner] Gagal memuat banner (Unit ID: ${adUnitId}):`,
              error?.code || error,
              error?.message || ""
            );
            setAdFailed(true);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B121E",
    paddingVertical: 4,
  },
  loadingContainer: {
    paddingVertical: 6,
    minHeight: 28,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  loaderWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotCyan: {
    backgroundColor: "#00E5FF",
  },
  dotBlue: {
    backgroundColor: "#3B82F6",
  },
  adHidden: {
    opacity: 0,
    position: "absolute",
    pointerEvents: "none",
  },
  adVisible: {
    opacity: 1,
  },
  containerTop: {
    borderBottomWidth: 1,
    borderBottomColor: "#172236",
  },
  containerBottom: {
    borderTopWidth: 1,
    borderTopColor: "#172236",
  },
});
