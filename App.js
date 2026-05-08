import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import ReportScreen from "./src/screens/ReportScreen";
import { colors } from "./src/theme";

function LogoMark() {
  return (
    <View style={styles.logoWrap}>
      <View style={styles.mapDots} />
      <View style={styles.pin}>
        <View style={styles.pinCenter} />
      </View>
      <View style={styles.signalA} />
      <View style={styles.signalB} />
      <View style={styles.ring} />
    </View>
  );
}

const homeLanguages = [
  { key: "en", label: "English" },
  { key: "fr", label: "Français" },
  { key: "es", label: "Español" },
  { key: "ar", label: "العربية" },
  { key: "zh", label: "中文" },
  { key: "ru", label: "Русский" }
];

const homeCopy = {
  en: {
    title: "Report incidents",
    accent: "instantly",
    subtitle: "Your report helps communities and responders act faster.",
    report: "Report incident",
    offline: "Works offline",
    noAccount: "No account required"
  },
  fr: {
    title: "Signalez les incidents",
    accent: "rapidement",
    subtitle: "Votre signalement aide les communautés et les équipes à agir plus vite.",
    report: "Signaler un incident",
    offline: "Fonctionne hors ligne",
    noAccount: "Aucun compte requis"
  },
  es: {
    title: "Reporta incidentes",
    accent: "al instante",
    subtitle: "Tu reporte ayuda a la comunidad y a los equipos a actuar más rápido.",
    report: "Reportar incidente",
    offline: "Funciona sin conexión",
    noAccount: "Sin cuenta requerida"
  },
  ar: {
    title: "أبلغ عن الحوادث",
    accent: "فورا",
    subtitle: "يساعد بلاغك المجتمعات وفرق الاستجابة على التحرك بسرعة.",
    report: "إبلاغ عن حادث",
    offline: "يعمل دون اتصال",
    noAccount: "لا يتطلب حسابا"
  },
  zh: {
    title: "报告事件",
    accent: "即时",
    subtitle: "你的报告帮助社区和响应人员更快行动。",
    report: "报告事件",
    offline: "支持离线",
    noAccount: "无需账户"
  },
  ru: {
    title: "Сообщайте об инцидентах",
    accent: "быстро",
    subtitle: "Ваше сообщение помогает сообществам и службам реагировать быстрее.",
    report: "Сообщить об инциденте",
    offline: "Работает офлайн",
    noAccount: "Аккаунт не нужен"
  }
};

function MobileHome({ language, onLanguageChange, onReport }) {
  const copy = homeCopy[language] || homeCopy.en;

  return (
    <SafeAreaView style={styles.home}>
      <StatusBar style="dark" />
      <View style={styles.hero}>
        <LogoMark />
        <View style={styles.brandBlock}>
          <Text style={styles.brandMain}>TALA MBOKA</Text>
          <Text style={styles.brandAccent}>CRISIS</Text>
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.titleAccent}>{copy.accent}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>

        <View style={styles.languageRow}>
          {homeLanguages.map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              onPress={() => onLanguageChange(item.key)}
              style={[styles.languageChip, language === item.key && styles.languageChipActive]}
            >
              <Text style={[styles.languageText, language === item.key && styles.languageTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable accessibilityRole="button" onPress={onReport} style={({ pressed }) => [styles.reportButton, pressed && styles.pressed]}>
          <Ionicons name="add" size={72} color="#fff" />
        </Pressable>
        <Text style={styles.reportLabel}>{copy.report}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="cloud-offline-outline" size={16} color={colors.muted} />
          <Text style={styles.footerText}>{copy.offline}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.footerItem}>
          <Ionicons name="lock-closed-outline" size={16} color={colors.muted} />
          <Text style={styles.footerText}>{copy.noAccount}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function AppShell() {
  const [showReport, setShowReport] = useState(false);
  const [language, setLanguage] = useState("fr");
  const navigation = { navigate: () => setShowReport(false), goBack: () => setShowReport(false) };

  if (showReport) {
    return <ReportScreen navigation={navigation} initialLanguage={language} />;
  }

  return <MobileHome language={language} onLanguageChange={setLanguage} onReport={() => setShowReport(true)} />;
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
    backgroundColor: "#fff",
    justifyContent: "space-between",
    paddingHorizontal: 28
  },
  hero: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingBottom: 24
  },
  logoWrap: {
    alignItems: "center",
    height: 150,
    justifyContent: "center",
    marginBottom: 10,
    width: 230
  },
  mapDots: {
    backgroundColor: "#eef3f9",
    borderRadius: 80,
    height: 74,
    opacity: 0.9,
    position: "absolute",
    top: 36,
    width: 230
  },
  pin: {
    alignItems: "center",
    backgroundColor: "#08245c",
    borderRadius: 44,
    height: 72,
    justifyContent: "center",
    transform: [{ rotate: "45deg" }],
    width: 72
  },
  pinCenter: {
    backgroundColor: "#fff",
    borderColor: colors.primary,
    borderRadius: 15,
    borderWidth: 8,
    height: 30,
    width: 30
  },
  signalA: {
    borderRightColor: "#ef4444",
    borderRightWidth: 7,
    borderTopColor: "#ef4444",
    borderTopWidth: 7,
    borderTopRightRadius: 28,
    height: 34,
    position: "absolute",
    right: 72,
    top: 34,
    transform: [{ rotate: "8deg" }],
    width: 34
  },
  signalB: {
    borderRightColor: "#ef4444",
    borderRightWidth: 7,
    borderTopColor: "#ef4444",
    borderTopWidth: 7,
    borderTopRightRadius: 42,
    height: 52,
    position: "absolute",
    right: 56,
    top: 22,
    transform: [{ rotate: "8deg" }],
    width: 52
  },
  ring: {
    borderColor: colors.primary,
    borderRadius: 50,
    borderWidth: 4,
    bottom: 24,
    height: 22,
    position: "absolute",
    width: 92
  },
  brandBlock: {
    alignItems: "center",
    marginBottom: 42
  },
  brandMain: {
    color: "#071a4f",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0
  },
  brandAccent: {
    color: colors.primary,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 2
  },
  copy: {
    alignItems: "center",
    marginBottom: 34
  },
  title: {
    color: "#071a4f",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
    textAlign: "center"
  },
  titleAccent: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
    textAlign: "center"
  },
  subtitle: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    marginTop: 18,
    maxWidth: 260,
    textAlign: "center"
  },
  languageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 24,
    maxWidth: 310
  },
  languageChip: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  languageChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  languageText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900"
  },
  languageTextActive: {
    color: "#fff"
  },
  reportButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 999,
    elevation: 14,
    height: 128,
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.32,
    shadowRadius: 24,
    width: 128
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }]
  },
  reportLabel: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 16
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 30
  },
  footerItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7
  },
  footerText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  divider: {
    backgroundColor: colors.border,
    height: 16,
    marginHorizontal: 14,
    width: 1
  }
});
