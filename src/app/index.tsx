import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Card, CardTitle } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { Logo } from "../components/Logo";
import { useApp } from "../state/AppContext";

export default function HomeScreen() {
  const router = useRouter();
  const { match, recent, teams } = useApp();
  const inProgress =
    match && !match.winner && (match.past.length > 0 || match.setResults.length > 0);

  return (
    <Screen>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Logo size={56} />
          <View className="ml-3">
            <Text className="text-3xl font-extrabold text-white">
              Volley<Text className="text-volley-orange">Sim</Text>
            </Text>
            <Text className="text-sm text-slate-300">Rotations, rules and gameplay</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          onPress={() => router.push("/settings")}
          className="h-12 w-12 items-center justify-center rounded-2xl bg-navy-800 active:opacity-70"
        >
          <Text className="text-2xl">⚙️</Text>
        </Pressable>
      </View>

      {inProgress && match ? (
        <Card className="border-2 border-volley-yellow">
          <CardTitle>Match in progress</CardTitle>
          <Text className="text-base text-white">
            {match.starting.A.name} {match.score.A} – {match.score.B} {match.starting.B.name}
          </Text>
          <Text className="mb-3 mt-1 text-sm text-slate-300">
            Set {match.currentSet} · sets {match.setsWon.A}–{match.setsWon.B}
          </Text>
          <PrimaryButton title="Continue match" onPress={() => router.push("/gameplay")} />
        </Card>
      ) : null}

      <View className="mt-5">
        <PrimaryButton title="Start New Match" onPress={() => router.push("/setup")} />
        <PrimaryButton
          title="Rotation Simulator"
          variant="secondary"
          className="mt-3"
          onPress={() => router.push("/rotation")}
        />
        <PrimaryButton
          title="Learn Volleyball Rotations"
          variant="secondary"
          className="mt-3"
          onPress={() => router.push("/learn")}
        />
        <PrimaryButton
          title="Volleyball Rules"
          variant="secondary"
          className="mt-3"
          onPress={() => router.push("/rules")}
        />
        <PrimaryButton
          title="Tactics Planner"
          variant="secondary"
          className="mt-3"
          onPress={() => router.push("/planner")}
        />
        <PrimaryButton
          title="Rally Trainer"
          variant="secondary"
          className="mt-3"
          onPress={() => router.push("/trainer")}
        />
        <PrimaryButton
          title="Edit Team Lineups"
          variant="ghost"
          className="mt-3"
          onPress={() => router.push({ pathname: "/lineup", params: { team: "A" } })}
        />
      </View>

      <Card>
        <CardTitle>Recent matches</CardTitle>
        {recent.length === 0 ? (
          <Text className="text-base text-slate-300">
            Finished matches show up here. Start a match to play one!
          </Text>
        ) : (
          recent.map((r) => (
            <View key={r.id} className="mb-3 rounded-2xl bg-navy-900 p-3">
              <Text className="text-base font-bold text-white">
                {r.teamA} {r.setsA} – {r.setsB} {r.teamB}
              </Text>
              <Text className="mt-1 text-sm text-slate-300">
                Winner: {r.winner === "A" ? r.teamA : r.teamB} · {r.setScores} · {r.date}
              </Text>
            </View>
          ))
        )}
      </Card>
      <Text className="mt-4 text-center text-xs text-slate-500">
        Current lineups: {teams.A.name} and {teams.B.name}. Works offline.
      </Text>
    </Screen>
  );
}
