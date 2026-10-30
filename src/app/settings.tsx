import React from "react";
import { Alert, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Card, CardTitle } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { useApp } from "../state/AppContext";

function Row({
  title,
  detail,
  value,
  onChange,
}: {
  title: string;
  detail: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <View className="mr-3 flex-1">
        <Text className="text-base font-bold text-white">{title}</Text>
        <Text className="text-sm text-slate-300">{detail}</Text>
      </View>
      <Switch
        accessibilityLabel={title}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#1B3A66", true: "#FF8A1F" }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings, clearEverything } = useApp();

  const confirmClear = () =>
    Alert.alert("Erase all saved data?", "Teams, lineups, settings, the current match and recent matches will be cleared.", [
      { text: "Cancel", style: "cancel" },
      { text: "Erase", style: "destructive", onPress: clearEverything },
    ]);

  return (
    <Screen title="Settings" back>
      <Card>
        <CardTitle>Display</CardTitle>
        <Row
          title="Show player names"
          detail="Show names under the player markers on the court."
          value={settings.showNames}
          onChange={(v) => updateSettings({ showNames: v })}
        />
      </Card>
      <Card>
        <CardTitle>Saving</CardTitle>
        <Row
          title="Save match progress"
          detail="Keep the current match if you close the app. Data stays on this device."
          value={settings.saveProgress}
          onChange={(v) => updateSettings({ saveProgress: v })}
        />
        <PrimaryButton title="Erase all saved data" variant="danger" onPress={confirmClear} />
      </Card>
      <Card>
        <CardTitle>Teams</CardTitle>
        <PrimaryButton
          title="Edit lineups"
          variant="secondary"
          onPress={() => router.push({ pathname: "/lineup", params: { team: "A" } })}
        />
      </Card>
      <Text className="mt-6 text-center text-xs text-slate-500">VolleySim 1.0.0 · works offline</Text>
    </Screen>
  );
}
