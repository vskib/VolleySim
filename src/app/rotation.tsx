import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Card, CardTitle, Body } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { Segmented } from "../components/Segmented";
import { VolleyballCourt } from "../components/VolleyballCourt";
import { useApp } from "../state/AppContext";
import { TEAM_COLORS } from "../constants/theme";
import { POSITIONS } from "../constants/volleyballPositions";
import { isFrontRow, rotateBy, rotationNumber } from "../features/rotation/rotationLogic";
import { TeamId } from "../types/volleyball";

const INTRO = "Tap Rotate Players to simulate this team winning a rally while receiving serve.";

export default function RotationScreen() {
  const router = useRouter();
  const { teams, settings } = useApp();
  const [team, setTeam] = useState<TeamId>("A");
  const [count, setCount] = useState(0);
  const [showNames, setShowNames] = useState(settings.showNames);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState(INTRO);

  const base = teams[team].players;
  const lineup = useMemo(() => rotateBy(base, count), [base, count]);
  const server = lineup[0];
  const selectedInfo = selected ? POSITIONS[selected - 1] : null;
  const selectedPlayer = selected ? lineup[selected - 1] : null;

  const rotate = () => {
    const next = rotateBy(base, count + 1);
    const wrapped = (count + 1) % 6 === 0;
    setCount(count + 1);
    setMessage(
      `${next[0].name} moved from Position 2 to Position 1 and now serves. ${lineup[0].name} dropped back to Position 6.` +
        (wrapped ? " Six rotations done: the team is back in its starting formation." : "")
    );
  };

  const reset = () => {
    setCount(0);
    setSelected(null);
    setMessage("Back to the starting formation (Rotation 1).");
  };

  const switchTeam = (t: TeamId) => {
    setTeam(t);
    setCount(0);
    setSelected(null);
    setMessage(INTRO);
  };

  return (
    <Screen title="Rotation Simulator" subtitle="Rotate the team clockwise and watch who moves where.">
      <View className="mt-4">
        <Segmented
          value={team}
          onChange={switchTeam}
          options={[
            { value: "A", label: teams.A.name },
            { value: "B", label: teams.B.name },
          ]}
        />
      </View>

      <View className="mt-4 flex-row items-end justify-between">
        <View>
          <Text className="text-sm font-semibold text-slate-300">Current rotation</Text>
          <Text className="text-4xl font-extrabold text-volley-yellow">
            {rotationNumber(count)}
            <Text className="text-lg text-slate-300"> of 6</Text>
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-sm font-semibold text-slate-300">Serving (Position 1)</Text>
          <Text className="text-lg font-extrabold text-white">
            #{server.number} {server.name}
          </Text>
        </View>
      </View>

      <View className="mt-3 overflow-hidden rounded-3xl">
        <VolleyballCourt
          halfOnly
          bottom={{ lineup, color: TEAM_COLORS[team], serving: true }}
          showNames={showNames}
          selectedPosition={selected}
          onSelectPosition={(p) => setSelected(selected === p ? null : p)}
        />
      </View>

      <View className="mt-3 rounded-2xl bg-navy-800 p-3">
        <Text className="text-base text-white" accessibilityLiveRegion="polite">
          {selectedInfo && selectedPlayer
            ? `Position ${selectedInfo.position} · ${selectedInfo.name} (${selectedInfo.row} row): #${selectedPlayer.number} ${selectedPlayer.name}${
                selectedPlayer.isSetter ? " · setter" : ""
              }${selectedPlayer.isLibero ? " · libero" : ""}`
            : message}
        </Text>
      </View>

      <View className="mt-3 flex-row">
        <PrimaryButton title="Rotate Players" className="mr-2 flex-1" onPress={rotate} />
        <PrimaryButton title="Reset" variant="secondary" className="ml-2 flex-1" onPress={reset} />
      </View>

      <View className="mt-3">
        <Segmented
          value={showNames ? "names" : "numbers"}
          onChange={(v) => setShowNames(v === "names")}
          options={[
            { value: "numbers", label: "Numbered lineup" },
            { value: "names", label: "Names lineup" },
          ]}
        />
      </View>

      <Card>
        <CardTitle>Lineup now</CardTitle>
        {lineup.map((p, i) => (
          <View key={p.id} className="flex-row items-center justify-between py-1">
            <Text className="text-base text-slate-300">
              Pos {i + 1} · {POSITIONS[i].name}
            </Text>
            <Text className="text-base font-bold text-white">
              {isFrontRow(i) ? "▲ " : "▼ "}#{p.number} {p.name}
            </Text>
          </View>
        ))}
        <Text className="mt-2 text-xs text-slate-400">▲ front row · ▼ back row</Text>
        <PrimaryButton
          title={`Edit ${teams[team].name} lineup`}
          variant="ghost"
          className="mt-3"
          onPress={() => router.push({ pathname: "/lineup", params: { team } })}
        />
      </Card>

      <Card>
        <CardTitle>Why and when do we rotate?</CardTitle>
        <Body>
          A team rotates only when it wins a rally while receiving serve. That win gives it the serve, so everyone
          moves one spot clockwise: Position 2 → 1 → 6 → 5 → 4 → 3 → 2. The player who lands in Position 1 serves.
        </Body>
        <View className="h-2" />
        <Body>If the serving team wins the rally, it scores and keeps serving with no rotation.</Body>
      </Card>
    </Screen>
  );
}
