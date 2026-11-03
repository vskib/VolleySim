import React, { useMemo, useRef, useState } from "react";
import { GestureResponderEvent, LayoutChangeEvent, PanResponder, StyleSheet, View } from "react-native";
import Svg from "react-native-svg";
import { HALF_VIEW, Pt, clampToOurHalf, nearestPoint } from "../features/planner/courtGeometry";
import { Player } from "../types/volleyball";
import { CourtLines } from "./CourtLines";
import { PlayerMarker } from "./PlayerMarker";

interface Props {
  /** Index 0 = Position 1 ... index 5 = Position 6. */
  lineup: Player[];
  /** Where each of those players stands, same order as lineup. */
  points: Pt[];
  color: string;
  /** Rotation positions to outline in red (overlap faults). */
  faults: number[];
  showNames: boolean;
  onChange: (points: Pt[]) => void;
  /** Called with true when a drag starts and false when it ends, so the page can stop scrolling. */
  onDragState?: (dragging: boolean) => void;
}

/** How close (in court units) a touch must be to a player to pick them up. */
const HIT_RADIUS = 9;

/** The bottom half of the court where players can be dragged anywhere on their own side. */
export function TacticsCourt({ lineup, points, color, faults, showNames, onChange, onDragState }: Props) {
  const [active, setActive] = useState(-1);
  const live = useRef({ points, width: 1, onChange, onDragState });
  live.current = { ...live.current, points, onChange, onDragState };
  const dragIndex = useRef(-1);

  const pan = useMemo(() => {
    const toUnits = (e: GestureResponderEvent): Pt => {
      const w = live.current.width || 1;
      // The drawing is 100 units wide, so the same factor scales both axes.
      return {
        x: (e.nativeEvent.locationX * 100) / w,
        y: HALF_VIEW.y + (e.nativeEvent.locationY * 100) / w,
      };
    };
    const finish = () => {
      dragIndex.current = -1;
      setActive(-1);
      live.current.onDragState?.(false);
    };
    return PanResponder.create({
      // Only claim the touch when it lands on a player, so the rest of the page still scrolls.
      onStartShouldSetPanResponder: (e) => {
        const p = toUnits(e);
        dragIndex.current = nearestPoint(live.current.points, p.x, p.y, HIT_RADIUS);
        return dragIndex.current >= 0;
      },
      onPanResponderGrant: () => {
        setActive(dragIndex.current);
        live.current.onDragState?.(true);
      },
      onPanResponderMove: (e) => {
        const i = dragIndex.current;
        if (i < 0) return;
        const next = live.current.points.slice();
        next[i] = clampToOurHalf(toUnits(e));
        live.current.onChange(next);
      },
      onPanResponderRelease: finish,
      onPanResponderTerminate: finish,
      onPanResponderTerminationRequest: () => false,
    });
  }, []);

  const onLayout = (e: LayoutChangeEvent) => {
    live.current.width = e.nativeEvent.layout.width;
  };

  return (
    <View
      onLayout={onLayout}
      style={{ width: "100%", aspectRatio: 100 / HALF_VIEW.h }}
      accessibilityLabel="Tactics board. Drag the players to plan where they stand."
    >
      <Svg width="100%" height="100%" viewBox={`0 ${HALF_VIEW.y} 100 ${HALF_VIEW.h}`}>
        <CourtLines />
        {lineup.map((player, i) => (
          <PlayerMarker
            key={`${player.id}-${i}`}
            cx={points[i].x}
            cy={points[i].y}
            position={i + 1}
            player={player}
            color={color}
            label="jersey"
            showName={showNames}
            selected={active === i}
            fault={faults.includes(i + 1)}
          />
        ))}
      </Svg>
      <View style={StyleSheet.absoluteFill} {...pan.panHandlers} />
    </View>
  );
}
