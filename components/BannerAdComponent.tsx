import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
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
        !adLoaded && styles.hidden,
      ]}
    >
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
          console.log("[AdMob Banner] Failed to load:", error);
          setAdFailed(true);
        }}
      />
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
  containerTop: {
    borderBottomWidth: 1,
    borderBottomColor: "#172236",
  },
  containerBottom: {
    borderTopWidth: 1,
    borderTopColor: "#172236",
  },
  hidden: {
    height: 0,
    overflow: "hidden",
    paddingVertical: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
});
