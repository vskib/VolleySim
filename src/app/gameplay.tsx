import React from "react";
import { Alert, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Card, CardTitle } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { Scoreboard } from "../components/Scoreboard";
import { TeamCard } from "../components/TeamCard";
import { VolleyballCourt } from "../components/VolleyballCourt";
import { useApp } from "../state/AppContext";
import { TEAM_COLORS } from "../constants/theme";
import { rotationNumber } from "../features/rotation/rotationLogic";

export default function GameplayScreen() {
  const router = useRouter();
  const { match, teams, settings, award, undo, reset, renameTeam, endMatch } = useApp();

  if (!match) {
    return (
      <Screen title="Live Match" subtitle="No match in progress.">
        <Card>
          <Text className="mb-3 text-base text-slate-100">
            Set up a match to track the score, serve and rotations for both teams.
          </Text>
          <PrimaryButton title="Start New Match" onPress={() => router.push("/setup")} />
        </Card>
      </Screen>
    );
  }

  const names = { A: match.starting.A.name, B: match.starting.B.name };
  const over = match.winner !== null;

  const confirmReset = () =>
    Alert.alert("Reset match?", "Scores, sets and rotations go back to the start of the match.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: reset },
    ]);

  const confirmEnd = () =>
    Alert.alert("End match?", "This clears the current match. Finished matches are already saved in Recent.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End match",
        style: "destructive",
        onPress: () => {
          endMatch();
          router.push("/");
        },
      },
    ]);

  return (
    <Screen title="Live Match">
      <View className="mt-3">
        <Scoreboard match={match} />
      </View>

      <View className="mt-3 rounded-2xl border-l-4 border-volley-yellow bg-navy-800 p-3">
        <Text className="text-base text-white" accessibilityLiveRegion="polite">
          {match.message}
        </Text>
      </View>

      <View className="mt-3 flex-row" style={{ gap: 12 }}>
        {(["A", "B"] as const).map((t) => (
          <TeamCard
            key={t}
            team={t}
            name={teams[t].name}
            score={match.score[t]}
            setsWon={match.setsWon[t]}
            serving={!over && match.server === t}
            rotationLabel={`Rot ${rotationNumber(match.rotationCount[t])}/6`}
            disabled={over}
            onPoint={() => award(t)}
            onRename={(n) => renameTeam(t, n)}
          />
        ))}
      </View>

      {over ? (
        <Card className="border-2 border-volley-yellow">
          <CardTitle>🏆 {names[match.winner!]} wins the match!</CardTitle>
          <Text className="mb-3 text-base text-slate-100">
            Final sets: {match.setsWon.A}–{match.setsWon.B}
          </Text>
          <PrimaryButton title="New Match" onPress={() => router.push("/setup")} />
        </Card>
      ) : null}

      <View className="mt-4">
        <Text className="mb-2 text-base font-bold text-white">
          Court · {names.A} (bottom) vs {names.B} (top)
        </Text>
        <View className="overflow-hidden rounded-3xl">
          <VolleyballCourt
            bottom={{ lineup: match.lineups.A, color: TEAM_COLORS.A, serving: !over && match.server === "A" }}
            top={{ lineup: match.lineups.B, color: TEAM_COLORS.B, serving: !over && match.server === "B" }}
            showNames={settings.showNames}
          />
        </View>
      </View>

      <View className="mt-4 flex-row">
        <PrimaryButton
          title="Undo"
          variant="secondary"
          className="mr-2 flex-1"
          disabled={match.past.length === 0}
          onPress={undo}
        />
        <PrimaryButton title="Reset" variant="danger" className="ml-2 flex-1" onPress={confirmReset} />
      </View>
      <PrimaryButton title="End match" variant="ghost" className="mt-3" onPress={confirmEnd} />

      <Card>
        <CardTitle>Match history</CardTitle>
        {match.log.length === 0 ? (
          <Text className="text-base text-slate-300">No points played yet.</Text>
        ) : (
          [...match.log]
            .reverse()
            .slice(0, 40)
            .map((entry, i) => (
              <Text key={`${match.log.length - i}`} className="py-1 text-sm text-slate-200">
                {entry}
              </Text>
            ))
        )}
      </Card>
    </Screen>
  );
}
