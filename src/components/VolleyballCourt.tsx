import React from "react";
import { View } from "react-native";
import Svg, { Circle, G, Line, Polygon, Rect, Text as SvgText } from "react-native-svg";
import { POSITIONS } from "../constants/volleyballPositions";
import { Player } from "../types/volleyball";
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
}

const FLOW_ORDER = [2, 1, 6, 5, 4, 3, 2];

const NET_Y = 55;
const FRONT_DY = 13;
const BACK_DY = 37;
const ATTACK_DY = 21;
const COURT_LEFT = 6;
const COURT_RIGHT = 94;
const COURT_TOP = 5;
const COURT_BOTTOM = 105;

function slot(position: number) {
  const info = POSITIONS[position - 1];
  return {
    x: COURT_LEFT + info.x * 0.88,
    y: NET_Y + (info.row === "Front" ? FRONT_DY : BACK_DY),
  };
}

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
          selected={interactive && selectedPosition === position}
          dimmed={interactive && selectedPosition !== null && selectedPosition !== position}
          onPress={interactive && onSelectPosition ? () => onSelectPosition(position) : undefined}
        />
      );
    });

  return (
    <View style={{ width: "100%", aspectRatio: aspect }} accessibilityLabel="Volleyball court seen from above">
      <Svg width="100%" height="100%" viewBox={viewBox}>
        {/* free zone */}
        <Rect x={0} y={0} width={100} height={110} rx={4} fill="#1B3A66" />
        {/* court floor */}
        <Rect x={COURT_LEFT} y={COURT_TOP} width={COURT_RIGHT - COURT_LEFT} height={COURT_BOTTOM - COURT_TOP} fill="#E07B2B" />
        {/* front zones, slightly lighter */}
        <Rect x={COURT_LEFT} y={NET_Y - ATTACK_DY} width={COURT_RIGHT - COURT_LEFT} height={ATTACK_DY * 2} fill="#F29145" />
        {/* boundary */}
        <Rect
          x={COURT_LEFT}
          y={COURT_TOP}
          width={COURT_RIGHT - COURT_LEFT}
          height={COURT_BOTTOM - COURT_TOP}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={0.9}
        />
        {/* attack lines (3 m lines) */}
        <Line x1={COURT_LEFT} y1={NET_Y - ATTACK_DY} x2={COURT_RIGHT} y2={NET_Y - ATTACK_DY} stroke="#FFFFFF" strokeWidth={0.7} />
        <Line x1={COURT_LEFT} y1={NET_Y + ATTACK_DY} x2={COURT_RIGHT} y2={NET_Y + ATTACK_DY} stroke="#FFFFFF" strokeWidth={0.7} />
        {/* center line under the net */}
        <Line x1={COURT_LEFT} y1={NET_Y} x2={COURT_RIGHT} y2={NET_Y} stroke="#FFFFFF" strokeWidth={0.7} />

        {/* net */}
        <Line x1={2} y1={NET_Y} x2={98} y2={NET_Y} stroke="#FFFFFF" strokeWidth={1.6} />
        <Line x1={2} y1={NET_Y} x2={98} y2={NET_Y} stroke="#0B1B33" strokeWidth={1.6} strokeDasharray="1.2 1.2" />
        <Circle cx={2.6} cy={NET_Y} r={1.4} fill="#FFD23F" />
        <Circle cx={97.4} cy={NET_Y} r={1.4} fill="#FFD23F" />
        <G>
          <Rect x={43} y={NET_Y - 2.2} width={14} height={4.4} rx={2.2} fill="#0B1B33" opacity={0.85} />
          <SvgText x={50} y={NET_Y + 1.1} fontSize={3} fontWeight="bold" fill="#FFFFFF" textAnchor="middle">
            NET
          </SvgText>
        </G>

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
                  <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#FFD23F" strokeWidth={0.9} strokeDasharray="2 1.6" />
                  <Polygon points={`${tip} ${l} ${r}`} fill="#FFD23F" />
                </G>
              );
            })
          : null}

        {top ? renderTeam(top, true, false) : null}
        {renderTeam(bottom, false, true)}
      </Svg>
    </View>
  );
}
