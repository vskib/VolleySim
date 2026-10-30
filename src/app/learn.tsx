import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Screen, Card, CardTitle, Body } from "../components/Screen";
import { VolleyballCourt } from "../components/VolleyballCourt";
import { POSITIONS, ROLES } from "../constants/volleyballPositions";
import { defaultPlayers } from "../features/rotation/rotationLogic";

export default function LearnScreen() {
  const [selected, setSelected] = useState<number>(1);
  const players = useMemo(
    () => defaultPlayers("learn").map((p) => ({ ...p, isSetter: false })),
    []
  );
  const info = POSITIONS[selected - 1];

  return (
    <Screen title="Learn Positions" subtitle="Tap a spot on the court to see what it means.">
      <View className="mt-4 overflow-hidden rounded-3xl">
        <VolleyballCourt
          halfOnly
          showFlow
          label="position"
          showNames={false}
          bottom={{ lineup: players, color: "#2563EB" }}
          selectedPosition={selected}
          onSelectPosition={setSelected}
        />
      </View>

      <Card className="border-2 border-volley-orange">
        <CardTitle>
          Position {info.position} · {info.name}
        </CardTitle>
        <Text className="mb-2 text-sm font-bold text-slate-300">{info.row} row</Text>
        <Body>{info.description}</Body>
      </Card>

      <Card>
        <CardTitle>Front row vs back row</CardTitle>
        <Body>
          <Text className="font-bold text-white">Front row (2, 3, 4)</Text> stands near the net. These players can
          jump and attack anywhere and can block.
        </Body>
        <View className="h-2" />
        <Body>
          <Text className="font-bold text-white">Back row (1, 5, 6)</Text> defends and passes. A back-row player may
          attack only if they jump from behind the 3-meter line, and cannot block.
        </Body>
      </Card>

      <Card>
        <CardTitle>Clockwise rotation</CardTitle>
        <Body>The yellow arrows show how players move when their team earns the serve:</Body>
        <View className="mt-2 flex-row flex-wrap items-center">
          {[2, 1, 6, 5, 4, 3, 2].map((n, i) => (
            <View key={i} className="mb-1 flex-row items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-volley-orange">
                <Text className="font-extrabold text-navy-900">{n}</Text>
              </View>
              {i < 6 ? <Text className="mx-1 text-lg text-volley-yellow">→</Text> : null}
            </View>
          ))}
        </View>
        <View className="h-2" />
        <Body>
          The player in Position 2 steps back into Position 1 and serves. Everyone else shifts one spot. After six
          rotations everybody is back where they started.
        </Body>
      </Card>

      <Card>
        <CardTitle>Serve reception and rotation</CardTitle>
        <Body>
          When the other team serves, you are "receiving." If you win that rally, you earn the right to serve, so
          you rotate once. If you were already serving and win the rally, you just score and stay put.
        </Body>
      </Card>

      <Card>
        <CardTitle>Positions vs roles</CardTitle>
        <Body>
          <Text className="font-bold text-white">Rotation positions</Text> (1–6) say where a player must stand when
          the ball is served. <Text className="font-bold text-white">Playing roles</Text> describe what a player
          does during the rally. After the serve, players may move anywhere, so a role stays with the player while
          the position keeps changing as the team rotates.
        </Body>
        <View className="mt-3">
          {ROLES.map((r) => (
            <View key={r.name} className="mb-3 rounded-2xl bg-navy-900 p-3">
              <Text className="text-base font-bold text-volley-yellow">{r.name}</Text>
              <Text className="mt-1 text-sm leading-5 text-slate-200">{r.text}</Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}
