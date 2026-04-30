import { StyleSheet, Text } from "react-native";
import Screen from "../components/Screen";
import BrandHeader from "../components/BrandHeader";
import Card from "../components/Card";
import { colors } from "../theme";

export default function MapScreen() {
  return (
    <Screen>
      <BrandHeader eyebrow="Carte" title="Carte citoyenne" subtitle="La carte native sera ajoutée dans la prochaine étape." />
      <Card style={styles.map}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.title}>Carte en préparation</Text>
        <Text style={styles.text}>Nous allons connecter une carte mobile native avec les signalements autour de vous.</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  map: {
    alignItems: "center",
    gap: 10,
    minHeight: 360,
    justifyContent: "center"
  },
  icon: {
    fontSize: 46
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900"
  },
  text: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
    textAlign: "center"
  }
});
