import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import Screen from "../components/Screen";
import BrandHeader from "../components/BrandHeader";
import Button from "../components/Button";
import Card from "../components/Card";
import Field from "../components/Field";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { colors } from "../theme";
import { categories, categoryByKey } from "../utils/categories";
import { defaultLocation, provinces } from "../utils/locations";

const roles = [
  { key: "concerned", label: "Je suis concerné", icon: "person-outline" },
  { key: "witness", label: "Je suis témoin", icon: "eye-outline" },
  { key: "anonymous", label: "Rester anonyme", icon: "lock-closed-outline" }
];

const initialForm = {
  category: "",
  role: "concerned",
  title: "",
  description: "",
  province: defaultLocation.province,
  commune: defaultLocation.commune,
  lat: defaultLocation.lat,
  lng: defaultLocation.lng,
  image: null
};

export default function ReportScreen({ navigation }) {
  const { token, isAuthenticated } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedCategory = useMemo(() => categoryByKey(form.category), [form.category]);
  const provinceNames = Object.keys(provinces);
  const communeOptions = provinces[form.province] || [];

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setApiError("");
  }

  function validate() {
    const nextErrors = {};
    if (!form.category) nextErrors.category = "Choisissez une catégorie.";
    if (!form.title.trim() || form.title.trim().length < 3) nextErrors.title = "Le titre doit contenir au moins 3 caractères.";
    if (!form.description.trim() || form.description.trim().length < 10) nextErrors.description = "La description doit contenir au moins 10 caractères.";
    if (!form.province) nextErrors.province = "Choisissez une province.";
    if (!form.commune) nextErrors.commune = "Choisissez une commune ou un territoire.";
    if (!form.lat || !form.lng) nextErrors.location = "La position GPS est obligatoire.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function choosePhoto(source) {
    const options = { mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.65 };
    let result;
    if (source === "camera") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setApiError("Autorisez la caméra pour prendre une photo.");
        return;
      }
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }
    if (!result.canceled) update("image", result.assets[0]);
  }

  async function useCurrentLocation() {
    setApiError("");
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      setApiError("Autorisez la localisation pour remplir la position.");
      return;
    }
    const current = await Location.getCurrentPositionAsync({});
    update("lat", current.coords.latitude);
    update("lng", current.coords.longitude);
  }

  async function submit() {
    if (submitting || !validate()) return;
    setSubmitting(true);
    setApiError("");
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
      body.append("reporterRole", form.role);

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
      setErrors({});
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <Screen>
        <Card style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={34} color={colors.primary} />
          </View>
          <Text style={styles.successTitle}>{isAuthenticated ? "Alerte publiée" : "Alerte envoyée"}</Text>
          <Text style={styles.muted}>
            {isAuthenticated ? "Votre alerte est visible dans le fil citoyen." : "Votre alerte sera validée avant publication."}
          </Text>
          <View style={styles.row}>
            <Button title="Voir les alertes" onPress={() => navigation.navigate("Fil")} style={styles.rowButton} />
            <Button title="Nouvelle alerte" variant="secondary" onPress={() => setSuccess(false)} style={styles.rowButton} />
          </View>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <BrandHeader
        eyebrow="Signalement"
        title="Créer une alerte"
        subtitle={isAuthenticated ? "Votre alerte sera publiée immédiatement." : "Votre alerte sera vérifiée avant publication."}
      />

      {apiError ? <Text style={styles.error}>{apiError}</Text> : null}

      <Card style={styles.stack}>
        <Text style={styles.sectionTitle}>Type de problème</Text>
        <View style={styles.grid}>
          {categories.map((category) => (
            <Pressable
              key={category.key}
              onPress={() => update("category", category.key)}
              style={[styles.categoryCard, form.category === category.key && { borderColor: category.color, backgroundColor: `${category.color}12` }]}
            >
              <Ionicons name={category.icon} size={25} color={category.color} />
              <Text style={styles.categoryText}>{category.label}</Text>
            </Pressable>
          ))}
        </View>
        {errors.category ? <Text style={styles.fieldError}>{errors.category}</Text> : null}
      </Card>

      <Card style={styles.stack}>
        <Text style={styles.sectionTitle}>Détails</Text>
        <Field
          label="Titre"
          icon={selectedCategory.icon}
          placeholder="Ex. Route abîmée"
          value={form.title}
          onChangeText={(value) => update("title", value)}
          error={errors.title}
        />
        <Field
          label="Description"
          icon="document-text-outline"
          placeholder="Expliquez clairement la situation."
          multiline
          value={form.description}
          onChangeText={(value) => update("description", value)}
          error={errors.description}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {roles.map((role) => (
            <Chip key={role.key} icon={role.icon} label={role.label} active={form.role === role.key} onPress={() => update("role", role.key)} />
          ))}
        </ScrollView>
      </Card>

      <Card style={styles.stack}>
        <Text style={styles.sectionTitle}>Image</Text>
        {form.image ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: form.image.uri }} style={styles.preview} resizeMode="cover" />
            <Pressable style={styles.removeImage} onPress={() => update("image", null)}>
              <Ionicons name="close" size={18} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyImage}>
            <Ionicons name="image-outline" size={34} color={colors.muted} />
            <Text style={styles.muted}>Photo optionnelle, utile pour mieux comprendre le problème.</Text>
          </View>
        )}
        <View style={styles.row}>
          <Button title="Caméra" variant="secondary" onPress={() => choosePhoto("camera")} style={styles.rowButton} />
          <Button title="Galerie" variant="secondary" onPress={() => choosePhoto("library")} style={styles.rowButton} />
        </View>
      </Card>

      <Card style={styles.stack}>
        <Text style={styles.sectionTitle}>Localisation</Text>
        <Text style={styles.muted}>Choisissez la province, puis la commune. Utilisez le GPS si vous êtes sur place.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {provinceNames.map((province) => (
            <Chip
              key={province}
              label={province}
              active={form.province === province}
              onPress={() => setForm((current) => ({
                ...current,
                province,
                commune: provinces[province]?.[0] || ""
              }))}
            />
          ))}
        </ScrollView>
        {errors.province ? <Text style={styles.fieldError}>{errors.province}</Text> : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {communeOptions.map((commune) => (
            <Chip key={commune} label={commune} active={form.commune === commune} onPress={() => update("commune", commune)} />
          ))}
        </ScrollView>
        {errors.commune ? <Text style={styles.fieldError}>{errors.commune}</Text> : null}
        <View style={styles.locationBox}>
          <Ionicons name="location-outline" size={20} color={colors.primary} />
          <Text style={styles.locationText}>{form.province}, {form.commune}</Text>
        </View>
        <Text style={styles.coords}>{Number(form.lat).toFixed(5)}, {Number(form.lng).toFixed(5)}</Text>
        {errors.location ? <Text style={styles.fieldError}>{errors.location}</Text> : null}
        <Button title="Utiliser ma position" variant="secondary" onPress={useCurrentLocation} />
      </Card>

      <Button title={submitting ? "Envoi en cours..." : "Envoyer l'alerte"} disabled={submitting} onPress={submit} />
    </Screen>
  );
}

