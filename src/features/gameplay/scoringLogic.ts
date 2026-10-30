import { MatchConfig, TeamId } from "../../types/volleyball";

export const STANDARD_SET_TARGET = 25;
export const STANDARD_DECIDING_TARGET = 15;
export const WIN_BY = 2;

export function other(team: TeamId): TeamId {
  return team === "A" ? "B" : "A";
}

export function setsToWinMatch(config: MatchConfig): number {
  const bestOf = config.mode === "standard" ? 5 : config.bestOf;
  return Math.floor(bestOf / 2) + 1;
}

export function isDecidingSet(config: MatchConfig, setNumber: number): boolean {
  const bestOf = config.mode === "standard" ? 5 : config.bestOf;
  return setNumber === bestOf;
}

/** Points needed to win the given set. */
export function targetForSet(config: MatchConfig, setNumber: number): number {
  if (config.mode === "practice") return Math.max(1, Math.floor(config.practiceTarget));
  return isDecidingSet(config, setNumber) ? STANDARD_DECIDING_TARGET : STANDARD_SET_TARGET;
}

/** Returns the winning team if the set is over, otherwise null. */
export function setWinner(scoreA: number, scoreB: number, target: number): TeamId | null {
  const top = Math.max(scoreA, scoreB);
  if (top < target) return null;
  if (Math.abs(scoreA - scoreB) < WIN_BY) return null;
  return scoreA > scoreB ? "A" : "B";
}

export function matchWinner(setsA: number, setsB: number, config: MatchConfig): TeamId | null {
  const needed = setsToWinMatch(config);
  if (setsA >= needed) return "A";
  if (setsB >= needed) return "B";
  return null;
}

/**
 * Rotation rule: only a team that wins a rally while RECEIVING serve
 * gains the serve and rotates. A serving team that wins just scores.
 */
export function shouldRotate(currentServer: TeamId, rallyWinner: TeamId): boolean {
  return currentServer !== rallyWinner;
}

/** Serving team after a rally. The rally winner always serves next. */
export function nextServer(rallyWinner: TeamId): TeamId {
  return rallyWinner;
}

/**
 * Team that serves first in a given set. Sets alternate the first server
 * (odd sets: the match's first server, even sets: the other team).
 * Real deciding sets use a new coin toss; alternating keeps the simulator simple.
 */
export function firstServerForSet(matchFirstServer: TeamId, setNumber: number): TeamId {
  return setNumber % 2 === 1 ? matchFirstServer : other(matchFirstServer);
}

export function normalizeConfig(config: MatchConfig): MatchConfig {
  const target = Number.isFinite(config.practiceTarget) ? Math.floor(config.practiceTarget) : 25;
  const bestOf = [1, 3, 5].includes(config.bestOf) ? config.bestOf : 3;
  return {
    mode: config.mode,
    practiceTarget: Math.min(50, Math.max(1, target)),
    bestOf,
  };
}
