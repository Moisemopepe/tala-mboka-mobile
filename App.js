import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import FeedScreen from "./src/screens/FeedScreen";
import ReportScreen from "./src/screens/ReportScreen";
import MapScreen from "./src/screens/MapScreen";
import AccountScreen from "./src/screens/AccountScreen";
import AboutScreen from "./src/screens/AboutScreen";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import { colors } from "./src/theme";

const Tab = createBottomTabNavigator();

const icons = {
  Fil: ["newspaper-outline", "newspaper"],
  Signaler: ["add-circle-outline", "add-circle"],
  Carte: ["map-outline", "map"],
  Compte: ["person-circle-outline", "person-circle"],
  Notifications: ["notifications-outline", "notifications"],
  "À propos": ["information-circle-outline", "information-circle"]
};

function AppTabs() {
  const { isAuthenticated } = useAuth();

  return (
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
          tabBarIcon: ({ color, focused }) => {
            const [outline, filled] = icons[route.name] || icons.Fil;
            return <Ionicons name={focused ? filled : outline} size={24} color={color} />;
          }
        })}
      >
        <Tab.Screen name="Fil" component={FeedScreen} />
        <Tab.Screen name="Signaler" component={ReportScreen} />
        <Tab.Screen name="Carte" component={MapScreen} />
        <Tab.Screen name="Compte" component={AccountScreen} />
        {isAuthenticated ? <Tab.Screen name="Notifications" component={NotificationsScreen} /> : null}
        <Tab.Screen name="À propos" component={AboutScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppTabs />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
