import seedrandom from "seedrandom";

export type HexColor = `#${string}`;

export default function randomHexColor(seed?: string): HexColor {
  const random = seedrandom(seed);
  return `#${Math.floor(random() * 16777215).toString(16)}`;
}
