import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

/** A simple generic volleyball mark drawn with SVG paths: lime ball, charcoal seams. */
export function Logo({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="VolleySim logo">
      <Circle cx={50} cy={50} r={46} fill="#C8F135" />
      <Path d="M50 4 C 22 30 22 70 50 96" stroke="#0D1117" strokeWidth={3.5} fill="none" />
      <Path d="M50 4 C 78 30 78 70 50 96" stroke="#0D1117" strokeWidth={3.5} fill="none" />
      <Path d="M6 58 C 35 40 65 40 94 58" stroke="#0D1117" strokeWidth={3.5} fill="none" />
      <Path d="M14 28 C 38 40 62 40 86 28" stroke="#0D1117" strokeWidth={3.5} fill="none" />
    </Svg>
  );
}
