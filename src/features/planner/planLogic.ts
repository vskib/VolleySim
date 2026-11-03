import { TeamId } from "../../types/volleyball";
import { Pt, clampToOurHalf, slotPoint } from "./courtGeometry";

export type PlanPhase = "serveReceive" | "defense" | "attack";

export const PHASES: { value: PlanPhase; label: string }[] = [
  { value: "serveReceive", label: "Receive" },
  { value: "defense", label: "Defense" },
  { value: "attack", label: "Attack" },
];

/** A saved tactics board. positions[i] is where the player in rotation Position i+1 stands. */
export interface TacticsPlan {
  id: string;
  name: string;
  team: TeamId;
  /** 0-5: how many clockwise rotations from the starting lineup. */
  rotation: number;
  phase: PlanPhase;
  positions: Pt[];
  notes: string;
  updatedAt: number;
}

export interface Formation {
  id: string;
  label: string;
  phase: PlanPhase;
  /** Index 0 = Position 1 ... index 5 = Position 6. */
  positions: Pt[];
}

const pts = (list: [number, number][]): Pt[] => list.map(([x, y]) => ({ x, y }));

export const BASE_POSITIONS: Pt[] = [1, 2, 3, 4, 5, 6].map(slotPoint);

/** Ready-made formations. Order of each list: Position 1, 2, 3, 4, 5, 6. */
export const FORMATIONS: Formation[] = [
  { id: "base", label: "Base positions", phase: "serveReceive", positions: BASE_POSITIONS },
  {
    id: "receive-spread",
    label: "Spread (5 passers)",
    phase: "serveReceive",
    positions: pts([[82, 86], [76, 60], [50, 62], [24, 68], [18, 86], [50, 94]]),
  },
  {
    id: "receive-setter-net",
    label: "Setter at the net",
    phase: "serveReceive",
    positions: pts([[80, 88], [88, 60], [60, 64], [30, 66], [22, 86], [52, 92]]),
  },
  {
    id: "defense-perimeter",
    label: "Perimeter defense",
    phase: "defense",
    positions: pts([[86, 92], [84, 62], [50, 62], [16, 62], [14, 92], [50, 99]]),
  },
  {
    id: "defense-middle-up",
    label: "Middle up",
    phase: "defense",
    positions: pts([[82, 92], [80, 62], [50, 62], [20, 62], [18, 92], [50, 78]]),
  },
  {
    id: "attack-ready",
    label: "Attack ready",
    phase: "attack",
    positions: pts([[72, 86], [84, 62], [50, 62], [18, 62], [28, 86], [50, 80]]),
  },
  {
    id: "attack-quick-middle",
    label: "Quick middle",
    phase: "attack",
    positions: pts([[76, 88], [82, 62], [46, 62], [18, 62], [24, 88], [50, 82]]),
  },
];

export function formationsFor(phase: PlanPhase): Formation[] {
  const list = FORMATIONS.filter((f) => f.phase === phase);
  return list;
}

export function defaultFormationFor(phase: PlanPhase): Formation {
  return formationsFor(phase)[0];
}

export function copyPoints(points: Pt[]): Pt[] {
  return points.map((p) => ({ x: p.x, y: p.y }));
}

export interface OverlapFault {
  /** The two positions involved. */
  positions: [number, number];
  message: string;
}

/** [front, back]: the front-row player must be closer to the net (smaller y). */
const FRONT_BACK: [number, number][] = [
  [4, 5],
  [3, 6],
  [2, 1],
];
/** [left, right]: the left player must stand further left (smaller x) in the same row. */
const LEFT_RIGHT: [number, number][] = [
  [4, 3],
  [3, 2],
  [5, 6],
  [6, 1],
];

/**
 * Checks the overlap rules that apply when the ball is served. Points are on the bottom half,
 * so a smaller y means closer to the net.
 */
export function findOverlapFaults(points: Pt[]): OverlapFault[] {
  const faults: OverlapFault[] = [];
  for (const [front, back] of FRONT_BACK) {
    if (!(points[front - 1].y < points[back - 1].y)) {
      faults.push({
        positions: [front, back],
        message: `Position ${front} must be closer to the net than Position ${back}.`,
      });
    }
  }
  for (const [left, right] of LEFT_RIGHT) {
    if (!(points[left - 1].x < points[right - 1].x)) {
      faults.push({
        positions: [left, right],
        message: `Position ${left} must stay to the left of Position ${right}.`,
      });
    }
  }
  return faults;
}

export function faultPositions(faults: OverlapFault[]): number[] {
  return Array.from(new Set(faults.flatMap((f) => f.positions)));
}

export const MAX_PLANS = 30;

const isFiniteNumber = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

/** Turns whatever was stored into a safe list of plans, dropping anything malformed. */
export function sanitizePlans(raw: unknown): TacticsPlan[] {
  if (!Array.isArray(raw)) return [];
  const plans: TacticsPlan[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const p = item as Record<string, unknown>;
    const phaseOk = p.phase === "serveReceive" || p.phase === "defense" || p.phase === "attack";
    const teamOk = p.team === "A" || p.team === "B";
    const rotOk = Number.isInteger(p.rotation) && (p.rotation as number) >= 0 && (p.rotation as number) <= 5;
    const posOk =
      Array.isArray(p.positions) &&
      p.positions.length === 6 &&
      p.positions.every((q) => q && isFiniteNumber((q as Pt).x) && isFiniteNumber((q as Pt).y));
    if (typeof p.id !== "string" || typeof p.name !== "string" || !phaseOk || !teamOk || !rotOk || !posOk) continue;
    plans.push({
      id: p.id,
      name: p.name.slice(0, 40),
      team: p.team as TeamId,
      rotation: p.rotation as number,
      phase: p.phase as PlanPhase,
      positions: (p.positions as Pt[]).map((q) => clampToOurHalf({ x: q.x, y: q.y })),
      notes: typeof p.notes === "string" ? p.notes.slice(0, 500) : "",
      updatedAt: isFiniteNumber(p.updatedAt) ? p.updatedAt : 0,
    });
  }
  return plans.slice(0, MAX_PLANS);
}

/** Adds the plan, or replaces the one with the same id. Newest first. */
export function upsertPlan(plans: TacticsPlan[], plan: TacticsPlan): TacticsPlan[] {
  const rest = plans.filter((p) => p.id !== plan.id);
  return [plan, ...rest];
}
