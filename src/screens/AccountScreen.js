import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import Screen from "../components/Screen";
import BrandHeader from "../components/BrandHeader";
import Button from "../components/Button";
import Card from "../components/Card";
import Field from "../components/Field";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

export default function AccountScreen() {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      if (mode === "login") await login(phone.trim(), password);
      else await register(name.trim(), phone.trim(), password);
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (isAuthenticated) {
    return (
      <Screen>
        <BrandHeader eyebrow="Compte" title={user?.name || "Utilisateur"} subtitle={user?.phone || "Compte actif"} />
        <Card style={styles.profile}>
          <Text style={styles.avatar}>{(user?.name || "U").slice(0, 1).toUpperCase()}</Text>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.muted}>{user?.phone}</Text>
          <Text style={styles.badge}>Utilisateur actif</Text>
        </Card>
        <Button title="Déconnexion" variant="secondary" onPress={logout} />
      </Screen>
    );
  }

  return (
    <Screen>
      <BrandHeader
        eyebrow="Compte"
        title="Rejoignez Tala Mboka"
        subtitle="Connectez-vous pour publier immédiatement et suivre vos alertes."
      />
      <Card style={styles.stack}>
        <View style={styles.switcher}>
          <Button title="Connexion" onPress={() => setMode("login")} variant={mode === "login" ? "primary" : "secondary"} style={styles.switchButton} />
          <Button title="Inscription" onPress={() => setMode("register")} variant={mode === "register" ? "primary" : "secondary"} style={styles.switchButton} />
        </View>
        {mode === "register" ? <Field label="Nom" value={name} onChangeText={setName} placeholder="Votre nom" /> : null}
        <Field label="Téléphone" value={phone} onChangeText={setPhone} placeholder="Téléphone" keyboardType="phone-pad" />
        <Field label="Mot de passe" value={password} onChangeText={setPassword} placeholder="Mot de passe" secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title={loading ? "Patientez..." : mode === "login" ? "Se connecter" : "Créer un compte"} disabled={loading} onPress={submit} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14
  },
  switcher: {
    flexDirection: "row",
    gap: 10
  },
  switchButton: {
    flex: 1
  },
  error: {
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    color: colors.danger,
    fontWeight: "800",
    padding: 12
  },
  profile: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 28
  },
  avatar: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    height: 76,
    lineHeight: 76,
    textAlign: "center",
    width: 76
  },
  name: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900"
  },
  muted: {
    color: colors.muted,
    fontWeight: "800"
  },
  badge: {
    backgroundColor: "#dcfce7",
    borderRadius: 99,
    color: colors.primary,
    fontWeight: "900",
    paddingHorizontal: 14,
    paddingVertical: 8
  }
});
