import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Screen, Card, CardTitle, Body } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { Segmented } from "../components/Segmented";
import { VolleyballCourt } from "../components/VolleyballCourt";
import { TEAM_COLORS } from "../constants/theme";
import { defaultPlayers, rotateClockwise } from "../features/rotation/rotationLogic";
import { SCENARIOS, getScenario, resolveScenario } from "../features/trainer/rallyScript";

export default function TrainerScreen() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [step, setStep] = useState(0);

  const scenario = getScenario(scenarioId);
  const result = useMemo(() => resolveScenario(scenario), [scenario]);
  const total = scenario.steps.length;
  const atResult = step >= total;
  const current = atResult ? null : scenario.steps[step];

  // Your setter stands in Position 2 so the set in the script makes sense.
  const ours = useMemo(
    () => defaultPlayers("you").map((p, i) => ({ ...p, isSetter: i === 1 })),
    []
  );
  const theirs = useMemo(() => defaultPlayers("opp").map((p) => ({ ...p, isSetter: false })), []);

  const ourLineup = atResult && result.rotatingTeam === "A" ? rotateClockwise(ours) : ours;
  const theirLineup = atResult && result.rotatingTeam === "B" ? rotateClockwise(theirs) : theirs;
  // Who serves: during the rally it's the serving team, afterwards it's whoever won the rally.
  const serving = atResult ? scenario.winner : scenario.server;

  const pick = (id: string) => {
    setScenarioId(id);
    setStep(0);
  };

  return (
    <Screen title="Rally Trainer" subtitle="Step through one rally, touch by touch." back>
      <View className="mt-4">
        <Segmented
          value={scenarioId}
          onChange={pick}
          options={SCENARIOS.map((s) => ({ value: s.id, label: s.label }))}
        />
        <Text className="mt-2 text-sm text-slate-300">{scenario.intro}</Text>
      </View>

      <View className="mt-3 overflow-hidden rounded-3xl">
        <VolleyballCourt
          bottom={{ lineup: ourLineup, color: TEAM_COLORS.A, serving: serving === "A" }}
          top={{ lineup: theirLineup, color: TEAM_COLORS.B, serving: serving === "B" }}
          showNames={false}
          label="position"
          ball={current ? { from: current.from, to: current.to } : undefined}
          highlightPositions={current ? current.ours : []}
        />
      </View>
      <Text className="mt-1 text-xs text-slate-400">
        You are the blue team at the bottom. The white ball shows where it goes; dashed rings mark who touches it.
      </Text>

      <View className="mt-3 flex-row items-center justify-center">
        {Array.from({ length: total + 1 }).map((_, i) => (
          <View
            key={i}
            className={`mx-1 h-2.5 rounded-full ${i === step ? "w-6 bg-volley-orange" : i < step ? "w-2.5 bg-volley-yellow" : "w-2.5 bg-navy-700"}`}
          />
        ))}
      </View>

      <Card className={atResult ? "border-2 border-volley-yellow" : ""}>
        {current ? (
          <>
            <Text className="text-xs font-bold uppercase text-volley-orange">
              Step {step + 1} of {total} · {current.touch}
            </Text>
            <CardTitle>{current.title}</CardTitle>
            <Body>{current.text}</Body>
          </>
        ) : (
          <>
            <Text className="text-xs font-bold uppercase text-volley-orange">Result</Text>
            <CardTitle>{result.title}</CardTitle>
            <Body>{result.text}</Body>
            <Text className="mt-2 text-sm text-slate-300">
              {scenario.winner === "A" ? "Your team" : "The opponent"} serves next.
              {result.rotatingTeam
                ? ` The ${result.rotatingTeam === "A" ? "blue" : "red"} team has rotated: look at the new Position 1.`
                : " Both lineups stay the same."}
            </Text>
          </>
        )}
      </Card>

      <View className="mt-4 flex-row">
        <PrimaryButton
          title="Back"
          variant="secondary"
          className="mr-2 flex-1"
          disabled={step === 0}
          onPress={() => setStep((s) => Math.max(0, s - 1))}
        />
        {atResult ? (
          <PrimaryButton title="Replay" className="ml-2 flex-1" onPress={() => setStep(0)} />
        ) : (
          <PrimaryButton
            title={step === total - 1 ? "See result" : "Next touch"}
            className="ml-2 flex-1"
            onPress={() => setStep((s) => Math.min(total, s + 1))}
          />
        )}
      </View>
    </Screen>
  );
}
