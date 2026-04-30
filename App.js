import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Text } from "react-native";
import { AuthProvider } from "./src/context/AuthContext";
import FeedScreen from "./src/screens/FeedScreen";
import ReportScreen from "./src/screens/ReportScreen";
import MapScreen from "./src/screens/MapScreen";
import AccountScreen from "./src/screens/AccountScreen";
import AboutScreen from "./src/screens/AboutScreen";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import { colors } from "./src/theme";

const Tab = createBottomTabNavigator();

const icons = {
  Fil: "≡",
  Signaler: "+",
  Carte: "⌂",
  Compte: "◉",
  Notifications: "🔔",
  "À propos": "i"
};

function TabIcon({ name, color }) {
  return <Text style={{ color, fontSize: name === "Notifications" ? 18 : 24, fontWeight: "900" }}>{icons[name]}</Text>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.muted,
              tabBarStyle: {
                height: 74,
                paddingTop: 8,
                paddingBottom: 10,
                borderTopColor: colors.border,
                backgroundColor: "#fff"
              },
              tabBarLabelStyle: { fontSize: 12, fontWeight: "800" },
              tabBarIcon: ({ color }) => <TabIcon name={route.name} color={color} />
            })}
          >
            <Tab.Screen name="Fil" component={FeedScreen} />
            <Tab.Screen name="Signaler" component={ReportScreen} />
            <Tab.Screen name="Carte" component={MapScreen} />
            <Tab.Screen name="Compte" component={AccountScreen} />
            <Tab.Screen name="Notifications" component={NotificationsScreen} />
            <Tab.Screen name="À propos" component={AboutScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
