import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme";

export default function Field({ label, error, multiline = false, ...props }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#94a3b8"
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, error && styles.errorBorder]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 7
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  input: {
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 14
  },
  multiline: {
    minHeight: 110,
    paddingTop: 14,
    textAlignVertical: "top"
  },
  errorBorder: {
    borderColor: colors.danger
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "700"
  }
});
