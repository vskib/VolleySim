import {
  FORMATIONS,
  BASE_POSITIONS,
  copyPoints,
  defaultFormationFor,
  faultPositions,
  findOverlapFaults,
  formationsFor,
  sanitizePlans,
  upsertPlan,
  TacticsPlan,
} from "../features/planner/planLogic";
import {
  COURT_BOTTOM,
  COURT_LEFT,
  COURT_RIGHT,
  NET_Y,
  clampToOurHalf,
  nearestPoint,
} from "../features/planner/courtGeometry";
import { SCENARIOS, getScenario, resolveScenario } from "../features/trainer/rallyScript";

describe("tactics planner", () => {
  test("the base positions are legal", () => {
    expect(findOverlapFaults(BASE_POSITIONS)).toEqual([]);
  });

  test("every serve-receive formation obeys the overlap rules", () => {
    const receive = formationsFor("serveReceive");
    expect(receive.length).toBeGreaterThan(1);
    for (const f of receive) {
      expect(findOverlapFaults(f.positions)).toEqual([]);
    }
  });

  test("every formation stays on the player's own half", () => {
    for (const f of FORMATIONS) {
      expect(f.positions).toHaveLength(6);
      for (const p of f.positions) {
        expect(clampToOurHalf(p)).toEqual(p);
      }
    }
  });

  test("each phase has a default formation", () => {
    for (const phase of ["serveReceive", "defense", "attack"] as const) {
      expect(defaultFormationFor(phase).phase).toBe(phase);
    }
  });

  test("a back-row player ahead of the front-row player is an overlap fault", () => {
    const pts = copyPoints(BASE_POSITIONS);
    pts[5] = { x: 50, y: NET_Y + 8 }; // Position 6 moves in front of Position 3
    const faults = findOverlapFaults(pts);
    expect(faults.some((f) => f.positions[0] === 3 && f.positions[1] === 6)).toBe(true);
    expect(faultPositions(faults)).toEqual(expect.arrayContaining([3, 6]));
  });

  test("swapping left and right neighbours is an overlap fault", () => {
    const pts = copyPoints(BASE_POSITIONS);
    pts[3] = { x: 60, y: pts[3].y }; // Position 4 moves to the right of Position 3
    const faults = findOverlapFaults(pts);
    expect(faults.some((f) => f.positions[0] === 4 && f.positions[1] === 3)).toBe(true);
  });

  test("dragging is clamped to the player's own half", () => {
    expect(clampToOurHalf({ x: -10, y: 0 })).toEqual({ x: COURT_LEFT, y: NET_Y + 5 });
    expect(clampToOurHalf({ x: 500, y: 500 })).toEqual({ x: COURT_RIGHT, y: COURT_BOTTOM });
  });

  test("nearestPoint finds the touched player and ignores empty space", () => {
    expect(nearestPoint(BASE_POSITIONS, BASE_POSITIONS[2].x + 2, BASE_POSITIONS[2].y - 1, 9)).toBe(2);
    expect(nearestPoint(BASE_POSITIONS, 50, 20, 9)).toBe(-1);
  });

  test("sanitizePlans keeps good plans and drops malformed ones", () => {
    const good: TacticsPlan = {
      id: "p1",
      name: "Rotation 1 receive",
      team: "A",
      rotation: 0,
      phase: "serveReceive",
      positions: copyPoints(BASE_POSITIONS),
      notes: "Setter hides right",
      updatedAt: 5,
    };
    const result = sanitizePlans([good, { id: 1 }, null, { ...good, id: "bad", rotation: 9 }, { ...good, id: "bad2", positions: [] }]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("p1");
    expect(sanitizePlans("nonsense")).toEqual([]);
  });

  test("sanitizePlans clamps out-of-range positions", () => {
    const plan = {
      id: "x",
      name: "n",
      team: "B",
      rotation: 2,
      phase: "attack",
      positions: Array.from({ length: 6 }, () => ({ x: 999, y: -50 })),
      notes: "",
      updatedAt: 1,
    };
    const [p] = sanitizePlans([plan]);
    expect(p.positions[0]).toEqual({ x: COURT_RIGHT, y: NET_Y + 5 });
  });

  test("upsertPlan replaces by id and puts the newest first", () => {
    const base: TacticsPlan = {
      id: "a",
      name: "one",
      team: "A",
      rotation: 0,
      phase: "defense",
      positions: copyPoints(BASE_POSITIONS),
      notes: "",
      updatedAt: 1,
    };
    const second = { ...base, id: "b", name: "two" };
    const list = upsertPlan(upsertPlan([], base), second);
    expect(list.map((p) => p.id)).toEqual(["b", "a"]);
    const updated = upsertPlan(list, { ...base, name: "renamed" });
    expect(updated.map((p) => p.id)).toEqual(["a", "b"]);
    expect(updated[0].name).toBe("renamed");
  });
});

describe("rally trainer", () => {
  test("receiving team that wins the rally rotates", () => {
    expect(resolveScenario(getScenario("sideout")).rotatingTeam).toBe("A");
  });

  test("serving team that wins the rally does not rotate", () => {
    expect(resolveScenario(getScenario("hold")).rotatingTeam).toBeNull();
  });

  test("opponent that wins while receiving rotates, and your serving team does not", () => {
    const result = resolveScenario(getScenario("lose"));
    expect(result.rotatingTeam).toBe("B");
  });

  test("every scenario has steps whose ball stays inside the drawing", () => {
    for (const s of SCENARIOS) {
      expect(s.steps.length).toBeGreaterThanOrEqual(3);
      for (const step of s.steps) {
        for (const p of [step.from, step.to]) {
          expect(p.x).toBeGreaterThanOrEqual(0);
          expect(p.x).toBeLessThanOrEqual(100);
          expect(p.y).toBeGreaterThanOrEqual(0);
          expect(p.y).toBeLessThanOrEqual(110);
        }
        for (const pos of step.ours) {
          expect(pos).toBeGreaterThanOrEqual(1);
          expect(pos).toBeLessThanOrEqual(6);
        }
      }
    }
  });

  test("a scenario's first touch is the serve by the serving team", () => {
    for (const s of SCENARIOS) {
      expect(s.steps[0].touch).toBe("Serve");
      // Your serves start on your half (bottom), the opponent's on theirs (top).
      if (s.server === "A") expect(s.steps[0].from.y).toBeGreaterThan(NET_Y);
      else expect(s.steps[0].from.y).toBeLessThan(NET_Y);
    }
  });

  test("unknown scenario ids fall back to the first scenario", () => {
    expect(getScenario("nope").id).toBe(SCENARIOS[0].id);
  });
});
