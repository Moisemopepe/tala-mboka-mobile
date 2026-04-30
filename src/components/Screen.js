import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, View } from "react-native";
import { colors, spacing } from "../theme";

export default function Screen({ children, scroll = true, refreshControl }) {
  const content = <View style={styles.content}>{children}</View>;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
          contentContainerStyle={styles.scroll}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 24
  },
  content: {
    flex: 1,
    gap: 16,
    padding: spacing.screen
  }
});
