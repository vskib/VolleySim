import React from "react";
import { Circle, G, Rect, Text as SvgText } from "react-native-svg";
import { Player } from "../types/volleyball";

export const MARKER_RADIUS = 6.2;

interface Props {
  cx: number;
  cy: number;
  position: number;
  player: Player;
  color: string;
  /** "jersey" shows the jersey number in the circle; "position" shows the position number. */
  label: "jersey" | "position";
  showName: boolean;
  isServer?: boolean;
  selected?: boolean;
  dimmed?: boolean;
  /** Draws a red ring, used in the rules diagrams to show a positional fault. */
  fault?: boolean;
  onPress?: () => void;
}

function shortName(name: string): string {
  return name.length > 9 ? `${name.slice(0, 8)}.` : name;
}

export function PlayerMarker({
  cx,
  cy,
  position,
  player,
  color,
  label,
  showName,
  isServer,
  selected,
  dimmed,
  fault,
  onPress,
}: Props) {
  const R = MARKER_RADIUS;
  const fill = player.isLibero ? "#8B5CF6" : color;
  const main = label === "jersey" ? String(player.number) : String(position);
  return (
    <G onPress={onPress} opacity={dimmed ? 0.55 : 1}>
      {/* larger invisible touch target */}
      <Circle cx={cx} cy={cy} r={R + 2.5} fill="rgba(0,0,0,0)" />
      {isServer ? (
        <Circle cx={cx} cy={cy} r={R + 1.8} fill="none" stroke="#C8F135" strokeWidth={1.2} />
      ) : null}
      {fault ? (
        <Circle cx={cx} cy={cy} r={R + 1.8} fill="none" stroke="#EF4444" strokeWidth={1.6} />
      ) : null}
      {selected ? (
        <Circle cx={cx} cy={cy} r={R + 1.8} fill="none" stroke="#FFFFFF" strokeWidth={1} strokeDasharray="1.6 1.2" />
      ) : null}
      <Circle cx={cx} cy={cy} r={R} fill={fill} stroke="#FFFFFF" strokeWidth={0.8} />
      <SvgText x={cx} y={cy + 2.3} fontSize={6.4} fontWeight="bold" fill="#FFFFFF" textAnchor="middle">
        {main}
      </SvgText>

      {label === "jersey" ? (
        <G>
          <Circle cx={cx - R * 0.78} cy={cy - R * 0.78} r={2.7} fill="#0D1117" stroke="#FFFFFF" strokeWidth={0.4} />
          <SvgText x={cx - R * 0.78} y={cy - R * 0.78 + 1.1} fontSize={3.3} fontWeight="bold" fill="#C8F135" textAnchor="middle">
            {position}
          </SvgText>
        </G>
      ) : null}

      {player.isSetter || player.isLibero ? (
        <G>
          <Circle cx={cx + R * 0.78} cy={cy - R * 0.78} r={2.5} fill="#FFB020" />
          <SvgText x={cx + R * 0.78} y={cy - R * 0.78 + 1.1} fontSize={3.3} fontWeight="bold" fill="#0D1117" textAnchor="middle">
            {player.isLibero ? "L" : "S"}
          </SvgText>
        </G>
      ) : null}

      {isServer ? (
        <G>
          <Rect x={cx - 6} y={cy - R - 5.4} width={12} height={3.8} rx={1.9} fill="#C8F135" />
          <SvgText x={cx} y={cy - R - 2.6} fontSize={2.8} fontWeight="bold" fill="#0D1117" textAnchor="middle">
            SERVE
          </SvgText>
        </G>
      ) : null}

      {showName ? (
        <G>
          <Rect x={cx - 9.5} y={cy + R + 0.8} width={19} height={4.4} rx={1.6} fill="#0D1117" opacity={0.88} />
          <SvgText x={cx} y={cy + R + 3.9} fontSize={3.1} fontWeight="bold" fill="#FFFFFF" textAnchor="middle">
            {shortName(player.name)}
          </SvgText>
        </G>
      ) : null}
    </G>
  );
}
