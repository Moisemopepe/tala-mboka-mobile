import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";
import Screen from "../components/Screen";
import BrandHeader from "../components/BrandHeader";
import Button from "../components/Button";
import Card from "../components/Card";
import Field from "../components/Field";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { colors } from "../theme";
import { categories } from "../utils/categories";
import { defaultLocation, provinces } from "../utils/locations";

const roles = [
  { key: "concerned", label: "Je suis concerné" },
  { key: "witness", label: "Je suis témoin" },
  { key: "anonymous", label: "Je préfère rester anonyme" }
];

const initialForm = {
  category: "",
  role: "",
  title: "",
  description: "",
  province: defaultLocation.province,
  commune: defaultLocation.commune,
  lat: defaultLocation.lat,
  lng: defaultLocation.lng,
  image: null
};

export default function ReportScreen() {
  const { token, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(() => {
    if (step === 1) return "Que voulez-vous signaler ?";
    if (step === 2) return "Quel est votre rôle ?";
    if (step === 3) return "Ajoutez une photo si possible.";
    if (step === 4) return "Détails du problème";
    return "Localisation";
  }, [step]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function selectCategory(category) {
    update("category", category);
    setTimeout(() => setStep(2), 120);
  }

  function selectRole(role) {
    update("role", role);
    setTimeout(() => setStep(3), 120);
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Autorisez la caméra pour prendre une photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.75 });
    if (!result.canceled) update("image", result.assets[0]);
  }

  async function choosePhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.75 });
    if (!result.canceled) update("image", result.assets[0]);
  }

  async function useCurrentLocation() {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      setError("Autorisez la localisation ou gardez la position par défaut.");
      return;
    }
    const current = await Location.getCurrentPositionAsync({});
    update("lat", current.coords.latitude);
    update("lng", current.coords.longitude);
    setError("");
  }

  function validateDetails() {
    if (form.title.trim().length < 3) return "Ajoutez un titre clair.";
    if (form.description.trim().length < 10) return "Décrivez le problème en quelques mots.";
    return "";
  }

  async function submit() {
    const detailsError = validateDetails();
    if (detailsError) {
      setStep(4);
      setError(detailsError);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const body = new FormData();
      body.append("title", form.title.trim());
      body.append("description", form.description.trim());
      body.append("category", form.category);
      body.append("province", form.province);
      body.append("commune", form.commune);
      body.append("lat", String(form.lat));
      body.append("lng", String(form.lng));
      body.append("address", `${form.province}, ${form.commune}`);
      if (form.image) {
        body.append("images", {
          uri: form.image.uri,
          name: form.image.fileName || "signalement.jpg",
          type: form.image.mimeType || "image/jpeg"
        });
      }

      await api(isAuthenticated ? "/reports" : "/reports/guest", { method: "POST", body }, token);
      setSuccess(true);
      setForm(initialForm);
      setStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <Screen>
        <Card style={styles.successCard}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Alerte envoyée !</Text>
          <Text style={styles.muted}>
            {isAuthenticated ? "Votre alerte est publiée immédiatement." : "Votre signalement est en attente de validation."}
          </Text>
          <Button title="Nouvelle alerte" onPress={() => setSuccess(false)} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <BrandHeader
        eyebrow="Nouveau signalement"
        title={title}
        subtitle={isAuthenticated ? "Votre alerte sera publiée immédiatement." : "Votre alerte sera vérifiée avant publication."}
      />
      <View style={styles.progress}>
        {[1, 2, 3, 4, 5].map((item) => <View key={item} style={[styles.progressItem, item <= step && styles.progressActive]} />)}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {step === 1 ? (
        <View style={styles.grid}>
          {categories.map((category) => (
            <Pressable key={category.key} onPress={() => selectCategory(category.key)} style={styles.choice}>
              <Text style={styles.choiceIcon}>{category.icon}</Text>
              <Text style={styles.choiceText}>{category.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {step === 2 ? (
        <Card style={styles.stack}>
          {roles.map((role) => (
            <Pressable key={role.key} onPress={() => selectRole(role.key)} style={styles.role}>
              <Text style={styles.choiceText}>{role.label}</Text>
            </Pressable>
          ))}
          <Text style={styles.muted}>La suite s’ouvre automatiquement après votre choix.</Text>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card style={styles.stack}>
          {form.image ? <Image source={{ uri: form.image.uri }} style={styles.preview} /> : null}
          <Button title="Prendre une photo" onPress={takePhoto} />
          <Button title="Choisir une image" variant="secondary" onPress={choosePhoto} />
          <Button title="Continuer sans image" variant="secondary" onPress={() => setStep(4)} />
        </Card>
      ) : null}

      {step === 4 ? (
        <Card style={styles.stack}>
          <Field label="Titre" placeholder="Ex. Route abîmée" value={form.title} onChangeText={(value) => update("title", value)} />
          <Field
            label="Description"
            placeholder="Expliquez brièvement la situation."
            multiline
            value={form.description}
            onChangeText={(value) => update("description", value)}
          />
          <Button title="Continuer" onPress={() => {
            const detailsError = validateDetails();
            if (detailsError) setError(detailsError);
            else {
              setError("");
              setStep(5);
            }
          }} />
        </Card>
      ) : null}

      {step === 5 ? (
        <Card style={styles.stack}>
          <Text style={styles.sectionTitle}>Position du signalement</Text>
          <Text style={styles.muted}>{form.province} / {form.commune}</Text>
          <Text style={styles.muted}>{Number(form.lat).toFixed(4)}, {Number(form.lng).toFixed(4)}</Text>
          <Button title="Utiliser ma position" variant="secondary" onPress={useCurrentLocation} />
          <Button title={submitting ? "Envoi en cours..." : "Envoyer le signalement"} disabled={submitting} onPress={submit} />
        </Card>
      ) : null}

      {step > 1 ? (
        <Button title="Précédent" variant="secondary" onPress={() => setStep((current) => Math.max(1, current - 1))} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: {
    flexDirection: "row",
    gap: 8
  },
  progressItem: {
    backgroundColor: "#dbe4ef",
    borderRadius: 99,
    flex: 1,
    height: 8
  },
  progressActive: {
    backgroundColor: colors.primary
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  choice: {
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
    minHeight: 140,
    padding: 18,
    width: "48%"
  },
  choiceIcon: {
    fontSize: 30
  },
  choiceText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  stack: {
    gap: 14
  },
  role: {
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16
  },
  preview: {
    borderRadius: 18,
    height: 220,
    width: "100%"
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900"
  },
  muted: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22
  },
  error: {
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    color: colors.danger,
    fontWeight: "800",
    padding: 12
  },
  successCard: {
    alignItems: "center",
    gap: 14,
    marginTop: 120,
    padding: 24
  },
  successIcon: {
    backgroundColor: "#dcfce7",
    borderRadius: 40,
    color: colors.primary,
    fontSize: 34,
    fontWeight: "900",
    height: 72,
    lineHeight: 72,
    textAlign: "center",
    width: 72
  },
  successTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900"
  }
});