function Chip({ label, icon, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}>
      {icon ? <Ionicons name={icon} size={16} color={active ? colors.primary : colors.muted} /> : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  categoryCard: {
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    minHeight: 112,
    padding: 14,
    width: "47.8%"
  },
  categoryText: {
    color: colors.text,
    fontWeight: "900"
  },
  chips: {
    gap: 9,
    paddingRight: 16
  },
  chip: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 12,
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
  previewWrap: {
    position: "relative"
  },
  preview: {
    borderRadius: 18,
    height: 210,
    width: "100%"
  },
  removeImage: {
    alignItems: "center",
    backgroundColor: colors.danger,
    borderRadius: 99,
    height: 34,
    justifyContent: "center",
    position: "absolute",
    right: 10,
    top: 10,
    width: 34
  },
  emptyImage: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    gap: 8,
    padding: 20
  },
  row: {
    flexDirection: "row",
    gap: 10
  },
  rowButton: {
    flex: 1
  },
  locationBox: {
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderRadius: 16,
    flexDirection: "row",
    gap: 9,
    padding: 14
  },
  locationText: {
    color: colors.text,
    flex: 1,
    fontWeight: "900"
  },
  coords: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
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
  fieldError: {
    color: colors.danger,
    fontWeight: "800"
  },
  successCard: {
    alignItems: "center",
    gap: 14,
    marginTop: 80,
    padding: 22
  },
  successIcon: {
    alignItems: "center",
    backgroundColor: "#dcfce7",
    borderRadius: 40,
    height: 72,
    justifyContent: "center",
    width: 72
  },
  successTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900"
  }
});
