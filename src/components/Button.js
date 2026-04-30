import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme";

export default function Button({ title, onPress, variant = "primary", disabled = false, style }) {
  const secondary = variant === "secondary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        secondary ? styles.secondary : styles.primary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style
      ]}
    >
      <Text style={[styles.text, secondary ? styles.secondaryText : styles.primaryText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 16,
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: 16
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderWidth: 1
  },
  disabled: {
    opacity: 0.55
  },
  pressed: {
    transform: [{ scale: 0.98 }]
  },
  text: {
    fontSize: 16,
    fontWeight: "900"
  },
  primaryText: {
    color: "#fff"
  },
  secondaryText: {
    color: colors.text
  }
});
