import React from "react";
import Svg, { Circle, Path } from "react-native-svg";
import icons from "../constants/icons.json";

export type IconName = keyof typeof icons;

interface IconData {
  paths: string[];
  circles?: number[][];
}

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Line icons drawn with SVG, so they never depend on a font loading.
 * Shapes live in constants/icons.json (24 x 24 grid).
 */
export function Icon({ name, size = 24, color = "#FFFFFF", strokeWidth = 2 }: Props) {
  const data = icons[name] as unknown as IconData;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {data.paths.map((d, i) => (
        <Path
          key={`p${i}`}
          d={d}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
      {(data.circles ?? []).map(([cx, cy, r], i) => (
        <Circle key={`c${i}`} cx={cx} cy={cy} r={r} stroke={color} strokeWidth={strokeWidth} fill="none" />
      ))}
    </Svg>
  );
}
