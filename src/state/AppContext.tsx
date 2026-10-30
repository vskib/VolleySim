import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  MatchConfig,
  MatchSnapshot,
  MatchState,
  Player,
  TeamId,
  TeamSetup,
} from "../types/volleyball";
import { defaultPlayers } from "../features/rotation/rotationLogic";
import {
  awardPoint,
  createMatch,
  renameTeam as renameTeamInMatch,
  resetMatch,
  undo as undoMatch,
} from "../features/gameplay/matchState";
import { KEYS, clearAll, loadJSON, removeKey, saveJSON } from "../utils/storage";

export interface Settings {
  showNames: boolean;
  saveProgress: boolean;
}

export interface RecentMatch {
  id: string;
  date: string;
  teamA: string;
  teamB: string;
  setsA: number;
  setsB: number;
  setScores: string;
  winner: TeamId;
}

type Teams = Record<TeamId, TeamSetup>;

const DEFAULT_TEAMS: Teams = {
  A: { name: "Team A", players: defaultPlayers("a") },
  B: { name: "Team B", players: defaultPlayers("b") },
};
const DEFAULT_SETTINGS: Settings = { showNames: true, saveProgress: true };
const MAX_SAVED_UNDO = 20;

interface AppContextValue {
  ready: boolean;
  teams: Teams;
  settings: Settings;
  recent: RecentMatch[];
  match: MatchState | null;
  setTeam: (team: TeamId, setup: TeamSetup) => void;
  renameTeam: (team: TeamId, name: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  startMatch: (config: MatchConfig, firstServer: TeamId) => void;
  award: (team: TeamId) => void;
  undo: () => void;
  reset: () => void;
  endMatch: () => void;
  clearEverything: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function syncSnapshot<T extends MatchSnapshot>(s: T, team: TeamId, setup: TeamSetup): T {
  const byId = new Map(setup.players.map((p) => [p.id, p]));
  const mapPlayers = (arr: Player[]) => arr.map((p) => byId.get(p.id) ?? p);
  return {
    ...s,
    lineups: { ...s.lineups, [team]: mapPlayers(s.lineups[team]) },
    starting: {
      ...s.starting,
      [team]: { name: setup.name, players: mapPlayers(s.starting[team].players) },
    },
  };
}

function syncMatch(m: MatchState, team: TeamId, setup: TeamSetup): MatchState {
  const synced = syncSnapshot(m, team, setup);
  return { ...synced, past: m.past.map((p) => syncSnapshot(p, team, setup)) };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [teams, setTeams] = useState<Teams>(DEFAULT_TEAMS);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [recent, setRecent] = useState<RecentMatch[]>([]);
  const [match, setMatch] = useState<MatchState | null>(null);

  useEffect(() => {
    (async () => {
      const [t, s, r, m] = await Promise.all([
        loadJSON<Teams>(KEYS.teams, DEFAULT_TEAMS),
        loadJSON<Settings>(KEYS.settings, DEFAULT_SETTINGS),
        loadJSON<RecentMatch[]>(KEYS.recent, []),
        loadJSON<MatchState | null>(KEYS.match, null),
      ]);
      setTeams(t);
      setSettings({ ...DEFAULT_SETTINGS, ...s });
      setRecent(r);
      setMatch(
        m && m.lineups && m.starting && m.score
          ? { ...m, past: m.past ?? [], matchFirstServer: m.matchFirstServer ?? m.server }
          : null
      );
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (ready) saveJSON(KEYS.teams, teams);
  }, [teams, ready]);
  useEffect(() => {
    if (ready) saveJSON(KEYS.settings, settings);
  }, [settings, ready]);
  useEffect(() => {
    if (ready) saveJSON(KEYS.recent, recent);
  }, [recent, ready]);
  useEffect(() => {
    if (!ready) return;
    if (match && settings.saveProgress) {
      saveJSON(KEYS.match, { ...match, past: match.past.slice(-MAX_SAVED_UNDO) });
    } else {
      removeKey(KEYS.match);
    }
  }, [match, settings.saveProgress, ready]);

  const setTeam = useCallback((team: TeamId, setup: TeamSetup) => {
    setTeams((prev) => ({ ...prev, [team]: setup }));
    setMatch((prev) => (prev ? syncMatch(prev, team, setup) : prev));
  }, []);

  const renameTeam = useCallback((team: TeamId, name: string) => {
    setTeams((prev) => ({ ...prev, [team]: { ...prev[team], name } }));
    setMatch((prev) => (prev ? renameTeamInMatch(prev, team, name) : prev));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const startMatch = useCallback(
    (config: MatchConfig, firstServer: TeamId) => {
      setMatch(createMatch(teams.A, teams.B, config, firstServer));
    },
    [teams]
  );

  const award = useCallback(
    (team: TeamId) => {
      if (!match) return;
      const next = awardPoint(match, team);
      setMatch(next);
      if (next.winner && !match.winner) {
        const entry: RecentMatch = {
          id: String(Date.now()),
          date: new Date().toLocaleDateString(),
          teamA: next.starting.A.name,
          teamB: next.starting.B.name,
          setsA: next.setsWon.A,
          setsB: next.setsWon.B,
          setScores: next.setResults.map((r) => `${r.scoreA}-${r.scoreB}`).join(", "),
          winner: next.winner,
        };
        setRecent((prev) => [entry, ...prev].slice(0, 5));
      }
    },
    [match]
  );

  const undo = useCallback(() => setMatch((prev) => (prev ? undoMatch(prev) : prev)), []);
  const reset = useCallback(() => setMatch((prev) => (prev ? resetMatch(prev) : prev)), []);
  const endMatch = useCallback(() => setMatch(null), []);

  const clearEverything = useCallback(() => {
    setTeams(DEFAULT_TEAMS);
    setSettings(DEFAULT_SETTINGS);
    setRecent([]);
    setMatch(null);
    clearAll(Object.values(KEYS));
  }, []);

  const value = useMemo(
    () => ({
      ready,
      teams,
      settings,
      recent,
      match,
      setTeam,
      renameTeam,
      updateSettings,
      startMatch,
      award,
      undo,
      reset,
      endMatch,
      clearEverything,
    }),
    [ready, teams, settings, recent, match, setTeam, renameTeam, updateSettings, startMatch, award, undo, reset, endMatch, clearEverything]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
