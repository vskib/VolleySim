import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

/** A simple generic volleyball mark drawn with SVG paths. */
export function Logo({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="VolleySim logo">
      <Circle cx={50} cy={50} r={46} fill="#FF8A1F" stroke="#FFFFFF" strokeWidth={3} />
      <Path d="M50 4 C 22 30 22 70 50 96" stroke="#FFFFFF" strokeWidth={3} fill="none" />
      <Path d="M50 4 C 78 30 78 70 50 96" stroke="#FFFFFF" strokeWidth={3} fill="none" />
      <Path d="M6 58 C 35 40 65 40 94 58" stroke="#FFFFFF" strokeWidth={3} fill="none" />
      <Path d="M14 28 C 38 40 62 40 86 28" stroke="#FFD23F" strokeWidth={3} fill="none" />
    </Svg>
  );
}
