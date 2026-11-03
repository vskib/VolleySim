// @ts-ignore -- Metro processes this CSS import; TypeScript does not declare CSS modules.
import "../../global.css";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Icon, IconName } from "../components/Icon";
import { AppProvider, useApp } from "../state/AppContext";

/** Tab icons are drawn with SVG (see components/Icon) so they always show, even offline on first launch. */
function tabIcon(name: IconName) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <Icon name={name} size={24} color={color} strokeWidth={focused ? 2.4 : 1.8} />
  );
}

function Shell() {
  const { ready } = useApp();
  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-ink-900">
        <ActivityIndicator color="#C8F135" size="large" />
      </View>
    );
  }
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#C8F135",
        tabBarInactiveTintColor: "#8B949E",
        tabBarStyle: {
          backgroundColor: "#161B22",
          borderTopColor: "#30363D",
          borderTopWidth: 1,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontWeight: "800", fontSize: 11, marginBottom: 2 },
        sceneStyle: { backgroundColor: "#0D1117" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: tabIcon("home") }} />
      <Tabs.Screen name="rotation" options={{ title: "Rotation", tabBarIcon: tabIcon("rotate") }} />
      <Tabs.Screen name="gameplay" options={{ title: "Match", tabBarIcon: tabIcon("play") }} />
      <Tabs.Screen name="learn" options={{ title: "Learn", tabBarIcon: tabIcon("learn") }} />
      <Tabs.Screen name="rules" options={{ title: "Rules", tabBarIcon: tabIcon("rules") }} />
      {/* Reachable from buttons, not shown in the tab bar. */}
      <Tabs.Screen name="setup" options={{ href: null }} />
      <Tabs.Screen name="lineup" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="planner" options={{ href: null }} />
      <Tabs.Screen name="trainer" options={{ href: null }} />
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
