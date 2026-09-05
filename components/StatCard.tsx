import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface StatCardProps {
  credits: number;
  totalPlayed: number;
  totalWins: number;
  totalLosses: number;
  moneyLost: number;
  totalAdsWatched: number;
  onTopUpPress: () => void;
}

export default function StatCard({
  credits,
  totalPlayed,
  totalWins,
  moneyLost,
  totalAdsWatched,
  onTopUpPress,
}: StatCardProps) {
  const winRate =
    totalPlayed > 0 ? Math.round((totalWins / totalPlayed) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Kartu Kredit Utama */}
      <View style={styles.creditCard}>
        <View>
          <Text style={styles.creditLabel}>SISA KREDIT BERMAIN</Text>
          <View style={styles.creditRow}>
            <Text style={styles.creditValue}>{credits}</Text>
            <Text style={styles.creditSubtext}>
              {credits === 0
                ? " (Habis - Perlu Top Up!)"
                : credits <= 1
                  ? " (Kritis)"
                  : " Kredit Tersedia"}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.topUpButton} onPress={onTopUpPress}>
          <Text style={styles.topUpButtonText}>+ Top Up (+5)</Text>
        </TouchableOpacity>
      </View>

      {/* Grid Statistik Boncos */}
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Putaran Dimainkan</Text>
          <Text style={styles.gridValue}>{totalPlayed}x</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Rasio Kemenangan</Text>
          <Text
            style={[
              styles.gridValue,
              { color: winRate < 30 ? "#FF5252" : "#FFD600" },
            ]}
          >
            {winRate}%
          </Text>
          <Text style={styles.gridNote}>Bandar Selalu Menang</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Simulasi Uang Boncos</Text>
          <Text style={[styles.gridValue, { color: "#FF5252" }]}>
            Rp {moneyLost.toLocaleString("id-ID")}
          </Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Top Up Iklan Ditonton</Text>
          <Text style={styles.gridValue}>{totalAdsWatched}x</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 12,
  },
  creditCard: {
    backgroundColor: "#172338",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#263B5E",
  },
  creditLabel: {
    fontSize: 11,
    color: "#7E97B8",
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  creditRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },
  creditValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#00E5FF",
  },
  creditSubtext: {
    fontSize: 12,
    color: "#A2B6CF",
    marginLeft: 6,
    fontWeight: "500",
  },
  topUpButton: {
    backgroundColor: "#FFB300",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#FFB300",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  topUpButtonText: {
    color: "#161F30",
    fontWeight: "800",
    fontSize: 13,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridItem: {
    flex: 1,
    minWidth: "46%",
    backgroundColor: "#111B2C",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1C2B42",
  },
  gridLabel: {
    fontSize: 11,
    color: "#7E97B8",
    fontWeight: "600",
  },
  gridValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 4,
  },
  gridNote: {
    fontSize: 9,
    color: "#FF5252",
    fontWeight: "600",
    marginTop: 2,
  },
});
