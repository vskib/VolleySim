import { TeamId } from "../../types/volleyball";
import { shouldRotate } from "../gameplay/scoringLogic";
import { Pt, mirrorPoint, slotPoint } from "../planner/courtGeometry";

/** One touch (or event) in a rally. `ours` lists your team's positions that are involved. */
export interface RallyStep {
  touch: string;
  title: string;
  text: string;
  from: Pt;
  to: Pt;
  ours: number[];
}

/**
 * A scripted rally. Your team is "A" and plays on the bottom half; the opponent is "B" at the top.
 * `server` is who was serving when the rally began, `winner` is who won it.
 */
export interface RallyScenario {
  id: string;
  label: string;
  intro: string;
  server: TeamId;
  winner: TeamId;
  steps: RallyStep[];
}

export interface RallyResult {
  /** The team that rotates after this rally, or null if nobody does. */
  rotatingTeam: TeamId | null;
  title: string;
  text: string;
}

const pt = (x: number, y: number): Pt => ({ x, y });
const ourSlot = slotPoint;
// Kept for readability when scripting the opponent's side.
export const oppSlot = (position: number): Pt => mirrorPoint(slotPoint(position));

export const SCENARIOS: RallyScenario[] = [
  {
    id: "sideout",
    label: "Receive",
    intro: "The opponent serves and your team is receiving. Watch the three touches that win the rally.",
    server: "B",
    winner: "A",
    steps: [
      {
        touch: "Serve",
        title: "The opponent serves",
        text: "Their Position 1 player serves from behind the end line. Your team is receiving, so nobody is serving for you yet.",
        from: pt(oppSlot(1).x, 3),
        to: pt(30, 90),
        ours: [],
      },
      {
        touch: "Pass",
        title: "First touch: pass",
        text: "The back-row player in Position 5 passes the ball up toward the setter at the net. A good pass is high and close to the net.",
        from: pt(30, 90),
        to: pt(70, 64),
        ours: [5],
      },
      {
        touch: "Set",
        title: "Second touch: set",
        text: "The setter in Position 2 sets the ball to the left-front hitter. Setters usually use their fingertips.",
        from: pt(70, 64),
        to: pt(28, 62),
        ours: [2],
      },
      {
        touch: "Attack",
        title: "Third touch: attack",
        text: "The hitter in Position 4 jumps and hits the ball over the net into the open court.",
        from: pt(28, 62),
        to: pt(62, 22),
        ours: [4],
      },
    ],
  },
  {
    id: "hold",
    label: "Serve & win",
    intro: "Your team serves and wins the rally. See why nobody rotates.",
    server: "A",
    winner: "A",
    steps: [
      {
        touch: "Serve",
        title: "Your team serves",
        text: "The player in Position 1 serves from behind the end line.",
        from: pt(80, 107),
        to: pt(32, 26),
        ours: [1],
      },
      {
        touch: "Return",
        title: "The opponent attacks",
        text: "After their pass, set and attack, the opponent hits the ball down your left side.",
        from: pt(32, 26),
        to: pt(20, 78),
        ours: [],
      },
      {
        touch: "Dig",
        title: "First touch: dig",
        text: "Position 5 digs the ball up toward the setter.",
        from: pt(20, 78),
        to: pt(70, 64),
        ours: [5],
      },
      {
        touch: "Set",
        title: "Second touch: set",
        text: "The setter in Position 2 sets the ball to Position 4.",
        from: pt(70, 64),
        to: pt(28, 62),
        ours: [2],
      },
      {
        touch: "Attack",
        title: "Third touch: attack",
        text: "Position 4 attacks and the ball lands inside the opponent's court.",
        from: pt(28, 62),
        to: pt(70, 20),
        ours: [4],
      },
    ],
  },
  {
    id: "lose",
    label: "Serve & lose",
    intro: "Your team serves but the opponent wins the rally. Who rotates?",
    server: "A",
    winner: "B",
    steps: [
      {
        touch: "Serve",
        title: "Your team serves",
        text: "The player in Position 1 serves into the opponent's court.",
        from: pt(80, 107),
        to: pt(50, 22),
        ours: [1],
      },
      {
        touch: "Attack",
        title: "The opponent attacks",
        text: "They pass, set and then hit the ball toward your back-right corner.",
        from: pt(50, 22),
        to: pt(76, 90),
        ours: [],
      },
      {
        touch: "Floor",
        title: "The ball lands",
        text: "Your team cannot dig it up and the ball hits the floor inside your court. The opponent wins the rally.",
        from: pt(76, 90),
        to: pt(76, 90),
        ours: [1],
      },
    ],
  },
];

export function getScenario(id: string): RallyScenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}

/** Applies the real rotation rule to a scripted rally and explains the outcome. */
export function resolveScenario(scenario: RallyScenario): RallyResult {
  const rotates = shouldRotate(scenario.server, scenario.winner);
  if (!rotates) {
    return {
      rotatingTeam: null,
      title: "Point, no rotation",
      text: "Your team was already serving and won the rally, so it scores a point and keeps serving. Nobody rotates.",
    };
  }
  if (scenario.winner === "A") {
    return {
      rotatingTeam: "A",
      title: "Side-out: your team rotates",
      text: "Your team was receiving and won the rally, so it earns the serve. Everyone moves one spot clockwise and the player from Position 2 steps into Position 1 to serve.",
    };
  }
  return {
    rotatingTeam: "B",
    title: "The opponent rotates",
    text: "The opponent was receiving and won the rally, so they gain the serve and rotate. Your team does not rotate: losing a rally while serving never rotates you, but you lose the serve.",
  };
}

export { ourSlot };
