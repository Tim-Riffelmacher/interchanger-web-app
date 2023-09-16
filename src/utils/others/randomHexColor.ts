import seedrandom from "seedrandom";

export type HexColor = `#${string}`;

/**
 * Calculates a random hex color.
 */
export default function randomHexColor(seed?: string): HexColor {
  const random = seedrandom(seed);

  let colorStr = Math.floor(random() * 16777215).toString(16);
  while (colorStr.length < 6) {
    colorStr += "0";
  }
  return `#${colorStr}`;
}
