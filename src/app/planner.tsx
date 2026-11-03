import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { Screen, Card, CardTitle } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { Segmented } from "../components/Segmented";
import { Stepper } from "../components/Stepper";
import { TacticsCourt } from "../components/TacticsCourt";
import { useApp } from "../state/AppContext";
import { TEAM_COLORS } from "../constants/theme";
import { Pt } from "../features/planner/courtGeometry";
import {
  BASE_POSITIONS,
  MAX_PLANS,
  PHASES,
  PlanPhase,
  TacticsPlan,
  copyPoints,
  defaultFormationFor,
  faultPositions,
  findOverlapFaults,
  formationsFor,
  sanitizePlans,
  upsertPlan,
} from "../features/planner/planLogic";
import { rotateBy } from "../features/rotation/rotationLogic";
import { TeamId } from "../types/volleyball";
import { KEYS, loadJSON, saveJSON } from "../utils/storage";

const PHASE_HELP: Record<PlanPhase, string> = {
  serveReceive:
    "Where your team lines up when the opponent serves. Overlap rules apply here: front-row players stay ahead of the back-row player behind them, and neighbors keep their left-to-right order.",
  defense: "Where players stand when the opponent attacks. After the serve you can move anywhere.",
  attack: "Where players stand as they prepare to attack after a pass or dig.",
};

