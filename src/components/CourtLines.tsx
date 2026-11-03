import React from "react";
import { Circle, G, Line, Rect, Text as SvgText } from "react-native-svg";
import {
  ATTACK_DY,
  COURT_BOTTOM,
  COURT_LEFT,
  COURT_RIGHT,
  COURT_TOP,
  NET_Y,
} from "../features/planner/courtGeometry";

/** The court floor, lines and net. Render inside an <Svg> with viewBox "0 0 100 110". */
export function CourtLines() {
  return (
    <G>
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
    </G>
  );
}
