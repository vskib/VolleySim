import React from "react";
import { Text, View } from "react-native";
import { Screen, Card, CardTitle, Body } from "../components/Screen";
import { VolleyballCourt } from "../components/VolleyballCourt";
import { defaultPlayers } from "../features/rotation/rotationLogic";

function Example({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-3 rounded-2xl bg-navy-900 p-3">
      <Text className="mb-1 text-sm font-bold text-volley-orange">{title}</Text>
      {children}
    </View>
  );
}

function Small({ children }: { children: React.ReactNode }) {
  return <Text className="text-sm leading-5 text-slate-200">{children}</Text>;
}

export default function RulesScreen() {
  const players = defaultPlayers("rules").map((p) => ({ ...p, isSetter: false }));
  return (
    <Screen title="Volleyball Rules" subtitle="The basics in short, simple steps.">
      <Card>
        <CardTitle>1. How a rally starts</CardTitle>
        <Body>
          The player in Position 1 serves from behind the end line, hitting the ball over the net. The rally keeps
          going until the ball touches the floor, goes out, or someone commits a fault.
        </Body>
      </Card>

      <Card>
        <CardTitle>2. How points are awarded</CardTitle>
        <Body>
          Volleyball uses rally scoring: every rally gives exactly one point to the team that wins it, whether or not
          that team served.
        </Body>
        <Example title="Example">
          <Small>Team A serves and wins the rally: A +1. Team B serves and A wins: A +1 as well.</Small>
        </Example>
      </Card>

      <Card>
        <CardTitle>3. When teams rotate</CardTitle>
        <Body>A team rotates only when it wins a rally while receiving, because it then gains the serve.</Body>
        <Example title="Team A is serving">
          <Small>• A wins the rally → A scores, keeps serving, no rotation.</Small>
          <Small>• B wins the rally → B scores, B gains the serve and rotates clockwise.</Small>
        </Example>
      </Card>

      <Card>
        <CardTitle>4. Substitutions</CardTitle>
        <Body>
          A coach can swap a player in when the ball is dead. In common international rules each team gets up to 6
          substitutions per set. A starter may return once, to the same spot, and only by replacing the player who
          replaced them. Local leagues vary, so check your own rules.
        </Body>
      </Card>

      <Card>
        <CardTitle>5. The libero</CardTitle>
        <Body>
          The libero is a defensive specialist in a different color jersey. They play only in the back row, cannot
          block or attack the ball above the net, and swap in for teammates (often middle blockers) without counting
          as a substitution. Many leagues do not let the libero serve.
        </Body>
      </Card>

      <Card>
        <CardTitle>6. Rotation and positional faults</CardTitle>
        <Body>
          <Text className="font-bold text-white">Rotational fault:</Text> serving out of order, or players standing
          in the wrong rotation order. The other team gets the point.
        </Body>
        <View className="h-2" />
        <Body>
          <Text className="font-bold text-white">Positional fault (overlap):</Text> when the ball is served, each
          front-row player must be closer to the net than the back-row player behind them (4 ahead of 5, 3 ahead of
          6, 2 ahead of 1), and neighbors must keep their left-to-right order.
        </Body>
        <View className="mt-3 flex-row" style={{ gap: 8 }}>
          <View className="flex-1">
            <View className="overflow-hidden rounded-2xl">
              <VolleyballCourt halfOnly label="position" showNames={false} bottom={{ lineup: players, color: "#2563EB" }} />
            </View>
            <Text className="mt-1 text-center text-sm font-bold text-emerald-400">✓ Legal</Text>
          </View>
          <View className="flex-1">
            <View className="overflow-hidden rounded-2xl">
              <VolleyballCourt
                halfOnly
                label="position"
                showNames={false}
                bottom={{ lineup: players, color: "#2563EB" }}
                offsets={{ 6: { dx: 0, dy: -33 } }}
                faults={[6, 3]}
              />
            </View>
            <Text className="mt-1 text-center text-sm font-bold text-red-400">✗ Fault: 6 is ahead of 3</Text>
          </View>
        </View>
        <Text className="mt-2 text-xs text-slate-400">
          After the serve, players are free to move anywhere.
        </Text>
      </Card>

      <Card>
        <CardTitle>7. Winning a set and a match</CardTitle>
        <Body>
          Sets 1–4 are played to 25 points and the deciding 5th set to 15. A team must also lead by 2 points. A match
          is best of five sets, so the first team to win 3 sets wins.
        </Body>
        <Example title="Examples">
          <Small>• 25–23 → set over.</Small>
          <Small>• 25–24 → play continues until someone leads by 2 (26–24, 27–25...).</Small>
          <Small>• 3 sets won (3–0, 3–1 or 3–2) → match over.</Small>
        </Example>
      </Card>
    </Screen>
  );
}