export default function PlannerScreen() {
  const { teams, settings } = useApp();
  const [team, setTeam] = useState<TeamId>("A");
  const [rotation, setRotation] = useState(1);
  const [phase, setPhase] = useState<PlanPhase>("serveReceive");
  const [positions, setPositions] = useState<Pt[]>(copyPoints(BASE_POSITIONS));
  const [formationId, setFormationId] = useState<string | null>("base");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [plans, setPlans] = useState<TacticsPlan[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showNames, setShowNames] = useState(settings.showNames);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    loadJSON<unknown>(KEYS.plans, []).then((raw) => {
      setPlans(sanitizePlans(raw));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveJSON(KEYS.plans, plans);
  }, [plans, loaded]);

  const lineup = useMemo(() => rotateBy(teams[team].players, rotation - 1), [teams, team, rotation]);
  const faults = useMemo(() => (phase === "serveReceive" ? findOverlapFaults(positions) : []), [phase, positions]);
  const faultMarks = faultPositions(faults);

  const movePlayers = (next: Pt[]) => {
    setPositions(next);
    setFormationId(null);
    setMessage(null);
  };

  const applyFormation = (id: string) => {
    const f = formationsFor(phase).find((x) => x.id === id);
    if (!f) return;
    setPositions(copyPoints(f.positions));
    setFormationId(id);
    setMessage(null);
  };

  const changePhase = (next: PlanPhase) => {
    const f = defaultFormationFor(next);
    setPhase(next);
    setPositions(copyPoints(f.positions));
    setFormationId(f.id);
    setMessage(null);
  };

  const startNew = () => {
    setCurrentId(null);
    setName("");
    setNotes("");
    setPhase("serveReceive");
    setPositions(copyPoints(BASE_POSITIONS));
    setFormationId("base");
    setRotation(1);
    setMessage(null);
  };

  const save = () => {
    if (!currentId && plans.length >= MAX_PLANS) {
      setMessage({ text: `You can keep up to ${MAX_PLANS} plans. Delete one first.`, ok: false });
      return;
    }
    const finalName = name.trim() || `Plan ${plans.length + 1}`;
    const plan: TacticsPlan = {
      id: currentId ?? `${Date.now()}`,
      name: finalName,
      team,
      rotation: rotation - 1,
      phase,
      positions: copyPoints(positions),
      notes: notes.trim(),
      updatedAt: Date.now(),
    };
    setPlans((prev) => upsertPlan(prev, plan));
    setCurrentId(plan.id);
    setName(finalName);
    setMessage({
      text: faults.length
        ? `Saved "${finalName}", but it has ${faults.length} overlap fault${faults.length > 1 ? "s" : ""} for a serve.`
        : `Saved "${finalName}".`,
      ok: faults.length === 0,
    });
  };

  const load = (plan: TacticsPlan) => {
    setCurrentId(plan.id);
    setName(plan.name);
    setNotes(plan.notes);
    setTeam(plan.team);
    setRotation(plan.rotation + 1);
    setPhase(plan.phase);
    setPositions(copyPoints(plan.positions));
    setFormationId(null);
    setMessage({ text: `Loaded "${plan.name}".`, ok: true });
  };

  const remove = (plan: TacticsPlan) =>
    Alert.alert("Delete plan?", `"${plan.name}" will be removed from this device.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setPlans((prev) => prev.filter((p) => p.id !== plan.id));
          if (currentId === plan.id) setCurrentId(null);
        },
      },
    ]);

  return (
    <Screen
      title="Tactics Planner"
      subtitle="Drag players to plan formations, then save the plan."
      back
      scrollEnabled={!dragging}
    >
      <View className="mt-4">
        <Segmented
          value={team}
          onChange={setTeam}
          options={[
            { value: "A", label: teams.A.name },
            { value: "B", label: teams.B.name },
          ]}
        />
      </View>

      <View className="mt-3 rounded-2xl bg-navy-800 p-3">
        <Stepper label="Rotation" value={rotation} min={1} max={6} onChange={setRotation} />
      </View>

      <View className="mt-3">
        <Segmented value={phase} onChange={changePhase} options={PHASES} />
        <Text className="mt-2 text-sm text-slate-300">{PHASE_HELP[phase]}</Text>
      </View>

      <View className="mt-3 overflow-hidden rounded-3xl">
        <TacticsCourt
          lineup={lineup}
          points={positions}
          color={TEAM_COLORS[team]}
          faults={faultMarks}
          showNames={showNames}
          onChange={movePlayers}
          onDragState={setDragging}
        />
      </View>
      <Text className="mt-2 text-xs text-slate-400">
        Press and drag a player to move them. Players stay on their own half of the court.
      </Text>

      {phase === "serveReceive" ? (
        <View
          className={`mt-3 rounded-2xl p-3 ${faults.length ? "bg-red-900/60" : "bg-emerald-900/50"}`}
          accessibilityLiveRegion="polite"
        >
          {faults.length === 0 ? (
            <Text className="text-base font-semibold text-emerald-300">
              ✓ Legal formation: no overlap faults.
            </Text>
          ) : (
            <>
              <Text className="mb-1 text-base font-bold text-red-300">
                ✗ Overlap fault{faults.length > 1 ? "s" : ""} (red rings)
              </Text>
              {faults.map((f) => (
                <Text key={f.message} className="text-sm text-red-100">
                  • {f.message}
                </Text>
              ))}
            </>
          )}
        </View>
      ) : null}

      <Card>
        <CardTitle>Formations</CardTitle>
        <View className="flex-row flex-wrap">
          {formationsFor(phase).map((f) => {
            const on = formationId === f.id;
            return (
              <Pressable
                key={f.id}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => applyFormation(f.id)}
                className={`mb-2 mr-2 min-h-[44px] justify-center rounded-2xl px-4 ${
                  on ? "bg-volley-orange" : "bg-navy-700 active:opacity-70"
                }`}
              >
                <Text className={`text-sm font-bold ${on ? "text-navy-900" : "text-white"}`}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View className="mt-1">
          <Segmented
            value={showNames ? "names" : "numbers"}
            onChange={(v) => setShowNames(v === "names")}
            options={[
              { value: "numbers", label: "Numbers" },
              { value: "names", label: "Names" },
            ]}
          />
        </View>
      </Card>

      <Card>
        <CardTitle>Save this plan</CardTitle>
        <TextInput
          value={name}
          onChangeText={setName}
          maxLength={40}
          placeholder="Plan name, e.g. Rotation 1 receive"
          placeholderTextColor="#94A3B8"
          accessibilityLabel="Plan name"
          className="rounded-xl bg-navy-900 px-3 py-3 text-base font-bold text-white"
        />
        <TextInput
          value={notes}
          onChangeText={setNotes}
          maxLength={500}
          multiline
          placeholder="Notes: who covers the line, where the setter hides..."
          placeholderTextColor="#94A3B8"
          accessibilityLabel="Plan notes"
          className="mt-3 min-h-[96px] rounded-xl bg-navy-900 px-3 py-3 text-base text-white"
          style={{ textAlignVertical: "top" }}
        />
        {message ? (
          <Text className={`mt-3 text-base font-semibold ${message.ok ? "text-emerald-400" : "text-amber-300"}`}>
            {message.text}
          </Text>
        ) : null}
        <View className="mt-3 flex-row">
          <PrimaryButton title={currentId ? "Update plan" : "Save plan"} className="mr-2 flex-1" onPress={save} />
          <PrimaryButton title="New plan" variant="secondary" className="ml-2 flex-1" onPress={startNew} />
        </View>
      </Card>

      <Card>
        <CardTitle>Saved plans ({plans.length})</CardTitle>
        {plans.length === 0 ? (
          <Text className="text-base text-slate-300">
            Plans you save show up here and stay on this device.
          </Text>
        ) : (
          plans.map((p) => (
            <View
              key={p.id}
              className={`mb-3 rounded-2xl bg-navy-900 p-3 ${currentId === p.id ? "border-2 border-volley-orange" : ""}`}
            >
              <Text className="text-base font-bold text-white">{p.name}</Text>
              <Text className="mt-1 text-sm text-slate-300">
                {teams[p.team].name} · Rotation {p.rotation + 1} · {PHASES.find((x) => x.value === p.phase)?.label}
              </Text>
              {p.notes ? (
                <Text className="mt-1 text-sm text-slate-400" numberOfLines={2}>
                  {p.notes}
                </Text>
              ) : null}
              <View className="mt-3 flex-row">
                <PrimaryButton title="Load" variant="secondary" className="mr-2 flex-1" onPress={() => load(p)} />
                <PrimaryButton title="Delete" variant="danger" className="ml-2 flex-1" onPress={() => remove(p)} />
              </View>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}
