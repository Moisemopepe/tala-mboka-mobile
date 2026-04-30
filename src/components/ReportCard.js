import { Image, StyleSheet, Text, View } from "react-native";
import Card from "./Card";
import { categoryLabel } from "../utils/categories";
import { colors } from "../theme";
import { imageUrl } from "../services/api";

export default function ReportCard({ report }) {
  const image = report.imageUrl || report.imageUrls?.[0];

  return (
    <Card style={styles.card}>
      {image ? (
        <Image source={{ uri: imageUrl(image) }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Aucun visuel</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.category}>{categoryLabel(report.category)}</Text>
        <Text style={styles.title}>{report.title}</Text>
        <Text numberOfLines={2} style={styles.description}>{report.description}</Text>
        <View style={styles.locationBox}>
          <Text style={styles.location}>📍 {report.province || "-"} / {report.commune || "-"}</Text>
          <Text style={styles.coords}>
            {report.location?.lat?.toFixed?.(4) || report.location?.lat}, {report.location?.lng?.toFixed?.(4) || report.location?.lng}
          </Text>
        </View>
        <Text style={styles.likes}>{report.likesCount || 0} personne concernée</Text>
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
    height: 190,
    width: "100%"
  },
  placeholder: {
    alignItems: "center",
    backgroundColor: "#eef2f7",
    height: 190,
    justifyContent: "center"
  },
  placeholderText: {
    color: colors.muted,
    fontWeight: "800"
  },
  body: {
    gap: 10,
    padding: 16
  },
  category: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
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
  locationBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    gap: 4,
    padding: 12
  },
  location: {
    color: colors.text,
    fontWeight: "800"
  },
  coords: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  likes: {
    backgroundColor: "#ecfdf5",
    borderRadius: 12,
    color: colors.primary,
    fontWeight: "900",
    padding: 12
  }
});
