import { defaultPlayers, rotateClockwise, rotateBy, rotationNumber, validateLineup } from "../features/rotation/rotationLogic";
import { awardPoint, createMatch, resetMatch, undo } from "../features/gameplay/matchState";
import { setWinner, targetForSet, matchWinner, shouldRotate } from "../features/gameplay/scoringLogic";
import { MatchConfig, MatchState, TeamSetup } from "../types/volleyball";

const teamA: TeamSetup = { name: "Aces", players: defaultPlayers("a") };
const teamB: TeamSetup = { name: "Blockers", players: defaultPlayers("b") };
const std: MatchConfig = { mode: "standard", practiceTarget: 25, bestOf: 5 };

function ids(state: MatchState, t: "A" | "B") {
  return state.lineups[t].map((p) => p.id);
}

function play(state: MatchState, team: "A" | "B", n: number) {
  let s = state;
  for (let i = 0; i < n; i++) s = awardPoint(s, team);
  return s;
}

describe("rotation", () => {
  test("clockwise: Position 2 player moves into Position 1, server goes to Position 6", () => {
    const r = rotateClockwise(["p1", "p2", "p3", "p4", "p5", "p6"]);
    expect(r).toEqual(["p2", "p3", "p4", "p5", "p6", "p1"]);
    expect(r[0]).toBe("p2");
    expect(r[5]).toBe("p1");
  });

  test("six rotations return to the start", () => {
    const base = ["p1", "p2", "p3", "p4", "p5", "p6"];
    expect(rotateBy(base, 6)).toEqual(base);
    expect(rotationNumber(0)).toBe(1);
    expect(rotationNumber(5)).toBe(6);
    expect(rotationNumber(6)).toBe(1);
  });

  test("lineup validation", () => {
    expect(validateLineup(teamA.players)).toBeNull();
    const dup = teamA.players.map((p) => ({ ...p, number: 5 }));
    expect(validateLineup(dup)).not.toBeNull();
  });
});

