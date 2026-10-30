import "../../global.css";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppProvider, useApp } from "../state/AppContext";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function icon(name: IconName, focusedName: IconName) {
  return ({ color, focused, size }: { color: string; focused: boolean; size: number }) => (
    <Ionicons name={focused ? focusedName : name} size={size} color={color} />
  );
}

function Shell() {
  const { ready } = useApp();
  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-navy-900">
        <ActivityIndicator color="#FF8A1F" size="large" />
      </View>
    );
  }
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF8A1F",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: { backgroundColor: "#12294A", borderTopColor: "#1B3A66" },
        tabBarLabelStyle: { fontWeight: "700", fontSize: 11 },
        sceneStyle: { backgroundColor: "#0B1B33" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: icon("home-outline", "home") }} />
      <Tabs.Screen
        name="rotation"
        options={{ title: "Rotation", tabBarIcon: icon("sync-outline", "sync") }}
      />
      <Tabs.Screen
        name="gameplay"
        options={{ title: "Match", tabBarIcon: icon("play-circle-outline", "play-circle") }}
      />
      <Tabs.Screen name="learn" options={{ title: "Learn", tabBarIcon: icon("school-outline", "school") }} />
      <Tabs.Screen name="rules" options={{ title: "Rules", tabBarIcon: icon("book-outline", "book") }} />
      {/* Reachable from buttons, not shown in the tab bar. */}
      <Tabs.Screen name="setup" options={{ href: null }} />
      <Tabs.Screen name="lineup" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppProvider>
        <Shell />
      </AppProvider>
    </SafeAreaProvider>
  );
}
