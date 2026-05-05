import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BrandHeader from "../components/BrandHeader";
import Button from "../components/Button";
import Card from "../components/Card";
import Field from "../components/Field";
import Screen from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { listOfflineReports, saveOfflineReport, syncOfflineReports } from "../services/offlineQueue";
import { colors } from "../theme";
import { categories, categoryByKey, crisisTypes, damageLevels } from "../utils/categories";
import { defaultLocation, provinces } from "../utils/locations";

const initialForm = {
  category: "residential",
  crisisType: "flood",
  damageLevel: "partial",
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
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  const selectedCategory = useMemo(() => categoryByKey(form.category), [form.category]);
  const provinceNames = Object.keys(provinces);
  const communeOptions = provinces[form.province] || [];

  useEffect(() => {
    refreshOfflineCount();
  }, []);

  async function refreshOfflineCount() {
    const items = await listOfflineReports().catch(() => []);
    setOfflineCount(items.length);
  }

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setApiError("");
  }

  function validate(payload = form) {
    const nextErrors = {};
    if (!payload.category) nextErrors.category = "Choose infrastructure.";
    if (!payload.crisisType) nextErrors.crisisType = "Choose crisis type.";
    if (!payload.damageLevel) nextErrors.damageLevel = "Choose damage level.";
    if (!payload.title.trim() || payload.title.trim().length < 3) nextErrors.title = "Add a short title.";
    if (!payload.description.trim() || payload.description.trim().length < 10) nextErrors.description = "Add at least 10 characters.";
    if (!payload.lat || !payload.lng) nextErrors.location = "GPS location is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function choosePhoto(source) {
    const options = { mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.45 };
    let result;
    if (source === "camera") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setApiError("Camera permission is required.");
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
      setApiError("Location permission is required.");
      return;
    }
    const current = await Location.getCurrentPositionAsync({});
    update("lat", current.coords.latitude);
    update("lng", current.coords.longitude);
  }

  function buildFormData(payload) {
    const body = new FormData();
    body.append("title", payload.title.trim());
    body.append("description", payload.description.trim());
    body.append("category", payload.category);
    body.append("infrastructureType", payload.category);
    body.append("crisisType", payload.crisisType);
    body.append("damageLevel", payload.damageLevel);
    body.append("language", "en");
    body.append("province", payload.province);
    body.append("commune", payload.commune);
    body.append("lat", String(payload.lat));
    body.append("lng", String(payload.lng));
    body.append("address", `${payload.commune}, ${payload.province}`);
    if (payload.image) {
      body.append("images", {
        uri: payload.image.uri,
        name: payload.image.fileName || "tala-report.jpg",
        type: payload.image.mimeType || "image/jpeg"
      });
    }
    return body;
  }

  async function sendPayload(payload) {
    await api(isAuthenticated ? "/reports" : "/reports/guest", { method: "POST", body: buildFormData(payload) }, token);
  }

  async function submit() {
    if (submitting || !validate()) return;
    setSubmitting(true);
    setApiError("");
    try {
      await sendPayload(form);
      setSuccess("sent");
      setForm(initialForm);
    } catch {
      await saveOfflineReport(form);
      await refreshOfflineCount();
      setSuccess("offline");
      setForm(initialForm);
    } finally {
      setSubmitting(false);
    }
  }

  async function syncQueue() {
    setSubmitting(true);
    try {
      const result = await syncOfflineReports(sendPayload);
      await refreshOfflineCount();
      setSuccess(`${result.synced.length} synced, ${result.failed.length} pending`);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <BrandHeader eyebrow="Field report" title="Send report" subtitle="Capture now. If the network fails, the report stays offline and syncs later." />

      {success ? <Text style={success === "offline" ? styles.warning : styles.notice}>{success === "sent" ? "Report sent to the web platform." : success === "offline" ? "No network. Report saved offline." : success}</Text> : null}
      {apiError ? <Text style={styles.error}>{apiError}</Text> : null}
      {offlineCount > 0 ? (
        <Card style={styles.offlineCard}>
          <Text style={styles.offlineText}>{offlineCount} offline report(s) waiting</Text>
          <Button title="Sync now" variant="secondary" onPress={syncQueue} disabled={submitting} />
        </Card>
      ) : null}

      <Card style={styles.stack}>
        <Text style={styles.sectionTitle}>1. Crisis type + Damage</Text>
        <View style={styles.row}>
          <SelectChips items={crisisTypes} value={form.crisisType} onChange={(value) => update("crisisType", value)} />
        </View>
        <SelectChips items={damageLevels} value={form.damageLevel} onChange={(value) => update("damageLevel", value)} />
      </Card>

      <Card style={styles.stack}>
        <Text style={styles.sectionTitle}>Infrastructure</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {categories.map((category) => (
            <Chip key={category.key} icon={category.icon} label={category.label} active={form.category === category.key} onPress={() => update("category", category.key)} color={category.color} />
          ))}
        </ScrollView>
        <Text style={styles.muted}>Selected: {selectedCategory.label}</Text>
      </Card>

      <Card style={styles.stack}>
        <Text style={styles.sectionTitle}>2. Photo</Text>
        {form.image ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: form.image.uri }} style={styles.preview} resizeMode="cover" />
            <Pressable style={styles.removeImage} onPress={() => update("image", null)}>
              <Ionicons name="close" size={18} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyImage}>
            <Ionicons name="camera-outline" size={34} color={colors.muted} />
            <Text style={styles.muted}>Compressed before upload to save bandwidth.</Text>
          </View>
        )}
        <View style={styles.row}>
          <Button title="Take photo" variant="secondary" onPress={() => choosePhoto("camera")} style={styles.rowButton} />
          <Button title="Upload" variant="secondary" onPress={() => choosePhoto("library")} style={styles.rowButton} />
        </View>
      </Card>

      <Card style={styles.stack}>
        <Text style={styles.sectionTitle}>3. Description</Text>
        <Field label="Short title" icon={selectedCategory.icon} placeholder="Bridge partially damaged" value={form.title} onChangeText={(value) => update("title", value)} error={errors.title} />
        <Field label="Description" icon="document-text-outline" placeholder="What happened? What is damaged? Any urgent risk?" multiline value={form.description} onChangeText={(value) => update("description", value)} error={errors.description} />
      </Card>

      <Card style={styles.stack}>
        <Text style={styles.sectionTitle}>4. Location</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {provinceNames.map((province) => (
            <Chip key={province} label={province} active={form.province === province} onPress={() => setForm((current) => ({ ...current, province, commune: provinces[province]?.[0] || "" }))} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {communeOptions.map((commune) => (
            <Chip key={commune} label={commune} active={form.commune === commune} onPress={() => update("commune", commune)} />
          ))}
        </ScrollView>
        <View style={styles.locationBox}>
          <Ionicons name="location-outline" size={20} color={colors.primary} />
          <Text style={styles.locationText}>{form.province}, {form.commune}</Text>
        </View>
        <Text style={styles.coords}>{Number(form.lat).toFixed(5)}, {Number(form.lng).toFixed(5)}</Text>
        {errors.location ? <Text style={styles.fieldError}>{errors.location}</Text> : null}
        <Button title="Use GPS" variant="secondary" onPress={useCurrentLocation} />
      </Card>

      <Button title={submitting ? "Sending..." : "Send report"} disabled={submitting} onPress={submit} />
      <Button title="Back" variant="secondary" onPress={() => navigation.goBack?.()} />
    </Screen>
  );
}

function SelectChips({ items, value, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {items.map((item) => (
        <Chip key={item.key} label={item.label} active={value === item.key} onPress={() => onChange(item.key)} />
      ))}
    </ScrollView>
  );
}

function Chip({ label, icon, active, onPress, color }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}>
      {icon ? <Ionicons name={icon} size={16} color={active ? colors.primary : color || colors.muted} /> : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 14 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "900" },
  chips: { gap: 9, paddingRight: 16 },
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
  chipActive: { backgroundColor: "#ecfdf5", borderColor: "#86efac" },
  chipText: { color: colors.text, fontWeight: "900" },
  chipTextActive: { color: colors.primary },
  pressed: { opacity: 0.75 },
  previewWrap: { position: "relative" },
  preview: { borderRadius: 18, height: 210, width: "100%" },
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
  emptyImage: { alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 18, gap: 8, padding: 20 },
  row: { flexDirection: "row", gap: 10 },
  rowButton: { flex: 1 },
  offlineCard: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between" },
  offlineText: { color: colors.text, flex: 1, fontWeight: "900" },
  locationBox: { alignItems: "center", backgroundColor: "#ecfdf5", borderRadius: 16, flexDirection: "row", gap: 9, padding: 14 },
  locationText: { color: colors.text, flex: 1, fontWeight: "900" },
  coords: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  muted: { color: colors.muted, fontWeight: "700", lineHeight: 21 },
  notice: { backgroundColor: "#ecfdf5", borderRadius: 14, color: colors.primary, fontWeight: "900", padding: 12 },
  warning: { backgroundColor: "#fff7ed", borderRadius: 14, color: "#c2410c", fontWeight: "900", padding: 12 },
  error: { backgroundColor: "#fef2f2", borderRadius: 14, color: colors.danger, fontWeight: "800", padding: 12 },
  fieldError: { color: colors.danger, fontWeight: "800" }
});
