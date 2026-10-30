import React, { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Screen, Card, CardTitle } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { Segmented } from "../components/Segmented";
import { VolleyballCourt } from "../components/VolleyballCourt";
import { useApp } from "../state/AppContext";
import { TEAM_COLORS } from "../constants/theme";
import { POSITIONS } from "../constants/volleyballPositions";
import { isFrontRow, validateLineup } from "../features/rotation/rotationLogic";
import { Player, TeamId } from "../types/volleyball";

export default function LineupScreen() {
  const params = useLocalSearchParams<{ team?: string }>();
  const { teams, setTeam } = useApp();
  const [team, setTeamId] = useState<TeamId>(params.team === "B" ? "B" : "A");
  const [name, setName] = useState(teams[team].name);
  const [players, setPlayers] = useState<Player[]>(teams[team].players);
  const [jerseys, setJerseys] = useState<string[]>(teams[team].players.map((p) => String(p.number)));
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (params.team === "A" || params.team === "B") setTeamId(params.team);
  }, [params.team]);

  useEffect(() => {
    setName(teams[team].name);
    setPlayers(teams[team].players);
    setJerseys(teams[team].players.map((p) => String(p.number)));
    setStatus(null);
    // Reload only when the selected team changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team]);

  const patch = (i: number, change: Partial<Player>) => {
    setPlayers((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...change } : p)));
    setStatus(null);
  };

  const chooseSetter = (i: number) =>
    setPlayers((prev) =>
      prev.map((p, idx) => ({ ...p, isSetter: idx === i, isLibero: idx === i ? false : p.isLibero }))
    );

  const toggleLibero = (i: number) =>
    setPlayers((prev) =>
      prev.map((p, idx) => ({ ...p, isLibero: idx === i ? !p.isLibero : false, isSetter: idx === i ? false : p.isSetter }))
    );

  const draft = players.map((p, i) => ({
    ...p,
    number: jerseys[i].trim() === "" ? NaN : Number(jerseys[i]),
  }));

  const save = () => {
    let error = validateLineup(draft);
    if (!error && !name.trim()) error = "Please enter a team name.";
    if (!error) {
      const li = draft.findIndex((p) => p.isLibero);
      if (li >= 0 && isFrontRow(li)) {
        error = "The libero only plays in the back row. Put the libero in Position 1, 5 or 6.";
      }
    }
    if (error) {
      setStatus({ text: error, ok: false });
      return;
    }
    setTeam(team, { name: name.trim(), players: draft });
    setStatus({ text: "Lineup saved.", ok: true });
  };

  return (
    <Screen title="Player Lineup" subtitle="Set the names, jersey numbers and roles for your starting six." back>
      <View className="mt-4">
        <Segmented
          value={team}
          onChange={setTeamId}
          options={[
            { value: "A", label: "Team A" },
            { value: "B", label: "Team B" },
          ]}
        />
      </View>

      <Card>
        <CardTitle>Team name</CardTitle>
        <TextInput
          value={name}
          onChangeText={(t) => {
            setName(t);
            setStatus(null);
          }}
          maxLength={24}
          accessibilityLabel="Team name"
          className="rounded-xl bg-navy-900 px-3 py-3 text-base font-bold text-white"
          placeholderTextColor="#94A3B8"
          placeholder="Team name"
        />
      </Card>

      <Card>
        <CardTitle>Starting players</CardTitle>
        {players.map((p, i) => (
          <View key={p.id} className="mb-4 rounded-2xl bg-navy-900 p-3">
            <Text className="mb-2 text-sm font-bold text-volley-yellow">
              Position {i + 1} · {POSITIONS[i].name}
              {i === 0 ? " (server)" : ""}
            </Text>
            <View className="flex-row" style={{ gap: 8 }}>
              <TextInput
                value={jerseys[i]}
                onChangeText={(t) => {
                  setJerseys((prev) => prev.map((j, idx) => (idx === i ? t.replace(/[^0-9]/g, "").slice(0, 2) : j)));
                  setStatus(null);
                }}
                keyboardType="number-pad"
                maxLength={2}
                accessibilityLabel={`Jersey number for position ${i + 1}`}
                placeholder="#"
                placeholderTextColor="#94A3B8"
                className="w-16 rounded-xl bg-navy-800 px-2 py-3 text-center text-base font-bold text-white"
              />
              <TextInput
                value={p.name}
                onChangeText={(t) => patch(i, { name: t })}
                maxLength={16}
                accessibilityLabel={`Player name for position ${i + 1}`}
                placeholder="Player name"
                placeholderTextColor="#94A3B8"
                className="flex-1 rounded-xl bg-navy-800 px-3 py-3 text-base text-white"
              />
            </View>
            <View className="mt-2 flex-row" style={{ gap: 8 }}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: p.isSetter }}
                onPress={() => chooseSetter(i)}
                className={`min-h-[44px] flex-1 items-center justify-center rounded-xl ${
                  p.isSetter ? "bg-volley-yellow" : "bg-navy-700"
                }`}
              >
                <Text className={`text-sm font-bold ${p.isSetter ? "text-navy-900" : "text-white"}`}>
                  {p.isSetter ? "★ Setter" : "Make setter"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: p.isLibero }}
                onPress={() => toggleLibero(i)}
                className={`min-h-[44px] flex-1 items-center justify-center rounded-xl ${
                  p.isLibero ? "bg-violet-500" : "bg-navy-700"
                }`}
              >
                <Text className="text-sm font-bold text-white">{p.isLibero ? "✓ Libero" : "Mark libero"}</Text>
              </Pressable>
            </View>
          </View>
        ))}
        {status ? (
          <Text className={`mb-3 text-base font-semibold ${status.ok ? "text-emerald-400" : "text-red-400"}`}>
            {status.text}
          </Text>
        ) : null}
        <PrimaryButton title="Save lineup" onPress={save} />
      </Card>

      <Card>
        <CardTitle>Starting formation</CardTitle>
        <View className="overflow-hidden rounded-3xl">
          <VolleyballCourt
            halfOnly
            bottom={{ lineup: draft.map((p) => ({ ...p, number: Number.isFinite(p.number) ? p.number : 0 })), color: TEAM_COLORS[team], serving: true }}
            showNames
          />
        </View>
        <Text className="mt-2 text-sm text-slate-300">
          Yellow S = setter, L = libero (purple). The player in Position 1 serves first.
        </Text>
      </Card>
    </Screen>
  );
}
