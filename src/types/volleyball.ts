export type TeamId = "A" | "B";

export interface Player {
  id: string;
  name: string;
  number: number;
  isSetter: boolean;
  isLibero: boolean;
}

/** A team's starting lineup. players[0] is Position 1, players[5] is Position 6. */
export interface TeamSetup {
  name: string;
  players: Player[];
}

export type MatchMode = "standard" | "practice";

export interface MatchConfig {
  mode: MatchMode;
  /** Used only in practice mode: target score for every set. */
  practiceTarget: number;
  /** Used only in practice mode: 1, 3 or 5. Standard is always 5. */
  bestOf: number;
}

export interface SetResult {
  setNumber: number;
  scoreA: number;
  scoreB: number;
  winner: TeamId;
}

export interface MatchSnapshot {
  config: MatchConfig;
  starting: Record<TeamId, TeamSetup>;
  lineups: Record<TeamId, Player[]>;
  rotationCount: Record<TeamId, number>;
  score: Record<TeamId, number>;
  setsWon: Record<TeamId, number>;
  currentSet: number;
  /** Team that served first in set 1. Later sets alternate (set 2 the other team, and so on). */
  matchFirstServer: TeamId;
  server: TeamId;
  setResults: SetResult[];
  winner: TeamId | null;
  log: string[];
  message: string;
}

export interface MatchState extends MatchSnapshot {
  /** Previous states, newest last. Used by undo. */
  past: MatchSnapshot[];
}
