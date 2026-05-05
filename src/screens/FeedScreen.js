import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import Screen from "../components/Screen";
import BrandHeader from "../components/BrandHeader";
import Button from "../components/Button";
import Card from "../components/Card";
import ReportCard from "../components/ReportCard";
import { api } from "../services/api";
import { colors } from "../theme";
import { categories } from "../utils/categories";
import { riskLevels } from "../utils/risk";

export default function FeedScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");
  const [risk, setRisk] = useState("all");

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (category !== "all") query.set("category", category);
      if (risk !== "all") query.set("status", risk);
      const suffix = query.toString() ? `?${query.toString()}` : "";
      const data = await api(`/reports${suffix}`);
      setReports(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, risk]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const urgentCount = useMemo(() => reports.filter((report) => report.status === "danger").length, [reports]);

  return (
    <Screen refreshControl={<RefreshControl refreshing={loading} onRefresh={loadReports} />}>
      <BrandHeader
        eyebrow="Fil citoyen"
        title="Alertes autour de vous"
        subtitle="Suivez les problèmes signalés en temps réel."
      />

      <Card style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="radio-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>{reports.length} alerte{reports.length > 1 ? "s" : ""} visible{reports.length > 1 ? "s" : ""}</Text>
          <Text style={styles.muted}>{urgentCount} urgence{urgentCount > 1 ? "s" : ""} à traiter en priorité.</Text>
        </View>
      </Card>

      <View style={styles.row}>
        <Button title="Signaler" onPress={() => navigation.navigate("Signaler")} style={styles.rowButton} />
        <Button title="Carte" variant="secondary" onPress={() => navigation.navigate("Carte")} style={styles.rowButton} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="Tous" active={category === "all"} onPress={() => setCategory("all")} />
        {categories.map((item) => (
          <Chip key={item.key} label={item.label} active={category === item.key} onPress={() => setCategory(item.key)} />
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="Tous les risques" active={risk === "all"} onPress={() => setRisk("all")} />
        {riskLevels.map((item) => (
          <Chip key={item.key} label={item.label} active={risk === item.key} onPress={() => setRisk(item.key)} />
        ))}
      </ScrollView>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <Card>
          <Text style={styles.muted}>Chargement des alertes...</Text>
        </Card>
      ) : null}
      {!loading && reports.length === 0 ? (
        <Card style={styles.empty}>
          <Ionicons name="file-tray-outline" size={38} color={colors.muted} />
          <Text style={styles.emptyTitle}>Aucune alerte disponible</Text>
          <Text style={styles.muted}>Soyez le premier à signaler un problème dans votre zone.</Text>
          <Button title="Créer une alerte" onPress={() => navigation.navigate("Signaler")} />
        </Card>
      ) : null}
      <View style={styles.list}>
        {reports.map((report) => (
          <ReportCard key={report._id || report.id} report={report} onMapPress={() => navigation.navigate("Carte")} />
        ))}
      </View>
    </Screen>
  );
}

function Chip({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    flexDirection: "row",
    gap: 13
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: "#dcfce7",
    borderRadius: 18,
    height: 52,
    justifyContent: "center",
    width: 52
  },
  heroText: {
    flex: 1,
    gap: 3
  },
  heroTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  row: {
    flexDirection: "row",
    gap: 10
  },
  rowButton: {
    flex: 1
  },
  chips: {
    gap: 9,
    paddingRight: 18
  },
  chip: {
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  chipActive: {
    backgroundColor: "#ecfdf5",
    borderColor: "#86efac"
  },
  chipText: {
    color: colors.text,
    fontWeight: "900"
  },
  chipTextActive: {
    color: colors.primary
  },
  pressed: {
    opacity: 0.75
  },
  error: {
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    color: colors.danger,
    fontWeight: "800",
    padding: 12
  },
  muted: {
    color: colors.muted,
    fontWeight: "700",
    lineHeight: 22
  },
  empty: {
    alignItems: "center",
    gap: 11,
    paddingVertical: 28
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center"
  },
  list: {
    gap: 14
  }
});
