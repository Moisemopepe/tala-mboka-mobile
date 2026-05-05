import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "./Card";
import { categoryByKey } from "../utils/categories";
import { riskMeta } from "../utils/risk";
import { colors } from "../theme";
import { imageUrl } from "../services/api";

function formatDate(value) {
  if (!value) return "Date non disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date non disponible";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function ReportCard({ report, onMapPress }) {
  const image = report.imageUrl || report.imageUrls?.[0];
  const likesCount = Array.isArray(report.likes) ? report.likes.length : report.likesCount || 0;
  const category = categoryByKey(report.category);
  const risk = riskMeta(report.status || report.risk);

  return (
    <Card style={styles.card}>
      {image ? (
        <Image source={{ uri: imageUrl(image) }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name={category.icon} size={36} color={category.color} />
          <Text style={styles.placeholderText}>{category.label}</Text>
        </View>
      )}

      <View style={styles.body}>
        <View style={styles.topLine}>
          <View style={[styles.categoryPill, { backgroundColor: `${category.color}18` }]}>
            <Ionicons name={category.icon} size={15} color={category.color} />
            <Text style={[styles.categoryText, { color: category.color }]}>{category.label}</Text>
          </View>
          <View style={[styles.riskPill, { backgroundColor: risk.bg }]}>
            <Text style={[styles.riskText, { color: risk.color }]}>{risk.shortLabel}</Text>
          </View>
        </View>

        <Text style={styles.title}>{report.title || "Alerte citoyenne"}</Text>
        <Text numberOfLines={2} style={styles.description}>{report.description || "Aucune description fournie."}</Text>

        <View style={styles.metaBox}>
          <View style={styles.metaLine}>
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <Text style={styles.metaText}>{report.province || "Province"} / {report.commune || "Commune"}</Text>
          </View>
          <View style={styles.metaLine}>
            <Ionicons name="time-outline" size={16} color={colors.muted} />
            <Text style={styles.muted}>{formatDate(report.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <View style={styles.support}>
            <Ionicons name="people-outline" size={17} color={colors.primary} />
            <Text style={styles.supportText}>{likesCount} concerné{likesCount > 1 ? "s" : ""}</Text>
          </View>
          {onMapPress ? (
            <Pressable onPress={() => onMapPress(report)} style={({ pressed }) => [styles.mapButton, pressed && styles.pressed]}>
              <Ionicons name="map-outline" size={17} color={colors.text} />
              <Text style={styles.mapButtonText}>Carte</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    padding: 0
  },
  image: {
    height: 172,
    width: "100%"
  },
  placeholder: {
    alignItems: "center",
    backgroundColor: "#eef6f1",
    gap: 8,
    height: 172,
    justifyContent: "center"
  },
  placeholderText: {
    color: colors.text,
    fontWeight: "900"
  },
  body: {
    gap: 11,
    padding: 15
  },
  topLine: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  categoryPill: {
    alignItems: "center",
    borderRadius: 99,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "900"
  },
  riskPill: {
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  riskText: {
    fontSize: 12,
    fontWeight: "900"
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900"
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21
  },
  metaBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    gap: 7,
    padding: 12
  },
  metaLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7
  },
  metaText: {
    color: colors.text,
    flex: 1,
    fontWeight: "800"
  },
  muted: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  support: {
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderRadius: 14,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  supportText: {
    color: colors.primary,
    fontWeight: "900"
  },
  mapButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  mapButtonText: {
    color: colors.text,
    fontWeight: "900"
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }]
  }
});
