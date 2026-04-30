import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export default function BrandHeader({ eyebrow, title, subtitle }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.brand}>
        <Image source={require("../../assets/icon.png")} style={styles.logo} />
        <View>
          <Text style={styles.name}>TALA MBOKA</Text>
          <Text style={styles.tagline}>Signaler pour changer</Text>
        </View>
      </View>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10
  },
  brand: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  logo: {
    height: 44,
    width: 44,
    borderRadius: 12
  },
  name: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "900"
  },
  tagline: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 3,
    marginTop: 8,
    textTransform: "uppercase"
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 23
  }
});
