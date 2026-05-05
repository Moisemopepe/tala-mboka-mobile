import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import Screen from "../components/Screen";
import BrandHeader from "../components/BrandHeader";
import Button from "../components/Button";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { colors } from "../theme";

export default function NotificationsScreen({ navigation }) {
  const { isAuthenticated, token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await api("/notifications", {}, token);
      setItems(data.notifications || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  async function markRead() {
    try {
      await api("/notifications/read", { method: "PATCH" }, token);
      setItems((current) => current.map((item) => ({ ...item, read: true })));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  if (!isAuthenticated) {
    return (
      <Screen>
        <BrandHeader eyebrow="Notifications" title="Connectez-vous" subtitle="Les notifications sont réservées aux utilisateurs connectés." />
        <Button title="Aller au compte" onPress={() => navigation.navigate("Compte")} />
      </Screen>
    );
  }

  return (
    <Screen refreshControl={<RefreshControl refreshing={loading} onRefresh={loadNotifications} />}>
      <BrandHeader eyebrow="Notifications" title="Mises à jour" subtitle="Recevez les changements importants liés à vos alertes." />
      <View style={styles.actions}>
        <Button title="Actualiser" variant="secondary" onPress={loadNotifications} style={styles.action} />
        <Button title="Tout lu" onPress={markRead} style={styles.action} />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <Card>
          <Text style={styles.muted}>Chargement...</Text>
        </Card>
      ) : null}
      {!loading && items.length === 0 ? (
        <Card style={styles.empty}>
          <Ionicons name="notifications-outline" size={38} color={colors.muted} />
          <Text style={styles.emptyTitle}>Aucune notification</Text>
          <Text style={styles.muted}>Les prochaines mises à jour apparaîtront ici.</Text>
        </Card>
      ) : null}
      {items.map((item) => (
        <Card key={item._id} style={[styles.notification, !item.read && styles.unread]}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleString("fr-FR")}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 10
  },
  action: {
    flex: 1
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
    lineHeight: 22,
    textAlign: "center"
  },
  empty: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 28
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900"
  },
  notification: {
    gap: 8
  },
  unread: {
    backgroundColor: "#ecfdf5"
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  message: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 22
  },
  date: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "800"
  }
});
