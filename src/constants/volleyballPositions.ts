export interface PositionInfo {
  position: number;
  name: string;
  row: "Front" | "Back";
  description: string;
  /** Court coordinates in a 0-100 (x) by 0-100 (y) space; net is at y = 50. Bottom half is the team's side. */
  x: number;
  y: number;
}

/**
 * Court is drawn from above. The team's own half is the bottom half, facing the net.
 * Positions are numbered counter-clockwise starting at the right back (the server).
 */
export const POSITIONS: PositionInfo[] = [
  {
    position: 1,
    name: "Right Back",
    row: "Back",
    description:
      "The server's spot. Whoever stands here serves the ball when the team has the serve. Back-row players may attack only from behind the 3-meter line.",
    x: 80,
    y: 88,
  },
  {
    position: 2,
    name: "Right Front",
    row: "Front",
    description:
      "Front-row spot next to the right sideline. Players here can attack at the net and block. Often used by the opposite hitter.",
    x: 80,
    y: 64,
  },
  {
    position: 3,
    name: "Middle Front",
    row: "Front",
    description:
      "Center of the front row. Often where the middle blocker plays, running quick attacks and blocking in the middle.",
    x: 50,
    y: 64,
  },
  {
    position: 4,
    name: "Left Front",
    row: "Front",
    description:
      "Front-row spot at the left sideline. Typically an outside hitter's spot, where most high sets are sent.",
    x: 20,
    y: 64,
  },
  {
    position: 5,
    name: "Left Back",
    row: "Back",
    description:
      "Back-row spot at the left. Strong passers and defenders, such as the libero or an outside hitter, usually cover here.",
    x: 20,
    y: 88,
  },
  {
    position: 6,
    name: "Middle Back",
    row: "Back",
    description:
      "Center of the back row. A key defensive and passing spot, commonly covered by the libero.",
    x: 50,
    y: 88,
  },
];

export const ROLES = [
  {
    name: "Setter",
    text: "Runs the offense. Usually takes the second touch and sets the ball to a hitter.",
  },
  {
    name: "Outside Hitter",
    text: "Attacks from the left side and also passes serve receive. Gets many of the team's sets.",
  },
  {
    name: "Middle Blocker",
    text: "Blocks in the middle and attacks quick sets. Often replaced by the libero in the back row.",
  },
  {
    name: "Opposite Hitter",
    text: "Attacks from the right side, lines up opposite the setter, and blocks the other team's best outside hitter.",
  },
  {
    name: "Libero",
    text: "Defensive specialist in a different color jersey. Plays only in the back row, cannot attack above the net or serve in most rules, and can swap in and out freely.",
  },
];
