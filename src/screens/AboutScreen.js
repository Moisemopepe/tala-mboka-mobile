import { StyleSheet, Text } from "react-native";
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
        title="Votre allié pour un quartier plus visible et mieux suivi"
        subtitle="Tala Mboka donne une voix aux citoyens."
      />
      <Card style={styles.stack}>
        <Text style={styles.paragraph}>
          Tala Mboka est une plateforme citoyenne qui permet de signaler facilement les problèmes du quartier :
          routes dégradées, coupures d'électricité, insécurité, insalubrité et autres situations importantes.
        </Text>
        <Text style={styles.paragraph}>
          Chaque signalement devient visible, localisé et suivi afin d'encourager des actions concrètes pour améliorer
          les conditions de vie.
        </Text>
      </Card>
      <Card style={styles.stack}>
        <Text style={styles.title}>Pourquoi utiliser Tala Mboka ?</Text>
        <Text style={styles.item}>• Signaler un problème en quelques secondes</Text>
        <Text style={styles.item}>• Voir les incidents autour de soi</Text>
        <Text style={styles.item}>• Suivre l'évolution des situations signalées</Text>
        <Text style={styles.item}>• Contribuer à rendre son quartier plus sûr et plus propre</Text>
      </Card>
      <Card style={styles.stack}>
        <Text style={styles.title}>Développeur</Text>
        <Text style={styles.paragraph}>
          Application développée par Moïse Mopepe pour encourager la participation citoyenne.
        </Text>
        <Text style={styles.version}>Version {APP_VERSION}</Text>
      </Card>
      <Button title="Signaler maintenant" onPress={() => navigation.navigate("Signaler")} />
    </Screen>
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
  item: {
    color: colors.text,
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
