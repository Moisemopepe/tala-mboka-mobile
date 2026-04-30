import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import Screen from "../components/Screen";
import BrandHeader from "../components/BrandHeader";
import Button from "../components/Button";
import Card from "../components/Card";
import ReportCard from "../components/ReportCard";
import { api } from "../services/api";
import { colors } from "../theme";

export default function FeedScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <Screen>
      <BrandHeader
        eyebrow="Fil citoyen"
        title="Alertes autour de vous"
        subtitle="Suivez les problèmes signalés en temps réel."
      />
      <Button title="Signaler un problème" onPress={() => navigation.navigate("Signaler")} />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <Card>
          <Text style={styles.muted}>Chargement des alertes...</Text>
        </Card>
      ) : null}
      {!loading && reports.length === 0 ? (
        <Card style={styles.empty}>
          <Text style={styles.emptyTitle}>Aucune alerte pour le moment</Text>
          <Text style={styles.muted}>Soyez le premier à signaler.</Text>
        </Card>
      ) : null}
      <View
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadReports} />}
        style={styles.list}
      >
        {reports.map((report) => (
          <ReportCard key={report._id || report.id} report={report} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    gap: 8,
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
