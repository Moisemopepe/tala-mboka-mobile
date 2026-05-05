import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "../components/Screen";
import BrandHeader from "../components/BrandHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import { APP_VERSION } from "../config";
import { colors } from "../theme";

export default function AboutScreen({ navigation }) {
  return (
    <Screen>
      <BrandHeader
        eyebrow="À propos"
        title="Une application pour agir vite"
        subtitle="Tala Mboka aide les citoyens à signaler les problèmes de leur quartier."
      />
      <Card style={styles.stack}>
        <Text style={styles.paragraph}>
          Signalez une route abîmée, une coupure d'eau, un problème d'électricité, l'insalubrité ou une situation d'insécurité.
        </Text>
        <Text style={styles.paragraph}>
          Chaque alerte devient visible, localisée et plus facile à suivre par la communauté.
        </Text>
      </Card>
      <Card style={styles.stack}>
        <Text style={styles.title}>Ce que vous pouvez faire</Text>
        <Feature icon="flash-outline" text="Créer une alerte en quelques secondes" />
        <Feature icon="map-outline" text="Voir les problèmes autour de vous" />
        <Feature icon="notifications-outline" text="Recevoir les mises à jour importantes" />
        <Feature icon="people-outline" text="Soutenir les alertes de la communauté" />
      </Card>
      <Card style={styles.stack}>
        <Text style={styles.title}>Application</Text>
        <Text style={styles.paragraph}>Développée pour encourager la participation citoyenne en RDC.</Text>
        <Text style={styles.version}>Version {APP_VERSION}</Text>
      </Card>
      <Button title="Signaler maintenant" onPress={() => navigation.navigate("Signaler")} />
    </Screen>
  );
}

function Feature({ icon, text }) {
  return (
    <View style={styles.feature}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.item}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12
  },
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900"
  },
  paragraph: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 24
  },
  feature: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  item: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 22
  },
  version: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900"
  }
});
