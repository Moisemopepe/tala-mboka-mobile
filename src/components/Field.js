import { StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

export default function Field({ label, error, icon, multiline = false, right, ...props }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, multiline && styles.multilineWrap, error && styles.errorBorder]}>
        {icon ? <Ionicons name={icon} size={20} color="#94a3b8" style={styles.icon} /> : null}
        <TextInput
          placeholderTextColor="#94a3b8"
          multiline={multiline}
          style={[styles.input, multiline && styles.multiline]}
          {...props}
        />
        {right}
      </View>
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
  inputWrap: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 54,
    paddingHorizontal: 14
  },
  multilineWrap: {
    alignItems: "flex-start",
    minHeight: 110,
    paddingTop: 12
  },
  icon: {
    marginRight: 9,
    marginTop: 1
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    minHeight: 48,
    padding: 0
  },
  multiline: {
    minHeight: 96,
    paddingTop: 0,
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
