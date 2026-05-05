import * as Location from "expo-location";
import { Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import Screen from "../components/Screen";
import BrandHeader from "../components/BrandHeader";
import Button from "../components/Button";
import Card from "../components/Card";
import ReportCard from "../components/ReportCard";
import { api } from "../services/api";
import { colors } from "../theme";
import { categoryByKey } from "../utils/categories";
import { riskLevels, riskMeta } from "../utils/risk";

export default function MapScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState("all");

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api("/reports");
      setReports(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const visibleReports = useMemo(() => {
    if (selectedRisk === "all") return reports;
    return reports.filter((report) => (report.status || report.risk) === selectedRisk);
  }, [reports, selectedRisk]);

  const breakdown = useMemo(() => {
    return riskLevels.map((risk) => ({
      ...risk,
      count: reports.filter((report) => riskMeta(report.status || report.risk).key === risk.key).length
    }));
  }, [reports]);

  async function locateMe() {
    setError("");
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      setError("Autorisez la localisation pour voir les alertes proches.");
      return;
    }
    const current = await Location.getCurrentPositionAsync({});
    setUserLocation(current.coords);
  }

  return (
    <Screen refreshControl={<RefreshControl refreshing={loading} onRefresh={loadReports} />}>
      <BrandHeader eyebrow="Carte" title="Carte des risques" subtitle="Repérez rapidement les zones qui demandent une action." />

      <Card style={styles.mapPanel}>
        <View style={styles.mapHeader}>
          <Text style={styles.mapTitle}>Vue mobile intelligente</Text>
          <Button title="Me localiser" variant="secondary" onPress={locateMe} style={styles.locateButton} />
        </View>
        <View style={styles.mapCanvas}>
          {visibleReports.slice(0, 12).map((report, index) => {
            const risk = riskMeta(report.status || report.risk);
            return (
              <View
                key={report._id || `${report.title}-${index}`}
                style={[
                  styles.marker,
                  {
                    backgroundColor: risk.color,
                    left: `${12 + ((index * 23) % 72)}%`,
                    top: `${18 + ((index * 31) % 58)}%`
                  }
                ]}
              />
            );
          })}
          {userLocation ? (
            <View style={styles.userDot}>
              <Ionicons name="person" size={14} color="#fff" />
            </View>
          ) : null}
        </View>
        <Text style={styles.muted}>
          Cette vue est optimisée mobile. La carte native complète pourra être activée ensuite avec Google Maps ou OpenStreetMap.
        </Text>
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.riskGrid}>
        <RiskChip label="Tous" count={reports.length} active={selectedRisk === "all"} onPress={() => setSelectedRisk("all")} />
        {breakdown.map((risk) => (
          <RiskChip
            key={risk.key}
            label={risk.shortLabel}
            count={risk.count}
            color={risk.color}
            bg={risk.bg}
            active={selectedRisk === risk.key}
            onPress={() => setSelectedRisk(risk.key)}
          />
        ))}
      </View>

      {loading ? (
        <Card>
          <Text style={styles.muted}>Chargement de la carte...</Text>
        </Card>
      ) : null}

      {!loading && visibleReports.length === 0 ? (
        <Card style={styles.empty}>
          <Ionicons name="map-outline" size={38} color={colors.muted} />
          <Text style={styles.emptyTitle}>Aucune alerte dans cette zone</Text>
        </Card>
      ) : null}

      {visibleReports.map((report) => {
        const category = categoryByKey(report.category);
        return (
          <View key={report._id || report.id} style={styles.reportWrap}>
            <View style={[styles.sideBar, { backgroundColor: category.color }]} />
            <ReportCard report={report} />
          </View>
        );
      })}
    </Screen>
  );
}

function RiskChip({ label, count, color = colors.primary, bg = "#ecfdf5", active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.riskChip, { backgroundColor: active ? bg : "#fff", borderColor: active ? color : colors.border }]}>
      <Text style={[styles.riskCount, { color }]}>{count}</Text>
      <Text style={styles.riskLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  mapPanel: {
    gap: 13
  },
  mapHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  mapTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 18,
    fontWeight: "900"
  },
  locateButton: {
    minHeight: 44,
    paddingHorizontal: 12
  },
  mapCanvas: {
    backgroundColor: "#dff6ea",
    borderColor: "#bbf7d0",
    borderRadius: 22,
    borderWidth: 1,
    height: 260,
    overflow: "hidden"
  },
  marker: {
    borderColor: "#fff",
    borderRadius: 99,
    borderWidth: 3,
    height: 24,
    position: "absolute",
    width: 24
  },
  userDot: {
    alignItems: "center",
    backgroundColor: colors.text,
    borderColor: "#fff",
    borderRadius: 99,
    borderWidth: 3,
    height: 34,
    justifyContent: "center",
    left: "48%",
    position: "absolute",
    top: "46%",
    width: 34
  },
  muted: {
    color: colors.muted,
    fontWeight: "700",
    lineHeight: 21
  },
  error: {
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    color: colors.danger,
    fontWeight: "800",
    padding: 12
  },
  riskGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  riskChip: {
    borderRadius: 16,
    borderWidth: 1,
    minWidth: "30%",
    padding: 12
  },
  riskCount: {
    fontSize: 20,
    fontWeight: "900"
  },
  riskLabel: {
    color: colors.text,
    fontWeight: "900"
  },
  empty: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 28
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900"
  },
  reportWrap: {
    flexDirection: "row",
    gap: 8
  },
  sideBar: {
    borderRadius: 99,
    width: 5
  }
});
