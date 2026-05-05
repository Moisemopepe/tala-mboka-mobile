import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validation = useMemo(() => {
    const next = {};
    if (mode === "register" && name.trim().length < 2) next.name = "Entrez votre nom complet.";
    if (!/^[0-9+ ]{8,15}$/.test(phone.trim())) next.phone = "Entrez un numéro de téléphone valide.";
    if (password.length < 6) next.password = "Le mot de passe doit contenir au moins 6 caractères.";
    if (mode === "register" && password !== confirmPassword) next.confirmPassword = "Les mots de passe ne correspondent pas.";
    return next;
  }, [confirmPassword, mode, name, password, phone]);

  async function submit() {
    if (loading || Object.keys(validation).length > 0) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (mode === "login") {
        await login(phone.trim(), password);
        setSuccess("Connexion réussie.");
      } else {
        await register(name.trim(), phone.trim(), password);
        setSuccess("Compte créé avec succès.");
      }
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (isAuthenticated) {
    return (
      <Screen>
        <BrandHeader eyebrow="Compte" title="Profil citoyen" subtitle="Suivez vos alertes et votre activité." />
        <Card style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || "U").slice(0, 1).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user?.name || "Utilisateur"}</Text>
          <Text style={styles.muted}>{user?.phone || "Téléphone non renseigné"}</Text>
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
            <Text style={styles.badgeText}>Utilisateur actif</Text>
          </View>
        </Card>
        <Card style={styles.stats}>
          <Stat label="Alertes" value="0" />
          <Stat label="Validées" value="0" />
          <Stat label="En attente" value="0" />
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
        subtitle="Publiez, suivez et soutenez les alertes de votre quartier."
      />
      <Card style={styles.stack}>
        <View style={styles.switcher}>
          <Tab label="Connexion" active={mode === "login"} onPress={() => setMode("login")} />
          <Tab label="Inscription" active={mode === "register"} onPress={() => setMode("register")} />
        </View>

        {mode === "register" ? (
          <Field label="Nom complet" icon="person-outline" value={name} onChangeText={setName} placeholder="Votre nom" error={name ? validation.name : ""} />
        ) : null}
        <Field
          label="Téléphone"
          icon="call-outline"
          value={phone}
          onChangeText={setPhone}
          placeholder="Ex. 0850767267"
          keyboardType="phone-pad"
          error={phone ? validation.phone : ""}
        />
        <Field
          label="Mot de passe"
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          placeholder="6 caractères minimum"
          secureTextEntry={!showPassword}
          error={password ? validation.password : ""}
          right={
            <Pressable onPress={() => setShowPassword((current) => !current)} style={styles.eyeButton}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={21} color={colors.muted} />
            </Pressable>
          }
        />
        {mode === "register" ? (
          <Field
            label="Confirmer le mot de passe"
            icon="shield-checkmark-outline"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Répétez le mot de passe"
            secureTextEntry={!showPassword}
            error={confirmPassword ? validation.confirmPassword : ""}
          />
        ) : null}

        {mode === "login" ? <Text style={styles.forgot}>Mot de passe oublié</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}
        <Button
          title={loading ? (mode === "login" ? "Connexion..." : "Création en cours...") : mode === "login" ? "Se connecter" : "Créer mon compte"}
          disabled={loading || Object.keys(validation).length > 0}
          onPress={submit}
        />
      </Card>
    </Screen>
  );
}

function Tab({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14
  },
  switcher: {
    backgroundColor: "#eef2f7",
    borderRadius: 16,
    flexDirection: "row",
    padding: 4
  },
  tab: {
    alignItems: "center",
    borderRadius: 13,
    flex: 1,
    paddingVertical: 13
  },
  tabActive: {
    backgroundColor: colors.primary
  },
  tabText: {
    color: colors.muted,
    fontWeight: "900"
  },
  tabTextActive: {
    color: "#fff"
  },
  eyeButton: {
    paddingLeft: 10,
    paddingVertical: 8
  },
  forgot: {
    color: colors.primary,
    fontWeight: "900"
  },
  error: {
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    color: colors.danger,
    fontWeight: "800",
    padding: 12
  },
  success: {
    backgroundColor: "#ecfdf5",
    borderRadius: 14,
    color: colors.primary,
    fontWeight: "800",
    padding: 12
  },
  profile: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 28
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 28,
    height: 82,
    justifyContent: "center",
    width: 82
  },
  avatarText: {
    color: "#fff",
    fontSize: 31,
    fontWeight: "900"
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
    alignItems: "center",
    backgroundColor: "#dcfce7",
    borderRadius: 99,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  badgeText: {
    color: colors.primary,
    fontWeight: "900"
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  stat: {
    alignItems: "center",
    flex: 1,
    gap: 4
  },
  statValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900"
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  }
});
