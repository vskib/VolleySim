import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Card, CardTitle, Body } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { Segmented } from "../components/Segmented";
import { Stepper } from "../components/Stepper";
import { useApp } from "../state/AppContext";
import { MatchMode, TeamId } from "../types/volleyball";

export default function SetupScreen() {
  const router = useRouter();
  const { teams, match, startMatch } = useApp();
  const [mode, setMode] = useState<MatchMode>("standard");
  const [target, setTarget] = useState(15);
  const [bestOf, setBestOf] = useState<"1" | "3" | "5">("3");
  const [firstServer, setFirstServer] = useState<TeamId>("A");

  const begin = () => {
    startMatch({ mode, practiceTarget: target, bestOf: Number(bestOf) }, firstServer);
    router.push("/gameplay");
  };

  const onStart = () => {
    const inProgress = match && !match.winner && (match.past.length > 0 || match.setResults.length > 0);
    if (inProgress) {
      Alert.alert("Replace current match?", "Starting a new match will discard the match in progress.", [
        { text: "Keep playing", style: "cancel" },
        { text: "Start new match", style: "destructive", onPress: begin },
      ]);
    } else {
      begin();
    }
  };

  return (
    <Screen title="New Match" subtitle="Pick the rules and who serves first." back>
      <Card>
        <CardTitle>Game mode</CardTitle>
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: "standard", label: "Standard" },
            { value: "practice", label: "Practice" },
          ]}
        />
        {mode === "standard" ? (
          <View className="mt-3">
            <Body>
              Best of 5 sets. Sets 1–4 go to 25 points, the deciding 5th set goes to 15. Every set must be
              won by 2 points.
            </Body>
          </View>
        ) : (
          <View className="mt-3">
            <Stepper label="Points to win a set" value={target} min={3} max={50} onChange={setTarget} />
            <Text className="mb-1 mt-4 text-base font-semibold text-white">Match length</Text>
            <Segmented
              value={bestOf}
              onChange={setBestOf}
              options={[
                { value: "1", label: "1 set" },
                { value: "3", label: "Best of 3" },
                { value: "5", label: "Best of 5" },
              ]}
            />
            <Text className="mt-2 text-sm text-slate-300">
              Practice sets still need a 2-point lead to finish.
            </Text>
          </View>
        )}
      </Card>

      <Card>
        <CardTitle>Who serves first?</CardTitle>
        <Segmented
          value={firstServer}
          onChange={setFirstServer}
          options={[
            { value: "A", label: teams.A.name },
            { value: "B", label: teams.B.name },
          ]}
        />
        <Text className="mt-2 text-sm text-slate-300">
          The first serve alternates each set, like a real match.
        </Text>
      </Card>

      <Card>
        <CardTitle>Teams</CardTitle>
        <Text className="mb-3 text-base text-slate-100">
          {teams.A.name} vs {teams.B.name}
        </Text>
        <PrimaryButton
          title={`Edit ${teams.A.name} lineup`}
          variant="secondary"
          onPress={() => router.push({ pathname: "/lineup", params: { team: "A" } })}
        />
        <PrimaryButton
          title={`Edit ${teams.B.name} lineup`}
          variant="secondary"
          className="mt-3"
          onPress={() => router.push({ pathname: "/lineup", params: { team: "B" } })}
        />
      </Card>

      <PrimaryButton title="Start Match" className="mt-5" onPress={onStart} />
    </Screen>
  );
}
