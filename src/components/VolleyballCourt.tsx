import React from "react";
import { View } from "react-native";
import Svg, { Circle, G, Line, Polygon } from "react-native-svg";
import { Pt, slotPoint } from "../features/planner/courtGeometry";
import { Player } from "../types/volleyball";
import { CourtLines } from "./CourtLines";
import { PlayerMarker } from "./PlayerMarker";

export interface TeamLayer {
  /** Index 0 = Position 1 ... index 5 = Position 6. */
  lineup: Player[];
  color: string;
  /** Show the serve indicator on the Position 1 player. */
  serving?: boolean;
}

interface Props {
  bottom: TeamLayer;
  top?: TeamLayer;
  showNames: boolean;
  label?: "jersey" | "position";
  selectedPosition?: number | null;
  onSelectPosition?: (position: number) => void;
  /** Crop to the bottom half (net at the top edge). */
  halfOnly?: boolean;
  /** Draw dashed clockwise arrows 2 -> 1 -> 6 -> 5 -> 4 -> 3 -> 2 under the markers. */
  showFlow?: boolean;
  /** Per-position nudges (court units) for the bottom team, used in fault diagrams. */
  offsets?: Partial<Record<number, { dx: number; dy: number }>>;
  /** Positions of the bottom team to outline in red. */
  faults?: number[];
  /** Draw a ball and its path (court units). Used by the rally trainer. */
  ball?: { from: Pt; to: Pt };
  /** Bottom-team positions to ring with a dashed outline (the players involved in a touch). */
  highlightPositions?: number[];
}

const FLOW_ORDER = [2, 1, 6, 5, 4, 3, 2];

const slot = slotPoint;

export function VolleyballCourt({
  bottom,
  top,
  showNames,
  label = "jersey",
  selectedPosition = null,
  onSelectPosition,
  halfOnly = false,
  showFlow = false,
  offsets,
  faults,
  ball,
  highlightPositions,
}: Props) {
  const viewBox = halfOnly ? "0 48 100 62" : "0 0 100 110";
  const aspect = halfOnly ? 100 / 62 : 100 / 110;

  const renderTeam = (layer: TeamLayer, mirrored: boolean, interactive: boolean) =>
    layer.lineup.map((player, i) => {
      const position = i + 1;
      const s = slot(position);
      const nudge = !mirrored ? offsets?.[position] : undefined;
      const px = s.x + (nudge?.dx ?? 0);
      const py = s.y + (nudge?.dy ?? 0);
      const cx = mirrored ? 100 - px : px;
      const cy = mirrored ? 110 - py : py;
      return (
        <PlayerMarker
          key={`${mirrored ? "t" : "b"}-${player.id}-${position}`}
          cx={cx}
          cy={cy}
          position={position}
          player={player}
          color={layer.color}
          label={label}
          showName={showNames}
          isServer={Boolean(layer.serving) && position === 1}
          fault={!mirrored && Boolean(faults?.includes(position))}
          selected={
            (interactive && selectedPosition === position) ||
            (!mirrored && Boolean(highlightPositions?.includes(position)))
          }
          dimmed={interactive && selectedPosition !== null && selectedPosition !== position}
          onPress={interactive && onSelectPosition ? () => onSelectPosition(position) : undefined}
        />
      );
    });

  return (
    <View style={{ width: "100%", aspectRatio: aspect }} accessibilityLabel="Volleyball court seen from above">
      <Svg width="100%" height="100%" viewBox={viewBox}>
        <CourtLines />

        {showFlow
          ? FLOW_ORDER.slice(0, -1).map((from, i) => {
              const a = slot(from);
              const b = slot(FLOW_ORDER[i + 1]);
              const mx = (a.x + b.x) / 2;
              const my = (a.y + b.y) / 2;
              const len = Math.hypot(b.x - a.x, b.y - a.y);
              const ux = (b.x - a.x) / len;
              const uy = (b.y - a.y) / len;
              const tip = `${mx + ux * 2.6},${my + uy * 2.6}`;
              const l = `${mx - ux * 1.6 - uy * 2.2},${my - uy * 1.6 + ux * 2.2}`;
              const r = `${mx - ux * 1.6 + uy * 2.2},${my - uy * 1.6 - ux * 2.2}`;
              return (
                <G key={`flow-${from}`}>
                  <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#C8F135" strokeWidth={0.9} strokeDasharray="2 1.6" />
                  <Polygon points={`${tip} ${l} ${r}`} fill="#C8F135" />
                </G>
              );
            })
          : null}

        {top ? renderTeam(top, true, false) : null}
        {renderTeam(bottom, false, true)}

        {ball ? (
          <G>
            {ball.from.x !== ball.to.x || ball.from.y !== ball.to.y ? (
              <Line
                x1={ball.from.x}
                y1={ball.from.y}
                x2={ball.to.x}
                y2={ball.to.y}
                stroke="#FFFFFF"
                strokeWidth={0.9}
                strokeDasharray="1.8 1.4"
              />
            ) : null}
            <Circle cx={ball.from.x} cy={ball.from.y} r={1.3} fill="#FFFFFF" opacity={0.7} />
            <Circle cx={ball.to.x} cy={ball.to.y} r={3} fill="#FFFFFF" stroke="#0D1117" strokeWidth={0.6} />
            <Circle cx={ball.to.x} cy={ball.to.y} r={3} fill="none" stroke="#C8F135" strokeWidth={0.6} strokeDasharray="1.2 1" />
          </G>
        ) : null}
      </Svg>
    </View>
  );
}
