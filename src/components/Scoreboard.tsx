import React from "react";
import { Text, View } from "react-native";
import { MatchState } from "../types/volleyball";
import { setsToWinMatch, targetForSet, isDecidingSet } from "../features/gameplay/scoringLogic";

/** Header strip with the current set, its target, and the finished set scores. */
export function Scoreboard({ match }: { match: MatchState }) {
  const target = targetForSet(match.config, match.currentSet);
  const deciding = isDecidingSet(match.config, match.currentSet) && match.config.mode === "standard";
  const bestOf = match.config.mode === "standard" ? 5 : match.config.bestOf;
  return (
    <View className="rounded-3xl bg-navy-800 p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-extrabold text-white">
          {match.winner ? "Final" : `Set ${match.currentSet}`}
          <Text className="text-sm font-semibold text-slate-300"> of {bestOf}</Text>
        </Text>
        <Text className="text-sm font-semibold text-volley-yellow">
          {match.winner
            ? "Match complete"
            : `First to ${target}${deciding ? " (deciding set)" : ""}, win by 2`}
        </Text>
      </View>
      <Text className="mt-1 text-xs text-slate-400">
        {match.config.mode === "practice" ? "Practice mode" : "Standard indoor rules"} · first to{" "}
        {setsToWinMatch(match.config)} sets wins
      </Text>
      {match.setResults.length > 0 ? (
        <View className="mt-3 flex-row flex-wrap">
          {match.setResults.map((r) => (
            <View
              key={r.setNumber}
              className="mb-1 mr-2 rounded-full bg-navy-700 px-3 py-1"
              accessibilityLabel={`Set ${r.setNumber}: ${r.scoreA} to ${r.scoreB}`}
            >
              <Text className="text-xs font-bold text-white">
                S{r.setNumber}: {r.scoreA}–{r.scoreB}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
