import { Player } from "../../types/volleyball";

export const POSITION_COUNT = 6;

/**
 * Lineup arrays are indexed by position: index 0 = Position 1 ... index 5 = Position 6.
 *
 * A clockwise rotation moves each player to the next position in the
 * order 2 -> 1 -> 6 -> 5 -> 4 -> 3 -> 2. So the player in Position 2 moves
 * into Position 1 (and becomes the server), and the old server moves to Position 6.
 */
export function rotateClockwise<T>(lineup: T[]): T[] {
  if (lineup.length !== POSITION_COUNT) {
    throw new Error("A lineup must contain exactly six players.");
  }
  return lineup.map((_, i) => lineup[(i + 1) % POSITION_COUNT]);
}

/** Rotate `times` steps (0 returns a copy). */
export function rotateBy<T>(lineup: T[], times: number): T[] {
  let result = [...lineup];
  const steps = ((times % POSITION_COUNT) + POSITION_COUNT) % POSITION_COUNT;
  for (let i = 0; i < steps; i++) result = rotateClockwise(result);
  return result;
}

/** Rotation number from 1 to 6 given how many rotations have happened. */
export function rotationNumber(rotationCount: number): number {
  return (((rotationCount % POSITION_COUNT) + POSITION_COUNT) % POSITION_COUNT) + 1;
}

/** The player currently serving: whoever is in Position 1. */
export function getServer(lineup: Player[]): Player {
  return lineup[0];
}

export function isFrontRow(positionIndex: number): boolean {
  // Positions 2, 3, 4 (indexes 1, 2, 3) are front row.
  return positionIndex >= 1 && positionIndex <= 3;
}

export function defaultPlayers(prefix: string): Player[] {
  return Array.from({ length: POSITION_COUNT }, (_, i) => ({
    id: `${prefix}${i + 1}`,
    name: `Player ${i + 1}`,
    number: i + 1,
    isSetter: i === 0,
    isLibero: false,
  }));
}

export function validateLineup(players: Player[]): string | null {
  if (players.length !== POSITION_COUNT) return "A lineup needs exactly six players.";
  const numbers = new Set<number>();
  for (const p of players) {
    if (!p.name.trim()) return "Every player needs a name.";
    if (!Number.isInteger(p.number) || p.number < 0 || p.number > 99)
      return "Jersey numbers must be between 0 and 99.";
    if (numbers.has(p.number)) return `Jersey number ${p.number} is used twice.`;
    numbers.add(p.number);
  }
  if (players.filter((p) => p.isSetter).length !== 1) return "Choose exactly one setter.";
  if (players.filter((p) => p.isLibero).length > 1) return "Only one libero can be marked.";
  return null;
}