describe("gameplay", () => {
  test("receiving team wins rally: gets serve and rotates", () => {
    const s0 = createMatch(teamA, teamB, std, "A");
    const s1 = awardPoint(s0, "B");
    expect(s1.server).toBe("B");
    expect(s1.rotationCount.B).toBe(1);
    expect(s1.rotationCount.A).toBe(0);
    expect(ids(s1, "B")).toEqual(["b2", "b3", "b4", "b5", "b6", "b1"]);
  });

  test("serving team wins rally: no rotation", () => {
    const s0 = createMatch(teamA, teamB, std, "A");
    const s1 = awardPoint(s0, "A");
    expect(s1.server).toBe("A");
    expect(s1.rotationCount.A).toBe(0);
    expect(ids(s1, "A")).toEqual(["a1", "a2", "a3", "a4", "a5", "a6"]);
    expect(s1.score.A).toBe(1);
    expect(shouldRotate("A", "A")).toBe(false);
  });

  test("correct player moves to Position 1", () => {
    const s = awardPoint(createMatch(teamA, teamB, std, "A"), "B");
    expect(s.lineups.B[0].id).toBe("b2");
  });

  test("set needs target AND two-point lead", () => {
    expect(setWinner(25, 24, 25)).toBeNull();
    expect(setWinner(25, 23, 25)).toBe("A");
    expect(setWinner(24, 24, 25)).toBeNull();
    expect(setWinner(26, 24, 25)).toBe("A");
    expect(setWinner(24, 26, 25)).toBe("B");
    expect(setWinner(20, 25, 25)).toBe("B");
  });

  test("set does not end at 25-24 in a live match", () => {
    let s = createMatch(teamA, teamB, std, "A");
    for (let i = 0; i < 24; i++) {
      s = awardPoint(s, "A");
      s = awardPoint(s, "B");
    }
    s = awardPoint(s, "A");
    expect(s.score).toEqual({ A: 25, B: 24 });
    expect(s.currentSet).toBe(1);
    s = awardPoint(s, "A");
    expect(s.setsWon.A).toBe(1);
    expect(s.currentSet).toBe(2);
    expect(s.score).toEqual({ A: 0, B: 0 });
    expect(s.setResults[0]).toMatchObject({ scoreA: 26, scoreB: 24, winner: "A" });
  });

  test("deciding set is played to 15", () => {
    expect(targetForSet(std, 1)).toBe(25);
    expect(targetForSet(std, 4)).toBe(25);
    expect(targetForSet(std, 5)).toBe(15);
  });

  test("match ends when a team wins three sets", () => {
    let s = createMatch(teamA, teamB, std, "A");
    s = play(s, "A", 25);
    s = play(s, "B", 25);
    s = play(s, "A", 25);
    s = play(s, "B", 25);
    expect(s.setsWon).toEqual({ A: 2, B: 2 });
    expect(s.currentSet).toBe(5);
    s = play(s, "A", 15);
    expect(s.winner).toBe("A");
    expect(s.setsWon.A).toBe(3);
    // No more points after match end
    const after = awardPoint(s, "B");
    expect(after.score).toEqual(s.score);
    expect(matchWinner(3, 0, std)).toBe("A");
    expect(matchWinner(2, 2, std)).toBeNull();
  });

  test("undo restores score, server, rotation and set state", () => {
    let s = createMatch(teamA, teamB, std, "A");
    s = play(s, "A", 10);
    s = awardPoint(s, "B"); // B receives, wins: rotates
    const beforeLast = s;
    s = play(s, "A", 1);
    expect(s.server).toBe("A");
    const undone = undo(s);
    expect(undone.score).toEqual(beforeLast.score);
    expect(undone.server).toBe(beforeLast.server);
    expect(undone.rotationCount).toEqual(beforeLast.rotationCount);
    expect(ids(undone, "A")).toEqual(ids(beforeLast, "A"));
    expect(undone.currentSet).toBe(beforeLast.currentSet);

    // Undo a set-ending point
    let t = createMatch(teamA, teamB, std, "A");
    t = play(t, "A", 24);
    const pre = t;
    t = awardPoint(t, "A");
    expect(t.setsWon.A).toBe(1);
    const back = undo(t);
    expect(back.setsWon).toEqual(pre.setsWon);
    expect(back.score).toEqual(pre.score);
    expect(back.currentSet).toBe(1);
    expect(back.setResults).toHaveLength(0);
  });

  test("undo with empty history is a safe no-op", () => {
    const s = createMatch(teamA, teamB, std, "A");
    const u = undo(s);
    expect(u.score).toEqual(s.score);
    expect(u.message).toMatch(/nothing to undo/i);
  });

  test("reset restores the selected mode's initial state", () => {
    const practice: MatchConfig = { mode: "practice", practiceTarget: 5, bestOf: 3 };
    let s = createMatch(teamA, teamB, practice, "A");
    s = play(s, "B", 5);
    expect(s.setsWon.B).toBe(1);
    const r = resetMatch(s);
    expect(r.config.mode).toBe("practice");
    expect(r.config.practiceTarget).toBe(5);
    expect(r.score).toEqual({ A: 0, B: 0 });
    expect(r.setsWon).toEqual({ A: 0, B: 0 });
    expect(r.currentSet).toBe(1);
    expect(r.past).toHaveLength(0);
    expect(r.rotationCount).toEqual({ A: 0, B: 0 });
    expect(ids(r, "B")).toEqual(["b1", "b2", "b3", "b4", "b5", "b6"]);
  });

  test("new set restarts both teams in their starting rotation and alternates first serve", () => {
    let s = createMatch(teamA, teamB, std, "A");
    s = awardPoint(s, "B"); // B receives and wins: B rotates once, B serves
    expect(s.rotationCount.B).toBe(1);
    s = play(s, "B", 24); // B wins set 1 (25-0)
    expect(s.setsWon.B).toBe(1);
    expect(s.currentSet).toBe(2);
    expect(s.rotationCount).toEqual({ A: 0, B: 0 });
    expect(ids(s, "B")).toEqual(["b1", "b2", "b3", "b4", "b5", "b6"]);
    expect(s.server).toBe("B"); // set 2: the team that did not serve first in set 1
    s = play(s, "A", 1);
    expect(s.rotationCount.A).toBe(1); // A received, won, rotated
  });

  test("reset keeps the original first server", () => {
    const s = resetMatch(awardPoint(createMatch(teamA, teamB, std, "B"), "A"));
    expect(s.server).toBe("B");
    expect(s.matchFirstServer).toBe("B");
  });

  test("practice mode uses custom target and best-of", () => {
    const practice: MatchConfig = { mode: "practice", practiceTarget: 10, bestOf: 1 };
    let s = createMatch(teamA, teamB, practice, "A");
    s = play(s, "A", 10);
    expect(s.winner).toBe("A");
  });

  test("scores never go negative", () => {
    let s = createMatch(teamA, teamB, std, "A");
    s = undo(undo(s));
    expect(s.score.A).toBeGreaterThanOrEqual(0);
    expect(s.score.B).toBeGreaterThanOrEqual(0);
  });
});
