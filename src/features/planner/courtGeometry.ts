import { POSITIONS } from "../../constants/volleyballPositions";

/** A point in court units: x 0-100 (left to right), y 0-110 (top to bottom). The net is at y = 55. */
export interface Pt {
  x: number;
  y: number;
}

export const VIEW_W = 100;
export const VIEW_H = 110;
export const NET_Y = 55;
export const FRONT_DY = 13;
export const BACK_DY = 37;
export const ATTACK_DY = 21;
export const COURT_LEFT = 6;
export const COURT_RIGHT = 94;
export const COURT_TOP = 5;
export const COURT_BOTTOM = 105;
/** The bottom half of the court (your side) as an SVG viewBox window. */
export const HALF_VIEW = { y: 48, h: 62 };

/** Where a rotation position (1-6) stands by default on the bottom (your) half. */
export function slotPoint(position: number): Pt {
  const info = POSITIONS[position - 1];
  return {
    x: COURT_LEFT + info.x * 0.88,
    y: NET_Y + (info.row === "Front" ? FRONT_DY : BACK_DY),
  };
}

/** Rotate a point 180 degrees around the court center (the opponent's view of the same spot). */
export function mirrorPoint(p: Pt): Pt {
  return { x: VIEW_W - p.x, y: VIEW_H - p.y };
}

/** Keep a dragged player on their own half of the court. */
export function clampToOurHalf(p: Pt): Pt {
  return {
    x: Math.min(COURT_RIGHT, Math.max(COURT_LEFT, p.x)),
    y: Math.min(COURT_BOTTOM, Math.max(NET_Y + 5, p.y)),
  };
}

/** Index of the point closest to (x, y) within `radius`, or -1 when none is close enough. */
export function nearestPoint(points: Pt[], x: number, y: number, radius: number): number {
  let best = -1;
  let bestDist = radius;
  points.forEach((p, i) => {
    const d = Math.hypot(p.x - x, p.y - y);
    if (d <= bestDist) {
      best = i;
      bestDist = d;
    }
  });
  return best;
}
