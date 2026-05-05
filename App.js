import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import ReportScreen from "./src/screens/ReportScreen";
import { colors } from "./src/theme";

function MobileHome({ onReport }) {
  return (
    <SafeAreaView style={styles.home}>
      <StatusBar style="dark" />
      <ImageBackground source={require("./assets/splash-icon.png")} resizeMode="contain" style={styles.background} imageStyle={styles.backgroundImage}>
        <View style={styles.header}>
          <Text style={styles.brand}>Tala Mboka Crisis</Text>
          <Text style={styles.subtitle}>Community-powered crisis mapping for rapid response.</Text>
        </View>

        <Pressable onPress={onReport} style={({ pressed }) => [styles.reportButton, pressed && styles.pressed]}>
          <Ionicons name="alert-circle" size={42} color={colors.primary} />
          <Text style={styles.reportText}>Je signale</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Application citoyenne</Text>
          <Text style={styles.footerText}>Les signalements envoyes ici arrivent directement sur la plateforme web Tala Mboka Crisis.</Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

function AppShell() {
  const [showReport, setShowReport] = useState(false);
  const navigation = { navigate: () => setShowReport(false), goBack: () => setShowReport(false) };

  if (showReport) {
    return <ReportScreen navigation={navigation} />;
  }

  return <MobileHome onReport={() => setShowReport(true)} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  home: {
    flex: 1,
    backgroundColor: "#fff"
  },
  background: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 34
  },
  backgroundImage: {
    opacity: 0.06,
    transform: [{ scale: 2.8 }]
  },
  header: {
    alignItems: "center",
    gap: 12,
    paddingTop: 24
  },
  brand: {
    color: "#0b1f5f",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center"
  },
  subtitle: {
    color: "#0b1f5f",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 24,
    maxWidth: 320,
    textAlign: "center"
  },
  reportButton: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#eef2f7",
    borderRadius: 999,
    borderWidth: 1,
    elevation: 8,
    gap: 10,
    height: 240,
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
    width: 240
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  },
  reportText: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "900"
  },
  footer: {
    alignItems: "center",
    gap: 10,
    paddingBottom: 10
  },
  footerTitle: {
    color: "#0b1f5f",
    fontSize: 18,
    fontWeight: "900"
  },
  footerText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
    maxWidth: 320,
    textAlign: "center"
  }
});
