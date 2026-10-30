import {
  MatchConfig,
  MatchSnapshot,
  MatchState,
  Player,
  TeamId,
  TeamSetup,
} from "../../types/volleyball";
import { getServer, rotateClockwise } from "../rotation/rotationLogic";
import {
  firstServerForSet,
  matchWinner,
  nextServer,
  normalizeConfig,
  other,
  setWinner,
  shouldRotate,
  targetForSet,
} from "./scoringLogic";

export const DEFAULT_CONFIG: MatchConfig = { mode: "standard", practiceTarget: 25, bestOf: 5 };

function snapshotOf(state: MatchState): MatchSnapshot {
  const { past: _past, ...snap } = state;
  return JSON.parse(JSON.stringify(snap)) as MatchSnapshot;
}

export function createMatch(
  teamA: TeamSetup,
  teamB: TeamSetup,
  config: MatchConfig = DEFAULT_CONFIG,
  firstServer: TeamId = "A"
): MatchState {
  const cfg = normalizeConfig(config);
  const starting = {
    A: JSON.parse(JSON.stringify(teamA)) as TeamSetup,
    B: JSON.parse(JSON.stringify(teamB)) as TeamSetup,
  };
  return {
    config: cfg,
    starting,
    lineups: { A: [...starting.A.players], B: [...starting.B.players] },
    rotationCount: { A: 0, B: 0 },
    score: { A: 0, B: 0 },
    setsWon: { A: 0, B: 0 },
    currentSet: 1,
    matchFirstServer: firstServer,
    server: firstServer,
    setResults: [],
    winner: null,
    log: [],
    message: `Set 1 to ${targetForSet(cfg, 1)}. ${starting[firstServer].name} serves first.`,
    past: [],
  };
}

/** Award a rally point. Returns a new state (or the same state with an explanatory message if invalid). */
export function awardPoint(state: MatchState, team: TeamId): MatchState {
  if (state.winner) {
    return { ...state, message: "The match is over. Start a new match or reset to keep playing." };
  }

  const before = snapshotOf(state);
  const rotates = shouldRotate(state.server, team);

  let lineups = { A: [...state.lineups.A], B: [...state.lineups.B] };
  let rotationCount = { ...state.rotationCount };
  if (rotates) {
    lineups[team] = rotateClockwise(lineups[team]);
    rotationCount[team] += 1;
  }

  const score = { ...state.score, [team]: state.score[team] + 1 } as Record<TeamId, number>;
  let server = nextServer(team);
  const teamName = state.starting[team].name;

  let message = rotates
    ? `${teamName} won the rally on the receive and gained the serve, so they rotate. ${getServer(lineups[team]).name} now serves.`
    : `${teamName} won the rally while serving: point, no rotation.`;
  const logEntry = `Set ${state.currentSet}: ${teamName} scores (${score.A}-${score.B})${rotates ? " + rotate" : ""}`;
  const log = [...state.log, logEntry];

  const target = targetForSet(state.config, state.currentSet);
  const sw = setWinner(score.A, score.B, target);

  let setsWon = { ...state.setsWon };
  let setResults = state.setResults;
  let currentSet = state.currentSet;
  let winner: TeamId | null = null;
  let finalScore = score;

  if (sw) {
    setsWon = { ...setsWon, [sw]: setsWon[sw] + 1 } as Record<TeamId, number>;
    setResults = [
      ...setResults,
      { setNumber: state.currentSet, scoreA: score.A, scoreB: score.B, winner: sw },
    ];
    log.push(
      `Set ${state.currentSet} won by ${state.starting[sw].name} ${score.A}-${score.B}`
    );
    winner = matchWinner(setsWon.A, setsWon.B, state.config);
    if (winner) {
      message = `${state.starting[winner].name} wins the match ${setsWon[winner]}-${setsWon[other(winner)]}!`;
      log.push(message);
    } else {
      currentSet += 1;
      finalScore = { A: 0, B: 0 };
      // A new set starts from each team's starting formation, with the first serve alternating.
      lineups = { A: [...state.starting.A.players], B: [...state.starting.B.players] };
      rotationCount = { A: 0, B: 0 };
      server = firstServerForSet(state.matchFirstServer, currentSet);
      message = `${state.starting[sw].name} wins set ${state.currentSet}. Set ${currentSet} goes to ${targetForSet(state.config, currentSet)}; ${state.starting[server].name} serves first and both teams return to their starting rotation.`;
    }
  }

  return {
    ...state,
    lineups,
    rotationCount,
    score: finalScore,
    setsWon,
    currentSet,
    server,
    setResults,
    winner,
    log,
    message,
    past: [...state.past, before],
  };
}

export function undo(state: MatchState): MatchState {
  if (state.past.length === 0) {
    return { ...state, message: "Nothing to undo yet." };
  }
  const prev = state.past[state.past.length - 1];
  // Keep current team names so renaming a team is never undone.
  return {
    ...prev,
    starting: state.starting,
    past: state.past.slice(0, -1),
    message: "Last action undone.",
  };
}

/** Restore the initial state for the current mode and rosters. */
export function resetMatch(
  state: MatchState,
  firstServer: TeamId = state.matchFirstServer
): MatchState {
  return createMatch(state.starting.A, state.starting.B, state.config, firstServer);
}

export function renameTeam(state: MatchState, team: TeamId, name: string): MatchState {
  const trimmed = name.slice(0, 24);
  const starting = {
    ...state.starting,
    [team]: { ...state.starting[team], name: trimmed || (team === "A" ? "Team A" : "Team B") },
  };
  return { ...state, starting };
}

export function currentServerPlayer(state: MatchState): Player {
  return getServer(state.lineups[state.server]);
}
